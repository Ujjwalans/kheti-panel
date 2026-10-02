import React, { useState } from "react";
import api from "../api";

export default function KhetiAI() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(e) {
    e.preventDefault();

    if (!message.trim()) return;

    setLoading(true);

    try {
      const { data } = await api.post(
        "/kheti-ai/chat",
        {
          message,
        }
      );

      setReply(data.reply || "");

      setMessage("");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Kheti AI is temporarily unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "How can I reduce fungal disease risk?",
    "When should I irrigate wheat?",
    "How can I improve soil fertility?",
    "Should I sell my crop now?",
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="eyebrow">
          AI AGRICULTURAL ASSISTANT
        </span>

        <h1>Kheti AI</h1>

        <p>
          Ask questions about crops, soil, weather,
          fertilizer, irrigation, storage and markets.
        </p>
      </div>

      <div className="ai-card">
        <div className="ai-suggestions">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                setMessage(item)
              }
            >
              {item}
            </button>
          ))}
        </div>

        {reply && (
          <div className="ai-reply">
            <div className="ai-avatar">
              K
            </div>

            <div>
              <strong>Kheti AI</strong>

              <p>{reply}</p>
            </div>
          </div>
        )}

        <form onSubmit={ask}>
          <textarea
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            placeholder="Ask Kheti AI anything about farming..."
            rows={4}
          />

          <button
            className="primary-btn"
            disabled={loading}
          >
            {loading
              ? "Thinking..."
              : "Ask Kheti AI"}
          </button>
        </form>
      </div>
    </div>
  );
}