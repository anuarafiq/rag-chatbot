const { encode, decode } = require('gpt-tokenizer');

// 500 tokens keeps a paragraph/idea intact for retrieval without diluting
// similarity across topics; 50 (10%) overlap stops a sentence from being
// silently cut at a chunk boundary. Top-5 * 500 = 2500 tokens max context,
// nowhere near any Claude model's window.
const CHUNK_SIZE_TOKENS = 500;
const CHUNK_OVERLAP_TOKENS = 50;

function chunkText(text, { chunkSize = CHUNK_SIZE_TOKENS, overlap = CHUNK_OVERLAP_TOKENS } = {}) {
  if (!text || !text.trim()) return [];
  if (overlap >= chunkSize) throw new Error('overlap must be < chunkSize');

  const tokens = encode(text);
  const step = chunkSize - overlap;
  const chunks = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < tokens.length) {
    const end = Math.min(start + chunkSize, tokens.length);
    const slice = tokens.slice(start, end);
    chunks.push({ chunkIndex: chunkIndex++, content: decode(slice), tokenCount: slice.length });
    if (end === tokens.length) break;
    start += step;
  }
  return chunks;
}

module.exports = { chunkText, CHUNK_SIZE_TOKENS, CHUNK_OVERLAP_TOKENS };
