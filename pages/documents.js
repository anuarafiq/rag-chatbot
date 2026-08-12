import React, { useState } from "react";
import { useRouter } from "next/router";
import PdfUploader from "../components/PdfUploader";
import DocumentCard from "../components/DocumentCard";
import prisma from "../lib/db";
import styles from "./documents.module.css";

export async function getServerSideProps() {
  const documents = await prisma.document.findMany({ orderBy: { createdAt: "desc" } });
  return {
    props: {
      documents: documents.map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        pageCount: d.pageCount,
        errorMessage: d.errorMessage,
      })),
    },
  };
}

const DocumentsPage = ({ documents }) => {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setError(uploadData.error || "Upload failed");
        return;
      }

      if (!uploadData.deduped) {
        await fetch("/api/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: uploadData.documentId }),
        });
      }

      router.replace(router.asPath);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Documents</h1>
      <PdfUploader onUpload={handleUpload} uploading={uploading} error={error} />

      <div className={styles.list}>
        <span className={styles.sectionLabel}>
          {documents.length} document{documents.length === 1 ? "" : "s"}
        </span>
        {documents.length === 0 ? (
          <p className={styles.empty}>No documents yet. Upload a PDF to get started.</p>
        ) : (
          documents.map((d) => (
            <DocumentCard
              key={d.id}
              title={d.title}
              status={d.status}
              pageCount={d.pageCount}
              errorMessage={d.errorMessage}
              href={d.status === "EMBEDDED" ? `/chat/${d.id}` : null}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
