const OpenAI = require('openai');

// Groq's API is OpenAI-compatible, so the already-installed openai SDK
// works against it with just a different baseURL — no groq-sdk dependency needed.
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

function buildPrompt(query, chunks) {
  const context = chunks
    .map((c, i) => `[${i + 1}] (chunk #${c.chunkIndex}): "${c.content}"`)
    .join('\n\n');
  const system =
    'You are a helpful assistant that answers questions using ONLY the provided ' +
    'document excerpts. If the answer is not contained in the excerpts, say you ' +
    "don't know. Cite excerpts inline like [1], [2] where relevant.";
  const user = `Context excerpts:\n${context}\n\nQuestion: ${query}`;
  return { system, user };
}

// Returns an async-iterable stream of OpenAI-compatible chunks — the caller
// (pages/api/chat.js) owns SSE writing. Citations aren't parsed from the
// streamed text: they're already known from the vector search that ran
// before this call, and get sent as a separate event.
async function streamAnswer(query, chunks) {
  const { system, user } = buildPrompt(query, chunks);
  return client.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    stream: true,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
}

module.exports = { streamAnswer, buildPrompt };
