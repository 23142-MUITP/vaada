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
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{
            role: "user",
            content: `Give me details about Indian politician "${form.name}". Respond ONLY with a valid JSON object, no markdown, no backticks, no explanation. Just raw JSON: {"role":"current or most recent political role","party":"party abbreviation such as BJP or INC or AAP or SP or TMC","state":"home state full name","constituency":"constituency name or empty string","level":"National or State or Local","bio":"2-3 sentences about their political career","promises_kept":5,"promises_progress":3,"promises_broken":4,"total_promises":12}`
          }],
          temperature: 0.1,
          max_tokens: 500
        })
      });
      const data = await res.json();
      if (data.error) { setError(`API Error: ${data.error.message}`); setAiLoading(false); return; }
      const text = data.choices?.[0]?.message?.content || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) { setError("Could not parse AI response. Try again."); setAiLoading(false); return; }
      const parsed = JSON.parse(jsonMatch[0]);
      setForm(f => ({ ...f, ...parsed, name: f.name }));
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Try again.");
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
        body { font-family: 'DM Sans', sans-serif; background: #faf8f5; }
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
        body { font-family: 'DM Sans', sans-serif; background: #faf8f5; color: #0D1B3E; }
        .nav { background: #0D1B3E; padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; }
        .nav-logo { color: #FF6B00; font-size: 24px; font-weight: 700; font-family: Georgia, serif; }
        .nav-right { color: white; font-size: 14px; opacity: 0.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px; }
        h1 { font-family: Georgia, serif; font-size: 36px; margin-bottom: 8px; }
        .subtitle { color: #666; margin-bottom: 32px; }
        .card { background: white; border-radius: 16px; padding: 32px; border: 1px solid #eee; margin-bottom: 24px; }
        .card h2 { font-family: Georgia, serif; font-size: 20px; margin-bottom: 20px; }
        .ai-bar { display: flex; gap: 12px; margin-bottom: 8px; }
        .ai-input { flex: 1; padding: 14px; border: 2px solid #eee; border-radius: 10px; font-size: 16px; outline: none; font-family: inherit; }
        .ai-input:focus { border-color: #FF6B00; }
        .ai-btn { padding: 14px 28px; background: #0D1B3E; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .ai-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ai-hint { font-size: 13px; color: #999; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .field { margin-bottom: 16px; }
        label { display: block; font-size: 12px; font-weight: 700; color: #666; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.8px; }
        input[type=text], select, textarea { width: 100%; padding: 12px 14px; border: 2px solid #eee; border-radius: 8px; font-size: 15px; outline: none; font-family: inherit; color: #0D1B3E; }
        input[type=text]:focus, select:focus, textarea:focus { border-color: #FF6B00; }
        input[type=number] { width: 100%; padding: 12px 14px; border: 2px solid #eee; border-radius: 8px; font-size: 15px; outline: none; font-family: inherit; color: #0D1B3E; }
        input[type=number]:focus { border-color: #FF6B00; }
        textarea { resize: vertical; min-height: 100px; }
        .nums { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; }
        .save-btn { width: 100%; padding: 16px; background: #FF6B00; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: 700; cursor: pointer; margin-top: 8px; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .success { background: #e8f8ef; color: #12A854; padding: 16px; border-radius: 10px; text-align: center; font-weight: 700; margin-bottom: 16px; border: 1px solid #12A854; }
        .error { background: #fde8e8; color: #e53e3e; padding: 16px; border-radius: 10px; text-align: center; margin-bottom: 16px; border: 1px solid #e53e3e; }
        @media (max-width: 600px) { .grid2 { grid-template-columns: 1fr; } .nums { grid-template-columns: 1fr 1fr; } .container { padding: 20px; } }
      `}</style>
      <nav className="nav">
        <div className="nav-logo">Vaada Admin</div>
        <div className="nav-right">Powered by Groq</div>
      </nav>
      <div className="container">
        <h1>Add Politician</h1>
        <p className="subtitle">Type a name and click AI Fill to auto-populate details</p>
        {saved && <div className="success">Politician saved to Supabase successfully!</div>}
        {error && <div className="error">{error}</div>}
        <div className="card">
          <h2>AI Auto-Fill</h2>
          <div className="ai-bar">
            <input className="ai-input" type="text" placeholder="e.g. Devendra Fadnavis" value={form.name} onChange={e => update("name", e.target.value)} onKeyDown={e => e.key === "Enter" && autoFill()} />
            <button className="ai-btn" onClick={autoFill} disabled={aiLoading}>{aiLoading ? "Filling..." : "AI Fill"}</button>
          </div>
          <p className="ai-hint">Powered by Groq - free tier. Review all fields before saving.</p>
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
            <div className="field"><label>Total Promises</label><input type="number" min="0" value={form.total_promises} onChange={e => update("total_promises", parseInt(e.target.value) || 0)} /></div>
            <div className="field"><label>Kept</label><input type="number" min="0" value={form.promises_kept} onChange={e => update("promises_kept", parseInt(e.target.value) || 0)} /></div>
            <div className="field"><label>In Progress</label><input type="number" min="0" value={form.promises_progress} onChange={e => update("promises_progress", parseInt(e.target.value) || 0)} /></div>
            <div className="field"><label>Broken</label><input type="number" min="0" value={form.promises_broken} onChange={e => update("promises_broken", parseInt(e.target.value) || 0)} /></div>
          </div>
          <button className="save-btn" onClick={save} disabled={loading}>{loading ? "Saving..." : "Save Politician"}</button>
        </div>
      </div>
    </>
  );
}
