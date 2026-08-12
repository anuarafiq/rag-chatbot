const fs = require('fs/promises');
const os = require('os');
const crypto = require('crypto');
const { formidable } = require('formidable');
const pdfParse = require('pdf-parse');
const prisma = require('../../lib/db');

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = formidable({ uploadDir: os.tmpdir(), keepExtensions: true, maxFiles: 1 });
  const [, files] = await form.parse(req);
  const file = files.file?.[0];
  if (!file) return res.status(400).json({ error: 'No file uploaded (expected field "file")' });

  const filepath = file.filepath;
  try {
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only application/pdf uploads are supported' });
    }

    const buffer = await fs.readFile(filepath);
    const { text, numpages } = await pdfParse(buffer);
    const textHash = crypto.createHash('sha256').update(text).digest('hex');

    const existing = await prisma.document.findUnique({ where: { textHash } });
    if (existing) {
      return res.status(200).json({ documentId: existing.id, status: existing.status, deduped: true });
    }

    const title = file.originalFilename?.replace(/\.pdf$/i, '') || 'Untitled document';
    const document = await prisma.document.create({
      data: {
        title,
        content: text,
        textHash,
        status: 'PENDING',
        pageCount: numpages,
        charCount: text.length,
      },
    });

    return res.status(201).json({ documentId: document.id, title: document.title, status: document.status });
  } catch (err) {
    console.error('upload failed', err);
    return res.status(500).json({ error: 'Failed to process PDF' });
  } finally {
    // Discard the original PDF — only extracted text/chunks/embeddings persist.
    await fs.unlink(filepath).catch(() => {});
  }
}
