import React from "react";
import Link from "next/link";
import styles from "./index.module.css";

const HomePage = () => (
  <div className={styles.hero}>
    <div className={styles.card}>
      <h1 className={styles.title}>Document RAG Chatbot</h1>
      <p className={styles.description}>
        Upload a PDF and ask questions about it. Answers are grounded in the document&rsquo;s own
        text, with the exact source passages cited alongside each reply.
      </p>
      <Link href="/documents" className={styles.cta}>
        Go to documents
      </Link>
    </div>
  </div>
);

export default HomePage;
