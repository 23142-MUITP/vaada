"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

const REQUEST_TYPES = [
  { value: "fact_check", label: "Fact-check something on Vaada" },
  { value: "missing_promise", label: "Suggest a missing promise" },
  { value: "incorrect_data", label: "Report incorrect or outdated data" },
  { value: "add_politician", label: "Suggest a new politician to add" },
  { value: "local_politician", label: "Send a message to my local politician" },
  { value: "other", label: "Something else" },
];

export default function SuggestModal() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "",
    politician: "",
    description: "",
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.type || !form.description.trim()) return;
    await supabase.from("suggestions").insert({
      name: form.name || null,
      suggestion: `[${form.type}] ${form.politician ? `Re: ${form.politician} - ` : ""}${form.description}`,
    });
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setForm({ name: "", email: "", type: "", politician: "", description: "" });
    }, 3000);
  }

  const showPoliticianField = ["fact_check", "missing_promise", "incorrect_data", "local_politician"].includes(form.type);
  const descriptionPlaceholder =
    form.type === "fact_check" ? "What information on Vaada do you think is incorrect? Please include the politician name and promise title if possible." :
    form.type === "missing_promise" ? "Which promise is missing? Include the politician name, what was promised, when it was made, and a source link if you have one." :
    form.type === "incorrect_data" ? "What data is wrong? Please describe what it currently says and what it should say." :
    form.type === "add_politician" ? "Who should we add? Include their name, party, state, role, and any links to their promises." :
    form.type === "local_politician" ? "What would you like to say to your local politician? We will find their contact and send this message on your behalf." :
    "Describe your suggestion in as much detail as possible.";

  return (
    <>
      <style>{`
        .sm-btn { position: fixed; bottom: 24px; right: 24px; background: #FF6B00; color: white; border: none; border-radius: 50px; padding: 14px 24px; font-weight: 700; font-size: 14px; cursor: pointer; z-index: 100; box-shadow: 0 4px 20px rgba(255,107,0,0.4); font-family: inherit; }
        .sm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .sm-modal { background: #0D1B3E; border-radius: 20px; padding: 40px; width: 100%; max-width: 520px; position: relative; border: 1px solid rgba(255,107,0,0.2); max-height: 90vh; overflow-y: auto; }
        .sm-close { position: absolute; top: 16px; right: 20px; background: none; border: none; color: rgba(255,255,255,0.5); font-size: 28px; cursor: pointer; line-height: 1; }
        .sm-close:hover { color: white; }
        .sm-title { color: #FF6B00; font-family: Georgia, serif; font-size: 26px; font-weight: 700; margin: 0 0 8px 0; }
        .sm-subtitle { color: rgba(255,255,255,0.5); font-size: 14px; margin-bottom: 28px; line-height: 1.6; }
        .sm-label { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; display: block; }
        .sm-field { margin-bottom: 18px; }
        .sm-input { width: 100%; padding: 12px 16px; border-radius: 10px; border: 1.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white; font-size: 14px; box-sizing: border-box; font-family: inherit; outline: none; transition: border-color 0.2s; }
        .sm-input:focus { border-color: #FF6B00; }
        .sm-input::placeholder { color: rgba(255,255,255,0.25); }
        .sm-select { width: 100%; padding: 12px 16px; border-radius: 10px; border: 1.5px solid rgba(255,255,255,0.1); background: #0D1B3E; color: white; font-size: 14px; box-sizing: border-box; font-family: inherit; outline: none; cursor: pointer; transition: border-color 0.2s; }
        .sm-select:focus { border-color: #FF6B00; }
        .sm-select option { background: #0D1B3E; color: white; }
        .sm-textarea { width: 100%; padding: 12px 16px; border-radius: 10px; border: 1.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white; font-size: 14px; box-sizing: border-box; font-family: inherit; outline: none; resize: vertical; min-height: 120px; transition: border-color 0.2s; line-height: 1.6; }
        .sm-textarea:focus { border-color: #FF6B00; }
        .sm-textarea::placeholder { color: rgba(255,255,255,0.25); }
        .sm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .sm-divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 20px 0; }
        .sm-note { font-size: 12px; color: rgba(255,255,255,0.3); margin-bottom: 16px; line-height: 1.6; }
        .sm-note span { color: #FF6B00; }
        .sm-submit { width: 100%; background: #FF6B00; color: white; border: none; border-radius: 10px; padding: 16px; font-weight: 700; font-size: 16px; cursor: pointer; font-family: inherit; transition: background 0.2s; }
        .sm-submit:hover { background: #e55a00; }
        .sm-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .sm-success { text-align: center; padding: 20px 0; }
        .sm-success-icon { font-size: 48px; margin-bottom: 16px; }
        .sm-success-title { color: #12A854; font-family: Georgia, serif; font-size: 22px; font-weight: 700; margin-bottom: 8px; }
        .sm-success-text { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; }
        @media (max-width: 480px) {
          .sm-modal { padding: 28px 20px; }
          .sm-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <button className="sm-btn" onClick={() => setOpen(true)}>+ Suggest a Change</button>

      {open && (
        <div className="sm-overlay" onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="sm-modal">
            <button className="sm-close" onClick={() => setOpen(false)}>×</button>

            {submitted ? (
              <div className="sm-success">
                <div className="sm-success-icon">✅</div>
                <div className="sm-success-title">Received - thank you!</div>
                <div className="sm-success-text">
                  {form.type === "local_politician"
                    ? "We will find your politician's contact and send your message on your behalf."
                    : "Our team will review your submission and update Vaada accordingly."}
                </div>
              </div>
            ) : (
              <>
                <h2 className="sm-title">Suggest a Change</h2>
                <p className="sm-subtitle">Help us keep Vaada accurate. Fact-check our data, suggest missing promises, or send a message to your local politician.</p>

                <div className="sm-field">
                  <label className="sm-label">What is this about? *</label>
                  <select className="sm-select" value={form.type} onChange={e => update("type", e.target.value)}>
                    <option value="">Select a request type...</option>
                    {REQUEST_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {showPoliticianField && (
                  <div className="sm-field">
                    <label className="sm-label">Which politician is this about?</label>
                    <input className="sm-input" placeholder="e.g. Narendra Modi, Arvind Kejriwal..." value={form.politician} onChange={e => update("politician", e.target.value)} />
                  </div>
                )}

                <div className="sm-field">
                  <label className="sm-label">
                    {form.type === "local_politician" ? "Your message" : "Details"} *
                  </label>
                  <textarea className="sm-textarea" placeholder={descriptionPlaceholder} value={form.description} onChange={e => update("description", e.target.value)} />
                </div>

                <hr className="sm-divider" />

                <div className="sm-row">
                  <div className="sm-field">
                    <label className="sm-label">Your name <span style={{ color: "rgba(255,255,255,0.2)" }}>(optional)</span></label>
                    <input className="sm-input" placeholder="Anonymous" value={form.name} onChange={e => update("name", e.target.value)} />
                  </div>
                  <div className="sm-field">
                    <label className="sm-label">Email <span style={{ color: "rgba(255,255,255,0.2)" }}>(optional)</span></label>
                    <input className="sm-input" type="email" placeholder="For follow-up only" value={form.email} onChange={e => update("email", e.target.value)} />
                  </div>
                </div>

                {form.type === "local_politician" && (
                  <div className="sm-note">
                    <span>How this works:</span> Once you submit, our system will find the official contact details for your politician and send your message on your behalf via email. You will receive a copy if you provide your email above.
                  </div>
                )}

                <button
                  className="sm-submit"
                  onClick={handleSubmit}
                  disabled={!form.type || !form.description.trim()}
                >
                  {form.type === "local_politician" ? "Send Message to Politician" : "Submit to Vaada"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
