# RAG Chatbot

Upload a PDF, ask questions about it, get streamed answers with inline citations back to the source chunks.

## Stack

- **Next.js 14** (Pages Router) - UI + API routes
- **Prisma + Postgres (Supabase)** - document/chunk storage, with `pgvector` for embeddings
- **Cohere `embed-english-v3.0`** - 1024-dim embeddings
- **Groq (`llama-3.3-70b-versatile`)** - answer generation, via the OpenAI SDK against Groq's OpenAI-compatible endpoint

## How it works

1. **Upload** (`/api/upload`) - PDF text is extracted with `pdf-parse`, hashed (`sha256`) for dedup, and stored as a `Document` row. The original PDF is discarded; only extracted text persists.
2. **Process** (`/api/process`) - text is split into ~500-token chunks (50-token overlap) via `lib/chunker.js`, embedded in batches of 96 via Cohere, and stored as `Chunk` rows with a `vector(1024)` column.
3. **Chat** (`/api/chat`) - the query is embedded (`search_query` mode), the top-5 nearest chunks are pulled from Postgres via `pgvector` cosine distance, and Groq streams an answer over SSE with citations back to the source chunks.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` / `DIRECT_URL` - Supabase Postgres (pooled + direct)
   - `COHERE_API_KEY`
   - `GROQ_API_KEY` (and optionally `GROQ_MODEL`, defaults to `llama-3.3-70b-versatile`)

3. Enable `pgvector` on the database (`sql/enable-pgvector.sql`), then run migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

## Project layout

- `pages/api/` - upload, process, chat endpoints
- `pages/chat/[docId].js` - chat UI for a document
- `lib/` - chunking, embedding, vector search, and Groq RAG prompt logic
- `prisma/schema.prisma` - `Document` / `Chunk` models
