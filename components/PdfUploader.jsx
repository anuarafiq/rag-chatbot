import React, { useRef } from "react";
import styles from "./PdfUploader.module.css";

const PdfUploader = ({ onUpload, uploading, error }) => {
  const fileInput = useRef();
  const inputId = "pdf-upload-input";

  const handleChange = (e) => {
    if (e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
    e.target.value = "";
  };

  return (
    <div>
      <label
        htmlFor={inputId}
        className={`${styles.dropzone} ${uploading ? styles.dropzoneDisabled : ""}`}
      >
        {uploading ? <span className={styles.spinner} aria-hidden="true" /> : null}
        <span className={styles.label}>
          {uploading ? "Uploading and embedding…" : "Click to upload a PDF"}
        </span>
      </label>
      <input
        id={inputId}
        type="file"
        accept="application/pdf"
        ref={fileInput}
        onChange={handleChange}
        disabled={uploading}
        className={styles.visuallyHidden}
      />
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
};

export default PdfUploader;
