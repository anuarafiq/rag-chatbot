const prisma = require('../../lib/db');
const { chunkText } = require('../../lib/chunker');
const { embedTexts } = require('../../lib/embedder');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { documentId } = req.body;
  if (!documentId) return res.status(400).json({ error: 'documentId is required' });

  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) return res.status(404).json({ error: 'Document not found' });

  // Cost guard: already-embedded documents are a no-op, no chunker/embedder call.
  if (document.status === 'EMBEDDED') {
    return res.status(200).json({ status: 'EMBEDDED', skipped: true });
  }

  try {
    await prisma.document.update({ where: { id: documentId }, data: { status: 'PROCESSING' } });

    const chunks = chunkText(document.content);
    const embeddings = await embedTexts(chunks.map((c) => c.content));

    await prisma.$transaction(async (tx) => {
      // Safe to re-run from any non-EMBEDDED state (PENDING/FAILED/crashed mid-PROCESSING).
      await tx.chunk.deleteMany({ where: { documentId } });
      for (let i = 0; i < chunks.length; i++) {
        const vectorLiteral = `[${embeddings[i].join(',')}]`;
        await tx.$executeRaw`
          INSERT INTO "Chunk" (id, "documentId", "chunkIndex", content, "tokenCount", embedding, "createdAt")
          VALUES (gen_random_uuid()::text, ${documentId}, ${chunks[i].chunkIndex}, ${chunks[i].content}, ${chunks[i].tokenCount}, ${vectorLiteral}::vector, now())
        `;
      }
      await tx.document.update({ where: { id: documentId }, data: { status: 'EMBEDDED' } });
    });

    return res.status(200).json({ status: 'EMBEDDED', chunkCount: chunks.length });
  } catch (err) {
    console.error('process failed', err);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED', errorMessage: String(err.message || err) },
    });
    return res.status(500).json({ error: 'Failed to process document' });
  }
}
