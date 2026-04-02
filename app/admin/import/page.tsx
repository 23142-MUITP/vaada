"use client";
import { useState } from "react";

export default function ImportPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{added: number, skipped: number, total: number} | null>(null);

  async function runImport() {
    setLoading(true);
    setStatus("Importing politicians from Lok Sabha and Rajya Sabha data...");
    try {
      const res = await fetch("/api/import-politicians");
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setStatus(data.message);
      } else {
        setStatus("Error: " + data.error);
      }
    } catch {
      setStatus("Import failed - check console");
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: "40px", fontFamily: "DM Sans, sans-serif", maxWidth: "700px", margin: "0 auto" }}>
      <h1 style={{ fontFamily: "Georgia, serif", color: "#0D1B3E", marginBottom: "8px" }}>Auto Import Politicians</h1>
      <p style={{ color: "#666", marginBottom: "32px" }}>Automatically import all Lok Sabha and Rajya Sabha MPs into the database. Existing politicians will be updated with new data - no duplicates.</p>

      <div style={{ background: "#f8f8f8", borderRadius: "12px", padding: "24px", marginBottom: "24px", border: "1px solid #eee" }}>
        <div style={{ fontWeight: "700", marginBottom: "8px", color: "#0D1B3E" }}>What this imports:</div>
        <div style={{ fontSize: "14px", color: "#555", lineHeight: "2" }}>
          - Current Lok Sabha MPs (18th Lok Sabha)<br/>
          - Rajya Sabha members<br/>
          - State Chief Ministers<br/>
          - Key opposition leaders<br/>
          - Party presidents
        </div>
      </div>

      <button
        onClick={runImport}
        disabled={loading}
        style={{ background: loading ? "#ccc" : "#FF6B00", color: "white", border: "none", padding: "16px 32px", borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", marginBottom: "24px" }}
      >
        {loading ? "Importing..." : "Run Import Now"}
      </button>

      {status && (
        <div style={{ background: result ? "#e8f8ef" : "#fff4ec", border: `1px solid ${result ? "#12A854" : "#FF6B00"}`, borderRadius: "10px", padding: "20px" }}>
          <div style={{ color: result ? "#12A854" : "#FF6B00", fontWeight: "700", marginBottom: "8px" }}>
            {result ? "Import Complete" : "Status"}
          </div>
          <div style={{ color: "#333", fontSize: "14px" }}>{status}</div>
          {result && (
            <div style={{ marginTop: "16px", display: "flex", gap: "24px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#12A854" }}>{result.added}</div>
                <div style={{ fontSize: "13px", color: "#666" }}>New added</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#FF6B00" }}>{result.skipped}</div>
                <div style={{ fontSize: "13px", color: "#666" }}>Updated</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#0D1B3E" }}>{result.total}</div>
                <div style={{ fontSize: "13px", color: "#666" }}>Total processed</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
