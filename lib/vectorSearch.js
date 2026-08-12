const prisma = require('./db');

// documentId-scoped: chat is per-document (/chat/[docId]), so a search must
// never leak chunks from other uploaded PDFs.
async function searchSimilarChunks(documentId, queryEmbedding, topK = 5) {
  if (!Array.isArray(queryEmbedding) || !queryEmbedding.every(Number.isFinite)) {
    throw new Error('queryEmbedding must be an array of finite numbers');
  }
  const vectorLiteral = `[${queryEmbedding.join(',')}]`;

  return prisma.$queryRaw`
    SELECT id, "chunkIndex", content, "tokenCount",
           1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
    FROM "Chunk"
    WHERE "documentId" = ${documentId}
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT ${topK}
  `;
}

module.exports = { searchSimilarChunks };
