"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

const PASSWORD = "vaada2024";

type PoliticianResult = {
  name: string;
  status: "pending" | "loading" | "success" | "error";
  error?: string;
  data?: Record<string, unknown>;
};

export default function BulkAdmin() {
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [names, setNames] = useState("");
  const [results, setResults] = useState<PoliticianResult[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  function login() {
    if (pw === PASSWORD) { setAuth(true); setPwError(false); }
    else setPwError(true);
  }

  async function fetchPolitician(name: string): Promise<Record<string, unknown> | null> {
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
            content: `Give me details about Indian politician "${name}". Respond ONLY with a valid JSON object, no markdown, no backticks: {"role":"current or most recent political role","party":"party abbreviation BJP or INC or AAP or SP or TMC or NCP","state":"home state full name","constituency":"constituency name or empty string","level":"National or State or Local","bio":"2-3 sentences about their political career","promises_kept":5,"promises_progress":3,"promises_broken":4,"total_promises":12}`
          }],
          temperature: 0.1,
          max_tokens: 400
        })
      });
      const data = await res.json();
      if (data.error) return null;
      const text = data.choices?.[0]?.message?.content || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }

  async function runBulkImport() {
    const nameList = names.split("\n").map(n => n.trim()).filter(n => n.length > 0);
    if (nameList.length === 0) return;
    setRunning(true);
    setDone(false);
    const initial = nameList.map(name => ({ name, status: "pending" as const }));
    setResults(initial);

    for (let i = 0; i < nameList.length; i++) {
      const name = nameList[i];
      setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "loading" } : r));
      await new Promise(r => setTimeout(r, 500));
      const data = await fetchPolitician(name);
      if (!data) {
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "error", error: "AI failed" } : r));
        continue;
      }
      const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
      const { error } = await supabase.from("politicians").insert([{ name, ...data, initials, verified: false }]);
      if (error) {
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "error", error: error.message, data } : r));
      } else {
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "success", data } : r));
      }
    }
    setRunning(false);
    setDone(true);
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

  const successCount = results.filter(r => r.status === "success").length;
  const errorCount = results.filter(r => r.status === "error").length;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #faf8f5; color: #0D1B3E; }
        .nav { background: #0D1B3E; padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; }
        .nav-logo { color: #FF6B00; font-size: 24px; font-weight: 700; font-family: Georgia, serif; text-decoration: none; }
        .nav-links { display: flex; gap: 20px; }
        .nav-link { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; }
        .nav-link:hover { color: white; }
        .container { max-width: 900px; margin: 0 auto; padding: 40px; }
        h1 { font-family: Georgia, serif; font-size: 36px; margin-bottom: 8px; }
        .subtitle { color: #666; margin-bottom: 32px; font-size: 16px; }
        .card { background: white; border-radius: 16px; padding: 32px; border: 1px solid #eee; margin-bottom: 24px; }
        .card h2 { font-family: Georgia, serif; font-size: 20px; margin-bottom: 16px; }
        textarea { width: 100%; padding: 16px; border: 2px solid #eee; border-radius: 10px; font-size: 15px; outline: none; font-family: inherit; resize: vertical; min-height: 200px; line-height: 1.8; }
        textarea:focus { border-color: #FF6B00; }
        .hint { font-size: 13px; color: #999; margin-top: 8px; }
        .run-btn { width: 100%; padding: 18px; background: #FF6B00; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: 700; cursor: pointer; margin-top: 16px; }
        .run-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .results { display: flex; flex-direction: column; gap: 10px; }
        .result-item { display: flex; align-items: center; gap: 16px; padding: 14px 18px; border-radius: 10px; border: 1px solid #eee; background: white; }
        .result-name { font-weight: 600; font-size: 15px; flex: 1; }
        .result-role { font-size: 13px; color: #666; }
        .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .badge-pending { background: #f0f0f0; color: #666; }
        .badge-loading { background: #fff3e0; color: #FF6B00; }
        .badge-success { background: #e8f8ef; color: #12A854; }
        .badge-error { background: #fde8e8; color: #e53e3e; }
        .summary { background: #e8f8ef; border: 1px solid #12A854; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
        .summary-num { font-size: 48px; font-weight: 700; font-family: Georgia, serif; color: #12A854; }
        .summary-label { color: #666; font-size: 14px; }
      `}</style>
      <nav className="nav">
        <Link href="/" className="nav-logo">Vaada</Link>
        <div className="nav-links">
          <Link href="/admin" className="nav-link">Single Add</Link>
          <Link href="/admin/bulk" className="nav-link" style={{color: "#FF6B00"}}>Bulk Import</Link>
        </div>
      </nav>
      <div className="container">
        <h1>Bulk Import Politicians</h1>
        <p className="subtitle">Paste one politician name per line. AI fills all details automatically and saves to Supabase.</p>

        {done && (
          <div className="summary">
            <div className="summary-num">{successCount}</div>
            <div className="summary-label">politicians added successfully {errorCount > 0 ? `(${errorCount} failed)` : ""}</div>
          </div>
        )}

        <div className="card">
          <h2>Politician Names</h2>
          <textarea
            placeholder={"Narendra Modi\nRahul Gandhi\nArvind Kejriwal\nYogi Adityanath\nMamata Banerjee"}
            value={names}
            onChange={e => setNames(e.target.value)}
            disabled={running}
          />
          <p className="hint">One name per line. Groq AI will auto-fill party, state, role, bio and promise scores for each.</p>
          <button className="run-btn" onClick={runBulkImport} disabled={running || names.trim().length === 0}>
            {running ? `Importing... (${successCount + errorCount}/${names.split("\n").filter(n => n.trim()).length})` : "Start Bulk Import"}
          </button>
        </div>

        {results.length > 0 && (
          <div className="card">
            <h2>Import Progress</h2>
            <div className="results">
              {results.map((r, i) => (
                <div key={i} className="result-item">
                  <div style={{flex: 1}}>
                    <div className="result-name">{r.name}</div>
                    {r.data && <div className="result-role">{String(r.data.party || "")} - {String(r.data.role || "")}</div>}
                    {r.error && <div className="result-role" style={{color: "#e53e3e"}}>{r.error}</div>}
                  </div>
                  <span className={`badge badge-${r.status}`}>
                    {r.status === "pending" ? "Waiting" : r.status === "loading" ? "Processing..." : r.status === "success" ? "Saved" : "Failed"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
