"use client";
import { useState } from "react";

export default function SuggestModal() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", suggestion: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!form.suggestion.trim()) return;
    setSubmitted(true);
    setForm({ name: "", suggestion: "" });
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
    }, 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "#FF6B00",
          color: "white",
          border: "none",
          borderRadius: "50px",
          padding: "14px 24px",
          fontWeight: 700,
          fontSize: "14px",
          cursor: "pointer",
          zIndex: 100,
          boxShadow: "0 4px 20px rgba(255,107,0,0.4)",
        }}
      >
        + Suggest a Change
      </button>

      {open && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px",
        }}>
          <div style={{
            background: "#0D1B3E", borderRadius: "16px", padding: "40px",
            width: "100%", maxWidth: "480px", position: "relative",
            border: "1px solid rgba(255,107,0,0.2)",
          }}>
            <button onClick={() => setOpen(false)} style={{
              position: "absolute", top: "16px", right: "20px",
              background: "none", border: "none", color: "white",
              fontSize: "28px", cursor: "pointer",
            }}>×</button>

            {submitted ? (
              <div style={{ textAlign: "center", color: "#12A854", fontSize: "20px", fontWeight: 700 }}>
                Thank you! We will review your suggestion.
              </div>
            ) : (
              <>
                <h2 style={{ color: "#FF6B00", fontFamily: "Georgia, serif", marginTop: 0 }}>
                  Suggest a Change
                </h2>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginBottom: "24px" }}>
                  Know a promise we missed? A status that changed? Tell us.
                </p>
                <input
                  placeholder="Your name (optional)"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)",
                    color: "white", fontSize: "14px", marginBottom: "12px", boxSizing: "border-box",
                  }}
                />
                <textarea
                  placeholder="Describe your suggestion..."
                  value={form.suggestion}
                  onChange={e => setForm({ ...form, suggestion: e.target.value })}
                  rows={4}
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)",
                    color: "white", fontSize: "14px", marginBottom: "20px",
                    boxSizing: "border-box", resize: "vertical",
                  }}
                />
                <button onClick={handleSubmit} style={{
                  width: "100%", background: "#FF6B00", color: "white",
                  border: "none", borderRadius: "8px", padding: "14px",
                  fontWeight: 700, fontSize: "16px", cursor: "pointer",
                }}>
                  Submit Suggestion
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
