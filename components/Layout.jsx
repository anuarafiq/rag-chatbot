import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./Layout.module.css";

const Layout = ({ children }) => {
  const { pathname } = useRouter();
  const onDocuments = pathname.startsWith("/documents") || pathname.startsWith("/chat");

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.wordmark}>
            Document RAG Chatbot
          </Link>
          <nav className={styles.nav}>
            <Link href="/documents" className={`${styles.navLink} ${onDocuments ? styles.navLinkActive : ""}`}>
              Documents
            </Link>
          </nav>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </>
  );
};

export default Layout;
