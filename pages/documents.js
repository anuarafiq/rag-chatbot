import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import PdfUploader from "../components/PdfUploader";
import DocumentCard from "../components/DocumentCard";
import prisma from "../lib/db";

export async function getServerSideProps() {
  const documents = await prisma.document.findMany({ orderBy: { createdAt: "desc" } });
  return {
    props: {
      documents: documents.map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        pageCount: d.pageCount,
      })),
    },
  };
}

const DocumentsPage = ({ documents }) => {
  const router = useRouter();

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      alert(uploadData.error || "Upload failed");
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
  };

  return (
    <div>
      <h1>Documents</h1>
      <PdfUploader onUpload={handleUpload} />
      {documents.map((d) =>
        d.status === "EMBEDDED" ? (
          <Link key={d.id} href={`/chat/${d.id}`}>
            <DocumentCard title={d.title} description={`${d.status} · ${d.pageCount ?? "?"} pages`} />
          </Link>
        ) : (
          <div key={d.id} style={{ opacity: 0.5 }}>
            <DocumentCard title={d.title} description={`${d.status} · ${d.pageCount ?? "?"} pages`} />
          </div>
        )
      )}
    </div>
  );
};

export default DocumentsPage;
