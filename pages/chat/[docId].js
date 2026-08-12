import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ChatMessage from "../../components/ChatMessage";
import ChunkSourceList from "../../components/ChunkSourceList";
import StatusBadge from "../../components/StatusBadge";
import prisma from "../../lib/db";
import styles from "./[docId].module.css";

export async function getServerSideProps({ params }) {
  const document = await prisma.document.findUnique({ where: { id: params.docId } });
  if (!document) return { notFound: true };
  return {
    props: { docId: document.id, title: document.title, status: document.status },
  };
}

const STATUS_COPY = {
  PENDING: "This document is queued for embedding. Chat opens up once it's ready.",
  PROCESSING: "This document is being chunked and embedded right now. Chat opens up once it's ready.",
  FAILED: "Embedding failed for this document, so it can't be chatted with. Try re-uploading it.",
};

const ChatDocPage = ({ docId, title, status }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (status !== "EMBEDDED") {
    return (
      <div className={styles.statusPage}>
        <div className={styles.statusCard}>
          <StatusBadge status={status} />
          <h1 className={styles.statusTitle}>{title}</h1>
          <p className={styles.statusDescription}>{STATUS_COPY[status]}</p>
          <Link href="/documents" className={styles.backLink}>
            Back to documents
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || sending) return;

    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { sender: "You", message: query }, { sender: "Assistant", message: "" }]);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId, query }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop();

      for (const event of events) {
        const line = event.trim();
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") continue;

        const data = JSON.parse(payload);
        if (data.type === "text") {
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              ...next[next.length - 1],
              message: next[next.length - 1].message + data.delta,
            };
            return next;
          });
        } else if (data.type === "citations") {
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              ...next[next.length - 1],
              sources: data.sources.map((s) => ({
                chunkIndex: s.chunkIndex,
                similarity: s.similarity,
                content: s.content.length > 140 ? `${s.content.slice(0, 140)}…` : s.content,
              })),
            };
            return next;
          });
        } else if (data.type === "error") {
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { ...next[next.length - 1], message: `Error: ${data.message}` };
            return next;
          });
        }
      }
    }

    setSending(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.docHeader}>
        <div className={styles.docTitle}>{title}</div>
      </div>

      <div className={styles.messages} ref={messagesRef}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>Ask a question about this document to get started.</div>
        ) : (
          messages.map((m, i) => (
            <React.Fragment key={i}>
              <ChatMessage sender={m.sender} message={m.message} streaming={sending && i === messages.length - 1 && m.sender === "Assistant"} />
              {m.sources ? <ChunkSourceList sources={m.sources} /> : null}
            </React.Fragment>
          ))
        )}
      </div>

      <form className={styles.inputBar} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this document"
          disabled={sending}
        />
        <button type="submit" className={styles.sendButton} disabled={sending || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatDocPage;
