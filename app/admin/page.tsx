"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

const PASSWORD = "vaada2024";

type PoliticianForm = {
  name: string;
  role: string;
  party: string;
  state: string;
  constituency: string;
  level: string;
  bio: string;
  promises_kept: number;
  promises_progress: number;
  promises_broken: number;
  total_promises: number;
};

const empty: PoliticianForm = {
  name: "", role: "", party: "", state: "", constituency: "",
  level: "National", bio: "",
  promises_kept: 0, promises_progress: 0, promises_broken: 0, total_promises: 0
};

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [form, setForm] = useState<PoliticianForm>(empty);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function login() {
    if (pw === PASSWORD) { setAuth(true); setPwError(false); }
    else setPwError(true);
  }

  function update(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function autoFill() {
    if (!form.name) { setError("Enter a politician name first"); return; }
    setAiLoading(true);
    setError("");
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Give me details about Indian politician "${form.name}". Respond ONLY with a JSON object, no markdown, no explanation, no backticks:
{"role":"their current or most recent role","party":"their party abbreviation like BJP or INC or AAP or SP or TMC","state":"their home state","constituency":"their constituency if applicable or empty string","level":"National or State or Local","bio":"2-3 sentence bio about them","promises_kept":estimated number as integer,"promises_progress":estimated number as integer,"promises_broken":estimated number as integer,"total_promises":sum of the three numbers as integer}`
            }]
          }]
        })
      });
      const data = await res.json();
      const text = data.candidates[0].content.parts[0].text;
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setForm(f => ({ ...f, ...parsed }));
    } catch (e) {
      setError("AI fill failed - check the name and try again");
      console.error(e);
    }
    setAiLoading(false);
  }

  async function save() {
    if (!form.name || !form.party) { setError("Name and party are required"); return; }
    setLoading(true);
    setError("");
    const initials = form.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
    const { error: err } = await supabase.from("politicians").insert([{ ...form, initials, verified: false }]);
    if (err) { setError(err.message); setLoading(false); return; }
    setSaved(true);
    setForm(empty);
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!auth) return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: DM Sans, sans-serif; background: #faf8f5; }
        .login { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .login-card { background: white; padding: 48px; border-radius: 20px; width: 100%; max-width: 400px; box-shadow: 0 8px 40px rgba(0,0,0,0.1); text-align: center; }
        h1 { font-family: Georgia, serif; color: #FF6B00; font-size: 32px; margin-bottom: 8px; }
        p { color: #666; margin-bottom: 32px; }
        input { width: 100%; padding: 14px; border: 2px solid #eee; border-radius: 10px; font-size: 16px; margin-bottom: 12px; outline: none; text-align: center; letter-spacing: 4px; }
        input:focus { border-color: #FF6B00; }
        .btn { width: 100%; padding: 14px; background: #FF6B00; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; }
        .err { color: #e53e3e; margin-top: 8px; font-size: 14px; }
      `}</style>
      <div className="login">
        <div className="login-card">
          <h1>Vaada Admin</h1>
          <p>Enter password to continue</p>
          <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
          <button className="btn" onClick={login}>Enter</button>
          {pwError && <div className="err">Wrong password</div>}
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: DM Sans, sans-serif; background: #faf8f5; color: #0D1B3E; }
        .nav { background: #0D1B3E; padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; }
        .nav-logo { color: #FF6B00; font-size: 24px; font-weight: 700; font-family: Georgia, serif; }
        .nav-right { color: white; font-size: 14px; opacity: 0.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px; }
        h1 { font-family: Georgia, serif; font-size: 36px; margin-bottom: 8px; }
        .subtitle { color: #666; margin-bottom: 32px; }
        .card { background: white; border-radius: 16px; padding: 32px; border: 1px solid #eee; margin-bottom: 24px; }
        .card h2 { font-family: Georgia, serif; font-size: 20px; margin-bottom: 20px; }
        .ai-bar { display: flex; gap: 12px; margin-bottom: 8px; }
        .ai-input { flex: 1; padding: 14px; border: 2px solid #eee; border-radius: 10px; font-size: 16px; outline: none; }
        .ai-input:focus { border-color: #FF6B00; }
        .ai-btn { padding: 14px 24px; background: #0D1B3E; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .ai-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ai-hint { font-size: 13px; color: #999; margin-bottom: 0; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .field { margin-bottom: 16px; }
        label { display: block; font-size: 13px; font-weight: 600; color: #666; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        input[type=text], select, textarea { width: 100%; padding: 12px; border: 2px solid #eee; border-radius: 8px; font-size: 15px; outline: none; font-family: inherit; }
        input[type=text]:focus, select:focus, textarea:focus { border-color: #FF6B00; }
        input[type=number] { width: 100%; padding: 12px; border: 2px solid #eee; border-radius: 8px; font-size: 15px; outline: none; }
        input[type=number]:focus { border-color: #FF6B00; }
        textarea { resize: vertical; min-height: 100px; }
        .nums { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; }
        .save-btn { width: 100%; padding: 16px; background: #FF6B00; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: 700; cursor: pointer; margin-top: 8px; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .success { background: #e8f8ef; color: #12A854; padding: 16px; border-radius: 10px; text-align: center; font-weight: 700; margin-bottom: 16px; }
        .error { background: #fde8e8; color: #e53e3e; padding: 16px; border-radius: 10px; text-align: center; margin-bottom: 16px; }
        @media (max-width: 600px) { .grid2 { grid-template-columns: 1fr; } .nums { grid-template-columns: 1fr 1fr; } .container { padding: 20px; } }
      `}</style>
      <nav className="nav">
        <div className="nav-logo">Vaada Admin</div>
        <div className="nav-right">Admin Panel</div>
      </nav>
      <div className="container">
        <h1>Add Politician</h1>
        <p className="subtitle">Type a name and click AI Fill to auto-populate details</p>

        {saved && <div className="success">Politician saved successfully!</div>}
        {error && <div className="error">{error}</div>}

        <div className="card">
          <h2>AI Auto-Fill</h2>
          <div className="ai-bar">
            <input className="ai-input" type="text" placeholder="Enter politician name e.g. Narendra Modi" value={form.name} onChange={e => update("name", e.target.value)} />
            <button className="ai-btn" onClick={autoFill} disabled={aiLoading}>{aiLoading ? "Filling..." : "AI Fill"}</button>
          </div>
          <p className="ai-hint">Powered by Google Gemini - free tier</p>
        </div>

        <div className="card">
          <h2>Details</h2>
          <div className="grid2">
            <div className="field"><label>Name</label><input type="text" value={form.name} onChange={e => update("name", e.target.value)} /></div>
            <div className="field"><label>Role / Title</label><input type="text" value={form.role} onChange={e => update("role", e.target.value)} /></div>
            <div className="field"><label>Party</label><input type="text" value={form.party} onChange={e => update("party", e.target.value)} /></div>
            <div className="field"><label>State</label><input type="text" value={form.state} onChange={e => update("state", e.target.value)} /></div>
            <div className="field"><label>Constituency</label><input type="text" value={form.constituency} onChange={e => update("constituency", e.target.value)} /></div>
            <div className="field"><label>Level</label>
              <select value={form.level} onChange={e => update("level", e.target.value)}>
                <option>National</option><option>State</option><option>Local</option>
              </select>
            </div>
          </div>
          <div className="field"><label>Bio</label><textarea value={form.bio} onChange={e => update("bio", e.target.value)} /></div>
          <div className="nums">
            <div className="field"><label>Total Promises</label><input type="number" value={form.total_promises} onChange={e => update("total_promises", parseInt(e.target.value))} /></div>
            <div className="field"><label>Kept</label><input type="number" value={form.promises_kept} onChange={e => update("promises_kept", parseInt(e.target.value))} /></div>
            <div className="field"><label>In Progress</label><input type="number" value={form.promises_progress} onChange={e => update("promises_progress", parseInt(e.target.value))} /></div>
            <div className="field"><label>Broken</label><input type="number" value={form.promises_broken} onChange={e => update("promises_broken", parseInt(e.target.value))} /></div>
          </div>
          <button className="save-btn" onClick={save} disabled={loading}>{loading ? "Saving..." : "Save Politician"}</button>
        </div>
      </div>
    </>
  );
}
