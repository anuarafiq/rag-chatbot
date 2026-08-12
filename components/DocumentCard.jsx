import React from "react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import styles from "./DocumentCard.module.css";

const metaLine = (status, pageCount, errorMessage) => {
  if (status === "FAILED" && errorMessage) return errorMessage;
  const pages = pageCount ? `${pageCount} page${pageCount === 1 ? "" : "s"}` : "Page count unknown";
  const hint =
    status === "PENDING" || status === "PROCESSING" ? " · embedding in progress" : status === "EMBEDDED" ? " · ready to chat" : "";
  return `${pages}${hint}`;
};

const DocumentCard = ({ title, status, pageCount, errorMessage, href }) => {
  const isFailed = status === "FAILED";
  const body = (
    <div className={`${styles.card} ${href ? "" : styles.disabled}`}>
      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        <div className={`${styles.meta} ${isFailed ? styles.metaError : ""}`}>
          {metaLine(status, pageCount, errorMessage)}
        </div>
      </div>
      <div className={styles.right}>
        <StatusBadge status={status} />
      </div>
    </div>
  );

  if (!href) return body;

  return (
    <Link href={href} className={styles.linked}>
      {body}
    </Link>
  );
};

export default DocumentCard;
