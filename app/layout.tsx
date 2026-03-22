"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import "./globals.css";

type SuggestionForm = {
  politician_name: string;
  state: string;
  suggestion_type: string;
  message: string;
  contact_email: string;
};

const empty: SuggestionForm = {
  politician_name: "",
  state: "",
  suggestion_type: "Wrong information",
  message: "",
  contact_email: "",
};

const SUGGESTION_TYPES = [
  "Wrong information",
  "Missing promise",
  "Promise status update",
  "Add new politician",
  "Other",
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SuggestionForm>(empty);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit() {
    if (!form.message.trim()) { setError("Please describe the change you want to suggest"); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.from("suggestions").insert([form]);
    if (err) { setError(err.message); setLoading(false); return; }
    setSubmitted(true);
    setLoading(false);
  }

  function close() {
    setOpen(false);
    setTimeout(() => { setSubmitted(false); setForm(empty); setError(""); }, 300);
  }

  return (
    <html lang="en">
      <head>
        <title>Vaada - India Promise Tracker</title>
        <meta name="description" content="Track every promise made by Indian politicians. Hold your elected representatives accountable." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Georgia&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
        {children}

        {/* FLOATING SUGGEST BUTTON */}
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            background: "#FF6B00",
            color: "white",
            border: "none",
            borderRadius: "50px",
            padding: "14px 24px",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 4px 20px rgba(255,107,0,0.4)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.transform = "translateY(-2px)"; (e.target as HTMLElement).style.boxShadow = "0 8px 28px rgba(255,107,0,0.5)"; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.transform = "translateY(0)"; (e.target as HTMLElement).style.boxShadow = "0 4px 20px rgba(255,107,0,0.4)"; }}
        >
          <span style={{ fontSize: "16px" }}>+</span> Suggest a Change
        </button>

        {/* MODAL OVERLAY */}
        {open && (
          <div
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
              zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
              padding: "20px",
            }}
            onClick={e => { if (e.target === e.currentTarget) close(); }}
          >
            <div style={{
              background: "white", borderRadius: "20px", width: "100%", maxWidth: "540px",
              maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}>
              {/* Modal Header */}
              <div style={{ background: "#0D1B3E", padding: "28px 32px", borderRadius: "20px 20px 0 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "700", color: "white", marginBottom: "6px" }}>Suggest a Change</div>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)" }}>Help us keep Vaada accurate and up to date</div>
                </div>
                <button onClick={close} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>x</button>
              </div>

              <div style={{ padding: "32px" }}>
                {submitted ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🙏</div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: "700", color: "#0D1B3E", marginBottom: "12px" }}>Thank you!</div>
                    <p style={{ color: "#666", fontSize: "16px", lineHeight: "1.6", marginBottom: "24px" }}>Your suggestion has been received. We review every submission and will update Vaada accordingly.</p>
                    <button onClick={close} style={{ background: "#FF6B00", color: "white", border: "none", padding: "14px 32px", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>Close</button>
                  </div>
                ) : (
                  <>
                    {error && <div style={{ background: "#fde8e8", color: "#e53e3e", padding: "12px 16px", borderRadius: "8px", fontSize: "14px", marginBottom: "20px", border: "1px solid #e53e3e" }}>{error}</div>}

                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#666", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Type of Suggestion</label>
                      <select value={form.suggestion_type} onChange={e => update("suggestion_type", e.target.value)} style={{ width: "100%", padding: "12px 14px", border: "2px solid #eee", borderRadius: "8px", fontSize: "15px", outline: "none", fontFamily: "inherit", color: "#0D1B3E" }}>
                        {SUGGESTION_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#666", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Politician Name</label>
                        <input type="text" placeholder="e.g. Narendra Modi" value={form.politician_name} onChange={e => update("politician_name", e.target.value)} style={{ width: "100%", padding: "12px 14px", border: "2px solid #eee", borderRadius: "8px", fontSize: "15px", outline: "none", fontFamily: "inherit", color: "#0D1B3E", boxSizing: "border-box" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#666", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.8px" }}>State / Region</label>
                        <input type="text" placeholder="e.g. Gujarat" value={form.state} onChange={e => update("state", e.target.value)} style={{ width: "100%", padding: "12px 14px", border: "2px solid #eee", borderRadius: "8px", fontSize: "15px", outline: "none", fontFamily: "inherit", color: "#0D1B3E", boxSizing: "border-box" }} />
                      </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#666", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Your Suggestion <span style={{ color: "#e53e3e" }}>*</span></label>
                      <textarea
                        placeholder="Describe the change you want to see. Be as specific as possible - include sources if you have them."
                        value={form.message}
                        onChange={e => update("message", e.target.value)}
                        rows={4}
                        style={{ width: "100%", padding: "12px 14px", border: "2px solid #eee", borderRadius: "8px", fontSize: "15px", outline: "none", fontFamily: "inherit", color: "#0D1B3E", resize: "vertical", boxSizing: "border-box" }}
                      />
                    </div>

                    <div style={{ marginBottom: "28px" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#666", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Your Email <span style={{ fontSize: "11px", fontWeight: "400", textTransform: "none", letterSpacing: 0 }}>(optional - we'll update you)</span></label>
                      <input type="email" placeholder="your@email.com" value={form.contact_email} onChange={e => update("contact_email", e.target.value)} style={{ width: "100%", padding: "12px 14px", border: "2px solid #eee", borderRadius: "8px", fontSize: "15px", outline: "none", fontFamily: "inherit", color: "#0D1B3E", boxSizing: "border-box" }} />
                    </div>

                    <button
                      onClick={submit}
                      disabled={loading}
                      style={{ width: "100%", padding: "16px", background: loading ? "#ccc" : "#FF6B00", color: "white", border: "none", borderRadius: "10px", fontSize: "17px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                    >
                      {loading ? "Submitting..." : "Submit Suggestion"}
                    </button>
                    <p style={{ textAlign: "center", fontSize: "13px", color: "#999", marginTop: "12px" }}>Every suggestion is reviewed by our team within 48 hours.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
