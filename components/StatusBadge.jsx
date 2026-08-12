import React from "react";
import styles from "./StatusBadge.module.css";

const LABELS = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  EMBEDDED: "Ready",
  FAILED: "Failed",
};

const STYLES = {
  PENDING: styles.pending,
  PROCESSING: styles.processing,
  EMBEDDED: styles.embedded,
  FAILED: styles.failed,
};

const StatusBadge = ({ status }) => (
  <span className={`${styles.badge} ${STYLES[status] || styles.pending}`}>
    <span className={styles.dot} aria-hidden="true" />
    {LABELS[status] || status}
  </span>
);

export default StatusBadge;
