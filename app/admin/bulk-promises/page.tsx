"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

const PASSWORD = "vaada2024";

type Politician = {
  id: string;
  name: string;
  party: string;
  state: string;
};

type PromiseResult = {
  title: string;
  description: string;
  category: string;
  status: string;
  year_made: number;
};

type PoliticianProgress = {
  id: string;
  name: string;
  party: string;
  status: "pending" | "running" | "done" | "error";
  promisesAdded: number;
  error?: string;
};

const CATEGORY_GROUPS = [
  { label: "Infrastructure & Economy", categories: ["Infrastructure", "Economy"] },
  { label: "Healthcare & Education", categories: ["Healthcare", "Education"] },
  { label: "Agriculture & Employment", categories: ["Agriculture", "Employment"] },
  { label: "Security, Environment & Welfare", categories: ["Security", "Environment", "Welfare"] },
];

export default function BulkPromises() {
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [progress, setProgress] = useState<PoliticianProgress[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [totalAdded, setTotalAdded] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [currentAction, setCurrentAction] = useState("");

  function login() {
    if (pw === PASSWORD) { setAuth(true); setPwError(false); loadPoliticians(); }
    else setPwError(true);
  }

  async function loadPoliticians() {
    const { data } = await supabase.from("politicians").select("id, name, party, state").order("name");
    if (data) {
      setPoliticians(data);
      setSelectedIds(data.map(p => p.id));
    }
  }

  function togglePolitician(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    if (selectAll) { setSelectedIds([]); setSelectAll(false); }
    else { setSelectedIds(politicians.map(p => p.id)); setSelectAll(true); }
  }

  async function fetchPromisesForCategory(name: string, party: string, state: string, categoryGroup: typeof CATEGORY_GROUPS[0]): Promise<PromiseResult[]> {
    const categories = categoryGroup.categories.join(" and ");
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
            content: `List ALL known campaign promises made by Indian politician ${name} (${party}, ${state}) specifically related to ${categories}. Include promises from ALL their elections, manifestos, public speeches, and press conferences. Be exhaustive - include every promise you know about in these categories.

Respond ONLY with a valid JSON array, no markdown, no backticks:
[
  {
    "title": "short promise title",
    "description": "what exactly was promised",
    "category": "one of: ${categoryGroup.categories.join(", ")}",
    "status": "one of: Kept, In Progress, Broken",
    "year_made": 2019
  }
]

Include at minimum 5 promises, ideally 8-12 if you know them. Only include real, verifiable promises.`
          }],
          temperature: 0.2,
          max_tokens: 1500
        })
      });
      const data = await res.json();
      if (data.error) return [];
      const text = data.choices?.[0]?.message?.content || "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];
      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async function runBulkImport() {
    const toProcess = politicians.filter(p => selectedIds.includes(p.id));
    if (toProcess.length === 0) return;

    setRunning(true);
    setDone(false);
    setTotalAdded(0);

    const initial: PoliticianProgress[] = toProcess.map(p => ({
      id: p.id,
      name: p.name,
      party: p.party,
      status: "pending",
      promisesAdded: 0,
    }));
    setProgress(initial);

    let grandTotal = 0;

    for (let i = 0; i < toProcess.length; i++) {
      const pol = toProcess[i];

      setProgress(prev => prev.map(p => p.id === pol.id ? { ...p, status: "running" } : p));

      let polTotal = 0;

      for (const group of CATEGORY_GROUPS) {
        setCurrentAction(`${pol.name} - fetching ${group.label}...`);
        await new Promise(r => setTimeout(r, 800));

        const promises = await fetchPromisesForCategory(pol.name, pol.party, pol.state, group);

        if (promises.length > 0) {
          const toInsert = promises.map(p => ({
            politician_id: pol.id,
            politician_name: pol.name,
            title: p.title || "",
            description: p.description || "",
            category: p.category || group.categories[0],
            status: ["Kept", "In Progress", "Broken"].includes(p.status) ? p.status : "In Progress",
            year_made: p.year_made || 2019,
            source: "",
          }));

          const { error } = await supabase.from("promises").insert(toInsert);
          if (!error) {
            polTotal += promises.length;
            grandTotal += promises.length;
            setTotalAdded(grandTotal);
          }
        }

        setProgress(prev => prev.map(p => p.id === pol.id ? { ...p, promisesAdded: polTotal } : p));
      }

      // Update politician promise counts
      const { data: allPromises } = await supabase
        .from("promises")
        .select("status")
        .eq("politician_id", pol.id);

      if (allPromises) {
        const kept = allPromises.filter(p => p.status === "Kept").length;
        const progress_count = allPromises.filter(p => p.status === "In Progress").length;
        const broken = allPromises.filter(p => p.status === "Broken").length;
        await supabase.from("politicians").update({
          promises_kept: kept,
          promises_progress: progress_count,
          promises_broken: broken,
          total_promises: allPromises.length,
        }).eq("id", pol.id);
      }

      setProgress(prev => prev.map(p =>
        p.id === pol.id ? { ...p, status: polTotal > 0 ? "done" : "error", promisesAdded: polTotal, error: polTotal === 0 ? "No promises found" : undefined } : p
      ));
    }

    setCurrentAction("");
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

  const doneCount = progress.filter(p => p.status === "done").length;
  const errorCount = progress.filter(p => p.status === "error").length;
  const runningCount = progress.filter(p => p.status === "running").length;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #faf8f5; color: #0D1B3E; }
        .nav { background: #0D1B3E; padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; }
        .nav-logo { color: #FF6B00; font-size: 24px; font-weight: 700; font-family: Georgia, serif; text-decoration: none; }
        .nav-links { display: flex; gap: 20px; align-items: center; }
        .nav-link { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; }
        .nav-link:hover { color: white; }
        .nav-link-active { color: #FF6B00 !important; font-weight: 700; }
        .container { max-width: 900px; margin: 0 auto; padding: 40px; }
        h1 { font-family: Georgia, serif; font-size: 36px; margin-bottom: 8px; }
        .subtitle { color: #666; margin-bottom: 32px; font-size: 16px; line-height: 1.6; }
        .card { background: white; border-radius: 16px; padding: 32px; border: 1px solid #eee; margin-bottom: 24px; }
        .card h2 { font-family: Georgia, serif; font-size: 20px; margin-bottom: 20px; }
        .how-it-works { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .step { background: #faf8f5; border-radius: 10px; padding: 16px; text-align: center; border: 1px solid #eee; }
        .step-num { font-size: 24px; font-weight: 700; font-family: Georgia, serif; color: #FF6B00; margin-bottom: 8px; }
        .step-label { font-size: 13px; color: #555; line-height: 1.4; }
        .pol-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-height: 320px; overflow-y: auto; border: 1px solid #eee; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
        .pol-check { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
        .pol-check:hover { background: #faf8f5; }
        .pol-check input { width: 16px; height: 16px; cursor: pointer; accent-color: #FF6B00; }
        .pol-name { font-size: 14px; font-weight: 600; color: #0D1B3E; }
        .pol-party { font-size: 12px; color: #888; }
        .select-all-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .select-all-btn { font-size: 14px; color: #FF6B00; cursor: pointer; font-weight: 600; background: none; border: none; font-family: inherit; }
        .selected-count { font-size: 14px; color: #666; }
        .warning { background: #fff8e8; border: 1px solid #f0a500; border-radius: 10px; padding: 16px; font-size: 14px; color: #7a5c00; margin-bottom: 16px; line-height: 1.6; }
        .run-btn { width: 100%; padding: 18px; background: #FF6B00; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: 700; cursor: pointer; }
        .run-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .summary-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .sum { background: white; border-radius: 10px; padding: 16px; border: 1px solid #eee; text-align: center; }
        .sum-num { font-family: Georgia, serif; font-size: 32px; font-weight: 700; }
        .sum-label { font-size: 12px; color: #666; margin-top: 4px; }
        .current-action { background: #fff3e8; border: 1px solid #FF6B00; border-radius: 10px; padding: 14px 20px; font-size: 14px; color: #FF6B00; font-weight: 600; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .spinner { width: 16px; height: 16px; border: 2px solid #FF6B00; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .progress-list { display: flex; flex-direction: column; gap: 10px; }
        .progress-item { display: flex; align-items: center; gap: 16px; padding: 14px 18px; border-radius: 10px; border: 1px solid #eee; background: white; }
        .progress-item.running { border-color: #FF6B00; background: #fff8f3; }
        .progress-item.done { border-color: #12A854; background: #f0fbf5; }
        .progress-item.error { border-color: #e53e3e; background: #fdf0f0; }
        .progress-name { font-weight: 700; font-size: 15px; flex: 1; }
        .progress-party { font-size: 12px; color: #888; margin-top: 2px; }
        .progress-count { font-size: 14px; font-weight: 700; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; }
        .badge-pending { background: #f0f0f0; color: #666; }
        .badge-running { background: #fff3e8; color: #FF6B00; }
        .badge-done { background: #e8f8ef; color: #12A854; }
        .badge-error { background: #fde8e8; color: #e53e3e; }
        .done-banner { background: #e8f8ef; border: 1px solid #12A854; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; }
        .done-num { font-family: Georgia, serif; font-size: 56px; font-weight: 700; color: #12A854; }
        .done-label { color: #555; font-size: 16px; margin-top: 4px; }
        @media (max-width: 768px) {
          .nav { padding: 16px 20px; }
          .container { padding: 20px; }
          .how-it-works { grid-template-columns: repeat(2, 1fr); }
          .pol-grid { grid-template-columns: 1fr; }
          .summary-bar { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <nav className="nav">
        <Link href="/" className="nav-logo">Vaada</Link>
        <div className="nav-links">
          <Link href="/admin" className="nav-link">Admin</Link>
          <Link href="/admin/bulk" className="nav-link">Bulk Politicians</Link>
          <Link href="/admin/bulk-promises" className="nav-link nav-link-active">Bulk Promises</Link>
        </div>
      </nav>

      <div className="container">
        <h1>Bulk Promise Importer</h1>
        <p className="subtitle">
          Automatically fetch ALL known campaign promises for every politician using AI. 
          Each politician gets 4 category passes - Infrastructure, Economy, Healthcare, Education, Agriculture, Employment, Security, Environment and Welfare - to extract every promise exhaustively.
        </p>

        {done && (
          <div className="done-banner">
            <div className="done-num">{totalAdded}</div>
            <div className="done-label">promises added to database ({doneCount} politicians processed, {errorCount} failed)</div>
          </div>
        )}

        <div className="card">
          <h2>How it works</h2>
          <div className="how-it-works">
            <div className="step"><div className="step-num">1</div><div className="step-label">Select which politicians to process</div></div>
            <div className="step"><div className="step-num">4</div><div className="step-label">AI calls per politician across all categories</div></div>
            <div className="step"><div className="step-num">8-12</div><div className="step-label">Promises extracted per category group</div></div>
            <div className="step"><div className="step-num">Auto</div><div className="step-label">Promise counts updated on politician profile</div></div>
          </div>

          <div className="select-all-row">
            <span className="selected-count">{selectedIds.length} of {politicians.length} politicians selected</span>
            <button className="select-all-btn" onClick={toggleAll}>{selectAll ? "Deselect all" : "Select all"}</button>
          </div>

          <div className="pol-grid">
            {politicians.map(p => (
              <label key={p.id} className="pol-check">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(p.id)}
                  onChange={() => togglePolitician(p.id)}
                  disabled={running}
                />
                <div>
                  <div className="pol-name">{p.name}</div>
                  <div className="pol-party">{p.party} - {p.state}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="warning">
            This will make {selectedIds.length * 4} AI API calls and may take {Math.ceil(selectedIds.length * 4 * 1.5 / 60)} - {Math.ceil(selectedIds.length * 4 * 2.5 / 60)} minutes to complete. Keep this tab open. Existing promises for selected politicians will be supplemented, not replaced.
          </div>

          <button
            className="run-btn"
            onClick={runBulkImport}
            disabled={running || selectedIds.length === 0}
          >
            {running
              ? `Running... ${doneCount + errorCount}/${selectedIds.length} politicians done`
              : `Start Bulk Import for ${selectedIds.length} politicians`}
          </button>
        </div>

        {progress.length > 0 && (
          <>
            <div className="summary-bar">
              <div className="sum"><div className="sum-num" style={{ color: "#FF6B00" }}>{totalAdded}</div><div className="sum-label">Promises added</div></div>
              <div className="sum"><div className="sum-num" style={{ color: "#12A854" }}>{doneCount}</div><div className="sum-label">Politicians done</div></div>
              <div className="sum"><div className="sum-num" style={{ color: "#f0a500" }}>{runningCount}</div><div className="sum-label">Running now</div></div>
              <div className="sum"><div className="sum-num" style={{ color: "#e53e3e" }}>{errorCount}</div><div className="sum-label">Failed</div></div>
            </div>

            {currentAction && (
              <div className="current-action">
                <div className="spinner"></div>
                {currentAction}
              </div>
            )}

            <div className="card">
              <h2>Import Progress</h2>
              <div className="progress-list">
                {progress.map(p => (
                  <div key={p.id} className={`progress-item ${p.status}`}>
                    <div style={{ flex: 1 }}>
                      <div className="progress-name">{p.name}</div>
                      <div className="progress-party">{p.party}</div>
                    </div>
                    <div className="progress-count" style={{ color: p.status === "done" ? "#12A854" : p.status === "error" ? "#e53e3e" : "#666" }}>
                      {p.promisesAdded > 0 ? `${p.promisesAdded} promises` : ""}
                    </div>
                    <span className={`status-badge badge-${p.status}`}>
                      {p.status === "pending" ? "Waiting" : p.status === "running" ? "Processing..." : p.status === "done" ? "Done" : p.error || "Failed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
