# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: the developer/owner, using this as a real daily tool to upload PDFs and ask questions against them, not a one-off demo. Single-user context (no auth/multi-tenant in the code) — this person is both the uploader and the asker.

## Product Purpose

Ground answers to questions about a specific PDF in that PDF's own text, so the user doesn't have to re-read or re-search the document by hand. Success is a fast round trip: upload → wait for embedding → ask → get an answer with the exact source chunks it came from.

## Positioning

Retrieval is scoped per-document (chat is always `/chat/[docId]`, vector search is filtered to that `documentId`) — this isn't a general knowledge-base chatbot, it's "interrogate this one PDF." Answers cite back to the literal chunk text they're grounded in, not just a vague "based on the document."

## Operating Context

- Workflow: upload a PDF on `/documents` → server extracts text, dedupes by content hash, chunks + embeds it (async-feeling but currently synchronous per request) → once `status === EMBEDDED`, open `/chat/[docId]` and ask questions → answers stream token-by-token (SSE) with cited chunks shown after.
- Document lifecycle has explicit states the UI must represent: `PENDING`, `PROCESSING`, `EMBEDDED`, `FAILED`. A document isn't chattable until `EMBEDDED`.
- Real documents can be long (many pages, many chunks) — the documents list and citation lists need to stay usable as those numbers grow, not just look fine with 1-2 items.

## Capabilities and Constraints

- Only PDF upload is supported (rejected server-side otherwise).
- One PDF = one isolated chat scope; no cross-document search.
- No auth currently — single user, trusted environment.
- Chat is streamed via raw SSE (fetch + ReadableStream), not a websocket — UI must handle incremental token arrival and a distinct "sources arrived" event.

## Evidence on Hand

No logo, brand assets, or existing visual identity. No screenshots or user research. Current UI is fully unstyled (default browser HTML), so there is no incumbent visual world to preserve.

## Product Principles

1. The document and its citations are the content — chrome should stay out of their way, especially at longer lengths (many chunks, many pages).
2. Never hide which lifecycle state a document is in; a stuck/failed document should be obvious, not silently unusable.
3. Streaming should feel alive (visible incremental progress), not like a spinner blocking a wall.
4. Optimize for the user doing this again tomorrow, not for a first-impression demo — familiar, fast, low-friction over decorative.
