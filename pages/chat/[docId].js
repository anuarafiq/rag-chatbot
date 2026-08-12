import React, { useState } from "react";
import ChatMessage from "../../components/ChatMessage";
import ChunkSourceList from "../../components/ChunkSourceList";
import prisma from "../../lib/db";

export async function getServerSideProps({ params }) {
  const document = await prisma.document.findUnique({ where: { id: params.docId } });
  if (!document) return { notFound: true };
  return {
    props: { docId: document.id, title: document.title, status: document.status },
  };
}

const ChatDocPage = ({ docId, title, status }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  if (status !== "EMBEDDED") {
    return (
      <div>
        <h1>{title}</h1>
        <p>Document is {status.toLowerCase()} — chat becomes available once it's fully embedded.</p>
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
              sources: data.sources.map(
                (s) => `Chunk #${s.chunkIndex} (sim ${s.similarity.toFixed(2)}): "${s.content.slice(0, 120)}…"`
              ),
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
    <div>
      <h1>{title}</h1>
      {messages.map((m, i) => (
        <div key={i}>
          <ChatMessage sender={m.sender} message={m.message} />
          {m.sources && <ChunkSourceList sources={m.sources} />}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this document"
          style={{ width: "70%" }}
        />
        <button type="submit" disabled={sending}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatDocPage;
