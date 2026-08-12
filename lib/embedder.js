const MODEL = 'embed-english-v3.0';
const BATCH_SIZE = 96; // Cohere embed v3 request limit

async function callCohere(texts, inputType) {
  const res = await fetch('https://api.cohere.com/v2/embed', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      texts,
      model: MODEL,
      input_type: inputType,
      embedding_types: ['float'],
    }),
  });
  if (!res.ok) {
    throw new Error(`Cohere embed failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.embeddings.float;
}

// inputType: 'search_document' for chunks being indexed, 'search_query' for
// a user's chat question — Cohere's v3 models are trained to embed these
// differently, which improves retrieval quality over a single generic mode.
async function embedTexts(texts, inputType = 'search_document') {
  const out = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const embeddings = await callCohere(batch, inputType);
    out.push(...embeddings);
  }
  return out;
}

module.exports = { embedTexts };
