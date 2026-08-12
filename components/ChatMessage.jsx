import React from "react";
import styles from "./ChatMessage.module.css";

const ChatMessage = ({ sender, message, streaming }) => {
  const isUser = sender === "You";

  return (
    <div className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAssistant}`}>
      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}>
        {message}
        {streaming ? <span className={styles.cursor} aria-hidden="true" /> : null}
      </div>
    </div>
  );
};

export default ChatMessage;
