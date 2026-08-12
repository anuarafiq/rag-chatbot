const prisma = require('../../lib/db');
const { embedTexts } = require('../../lib/embedder');
const { searchSimilarChunks } = require('../../lib/vectorSearch');
const { streamAnswer } = require('../../lib/groqRAG');

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { docId, query } = req.body;
  if (!docId || !query) return res.status(400).json({ error: 'docId and query are required' });

  const document = await prisma.document.findUnique({ where: { id: docId } });
  if (!document) return res.status(404).json({ error: 'Document not found' });
  if (document.status !== 'EMBEDDED') {
    return res.status(400).json({ error: `Document is not ready (status: ${document.status})` });
  }

  // One small embedding call for this turn's query — not re-embedding the
  // document, so this doesn't trigger the duplicate-embedding cost guard.
  // 'search_query' mode (vs. the chunk-indexing default 'search_document')
  // is how Cohere's v3 models expect a question to be embedded.
  const [queryEmbedding] = await embedTexts([query], 'search_query');
  const topChunks = await searchSimilarChunks(docId, queryEmbedding, 5);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  try {
    const stream = await streamAnswer(query, topChunks);
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) res.write(`data: ${JSON.stringify({ type: 'text', delta })}\n\n`);
    }

    res.write(
      `data: ${JSON.stringify({
        type: 'citations',
        sources: topChunks.map((c) => ({
          chunkIndex: c.chunkIndex,
          content: c.content,
          similarity: c.similarity,
        })),
      })}\n\n`
    );
    res.write('data: [DONE]\n\n');
  } catch (err) {
    console.error('chat stream failed', err);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Answer generation failed' })}\n\n`);
  } finally {
    res.end();
  }
}
