"use client";
import { useState } from "react";

export default function ImportPage() {
  const [polStatus, setPolStatus] = useState("");
  const [polLoading, setPolLoading] = useState(false);
  const [polResult, setPolResult] = useState<{added: number, skipped: number, total: number} | null>(null);
  const [promiseStatus, setPromiseStatus] = useState("");
  const [promiseLoading, setPromiseLoading] = useState(false);
  const [promiseResult, setPromiseResult] = useState<{processed: number, promises_added: number} | null>(null);
  const [batchSize, setBatchSize] = useState(5);

  async function runPoliticianImport() {
    setPolLoading(true);
    setPolStatus("Importing politicians...");
    try {
      const res = await fetch("/api/import-politicians");
      const data = await res.json();
      if (data.success) {
        setPolResult(data);
        setPolStatus(data.message);
      } else {
        setPolStatus("Error: " + data.error);
      }
    } catch {
      setPolStatus("Import failed");
    }
    setPolLoading(false);
  }

  async function runPromiseImport() {
    setPromiseLoading(true);
    setPromiseStatus(`Generating promises for ${batchSize} politicians using Groq AI...`);
    try {
      const res = await fetch(`/api/import-promises?limit=${batchSize}`);
      const data = await res.json();
      if (data.success) {
        setPromiseResult(data);
        setPromiseStatus(data.message);
      } else {
        setPromiseStatus("Error: " + data.error);
      }
    } catch {
      setPromiseStatus("Import failed");
    }
    setPromiseLoading(false);
  }

  return (
    <div style={{ padding: "40px", fontFamily: "DM Sans, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontFamily: "Georgia, serif", color: "#0D1B3E", marginBottom: "4px" }}>Data Automation</h1>
      <p style={{ color: "#666", marginBottom: "40px" }}>Automatically import politicians and generate promises using AI.</p>

      {/* STEP 1 */}
      <div style={{ background: "white", borderRadius: "16px", padding: "28px", border: "1px solid #eee", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div style={{ background: "#FF6B00", color: "white", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px", flexShrink: 0 }}>1</div>
          <h2 style={{ fontFamily: "Georgia, serif", color: "#0D1B3E", margin: 0, fontSize: "20px" }}>Import Politicians</h2>
        </div>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px", marginLeft: "40px" }}>Imports Lok Sabha MPs, Rajya Sabha members, CMs and key political leaders. Safe to run multiple times - no duplicates.</p>
        <button onClick={runPoliticianImport} disabled={polLoading} style={{ background: polLoading ? "#ccc" : "#0D1B3E", color: "white", border: "none", padding: "12px 28px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: polLoading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {polLoading ? "Importing..." : "Run Politician Import"}
        </button>
        {polStatus && (
          <div style={{ marginTop: "16px", padding: "16px", background: polResult ? "#e8f8ef" : "#fff4ec", borderRadius: "8px", fontSize: "14px", color: "#333" }}>
            {polStatus}
            {polResult && (
              <div style={{ display: "flex", gap: "24px", marginTop: "12px" }}>
                <div><strong style={{ color: "#12A854", fontSize: "20px" }}>{polResult.added}</strong> <span style={{ color: "#666", fontSize: "12px" }}>Added</span></div>
                <div><strong style={{ color: "#FF6B00", fontSize: "20px" }}>{polResult.skipped}</strong> <span style={{ color: "#666", fontSize: "12px" }}>Updated</span></div>
                <div><strong style={{ color: "#0D1B3E", fontSize: "20px" }}>{polResult.total}</strong> <span style={{ color: "#666", fontSize: "12px" }}>Total</span></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* STEP 2 */}
      <div style={{ background: "white", borderRadius: "16px", padding: "28px", border: "1px solid #eee", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div style={{ background: "#FF6B00", color: "white", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px", flexShrink: 0 }}>2</div>
          <h2 style={{ fontFamily: "Georgia, serif", color: "#0D1B3E", margin: 0, fontSize: "20px" }}>Generate Promises with AI</h2>
        </div>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px", marginLeft: "40px" }}>Uses Groq AI to generate promises for politicians who have none yet. Run in batches to avoid rate limits.</p>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", marginLeft: "40px" }}>
          <label style={{ fontSize: "14px", color: "#555" }}>Batch size:</label>
          {[3, 5, 10].map(n => (
            <button key={n} onClick={() => setBatchSize(n)} style={{ padding: "6px 16px", borderRadius: "20px", border: "2px solid", borderColor: batchSize === n ? "#FF6B00" : "#eee", background: batchSize === n ? "#FF6B00" : "white", color: batchSize === n ? "white" : "#666", fontWeight: "600", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>{n}</button>
          ))}
        </div>
        <button onClick={runPromiseImport} disabled={promiseLoading} style={{ background: promiseLoading ? "#ccc" : "#FF6B00", color: "white", border: "none", padding: "12px 28px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: promiseLoading ? "not-allowed" : "pointer", fontFamily: "inherit", marginLeft: "40px" }}>
          {promiseLoading ? "Generating..." : `Generate Promises for ${batchSize} Politicians`}
        </button>
        {promiseStatus && (
          <div style={{ marginTop: "16px", marginLeft: "40px", padding: "16px", background: promiseResult ? "#e8f8ef" : "#fff4ec", borderRadius: "8px", fontSize: "14px", color: "#333" }}>
            {promiseStatus}
            {promiseResult && (
              <div style={{ display: "flex", gap: "24px", marginTop: "12px" }}>
                <div><strong style={{ color: "#12A854", fontSize: "20px" }}>{promiseResult.promises_added}</strong> <span style={{ color: "#666", fontSize: "12px" }}>Promises added</span></div>
                <div><strong style={{ color: "#FF6B00", fontSize: "20px" }}>{promiseResult.processed}</strong> <span style={{ color: "#666", fontSize: "12px" }}>Politicians processed</span></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ background: "#f8f8f8", borderRadius: "12px", padding: "20px", border: "1px solid #eee", fontSize: "13px", color: "#888", lineHeight: "1.8" }}>
        <strong style={{ color: "#0D1B3E" }}>How to use:</strong><br/>
        Run Step 1 once to import all politicians.<br/>
        Run Step 2 in batches of 5 - each batch takes about 30 seconds.<br/>
        Keep running Step 2 until all politicians have promises.<br/>
        You can run both steps again anytime - they are safe and won&apos;t create duplicates.
      </div>
    </div>
  );
}
