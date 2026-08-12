import React from "react";
import styles from "./ChunkSourceList.module.css";

const ChunkSourceList = ({ sources }) => (
  <div className={styles.list}>
    <div className={styles.label}>Sources</div>
    {sources.map((src) => (
      <div key={src.chunkIndex} className={styles.item}>
        <span className={styles.index}>#{src.chunkIndex}</span>
        <span className={styles.similarity}>{Math.round(src.similarity * 100)}%</span>
        <span className={styles.excerpt}>{src.content}</span>
      </div>
    ))}
  </div>
);

export default ChunkSourceList;
