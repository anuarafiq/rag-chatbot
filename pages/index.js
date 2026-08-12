import React from "react";
import Link from "next/link";

const HomePage = () => (
  <div>
    <h1>Document RAG Chatbot</h1>
    <p>Upload a PDF and ask questions about it, with answers grounded in the document.</p>
    <Link href="/documents">Go to documents</Link>
  </div>
);

export default HomePage;
