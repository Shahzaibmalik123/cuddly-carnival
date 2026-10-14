"use client";

import { useState, type FormEvent } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("Summarize this file.");
  const [answer, setAnswer] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please choose a file first.");
      return;
    }
    setLoading(true);
    setError("");
    setAnswer("");
    setFileUrl("");

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("question", question);
      const res = await fetch("/api/analyze", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setAnswer(data.answer);
      setFileUrl(data.fileUrl || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ marginBottom: 4 }}>File Agent</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Upload a PDF, Word (.docx), Excel (.xlsx/.xls), CSV or text file, then ask Claude about it.
      </p>

      <form
        onSubmit={onSubmit}
        style={{
          display: "grid",
          gap: 12,
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <input
          type="file"
          accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.md,.json"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder="Ask something about the file..."
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", font: "inherit" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: loading ? "#8a94a6" : "#2b59ff",
            color: "#fff",
            font: "inherit",
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "Analyzing..." : "Ask Claude"}
        </button>
      </form>

      {error && <p style={{ color: "#c62828" }}>{error}</p>}

      {answer && (
        <section
          style={{
            marginTop: 24,
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
          }}
        >
          {answer}
          {fileUrl && (
            <p style={{ marginTop: 16, fontSize: 14 }}>
              <a href={fileUrl} target="_blank" rel="noreferrer">
                Stored file
              </a>
            </p>
          )}
        </section>
      )}
    </main>
  );
}
