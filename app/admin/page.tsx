"use client";
import { useState, useEffect } from "react";
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

type Politician = {
  id: string;
  name: string;
  party: string;
  state: string;
};

type PromiseForm = {
  politician_id: string;
  politician_name: string;
  title: string;
  description: string;
  category: string;
  status: string;
  source: string;
  year_made: number;
};

type Promise = {
  id: string;
  politician_id: string;
  politician_name: string;
  title: string;
  description: string;
  category: string;
  status: string;
  source: string;
  year_made: number;
};

const emptyPolitician: PoliticianForm = {
  name: "", role: "", party: "", state: "", constituency: "",
  level: "National", bio: "",
  promises_kept: 0, promises_progress: 0, promises_broken: 0, total_promises: 0
};

const emptyPromise: PromiseForm = {
  politician_id: "", politician_name: "", title: "", description: "",
  category: "Infrastructure", status: "In Progress", source: "", year_made: new Date().getFullYear()
};

const CATEGORIES = ["Infrastructure", "Economy", "Healthcare", "Education", "Agriculture", "Security", "Environment", "Employment", "Welfare", "Other"];

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  // Politician state
  const [form, setForm] = useState<PoliticianForm>(emptyPolitician);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Promise state
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [promises, setPromises] = useState<Promise[]>([]);
  const [promiseForm, setPromiseForm] = useState<PromiseForm>(emptyPromise);
  const [promiseLoading, setPromiseLoading] = useState(false);
  const [promiseSaved, setPromiseSaved] = useState(false);
  const [promiseError, setPromiseError] = useState("");
  const [selectedPolitician, setSelectedPolitician] = useState("");
  const [activeTab, setActiveTab] = useState<"politicians" | "promises">("politicians");
  const [editingPromise, setEditingPromise] = useState<string | null>(null);

  function login() {
    if (pw === PASSWORD) { setAuth(true); setPwError(false); loadPoliticians(); }
    else setPwError(true);
  }

  async function loadPoliticians() {
    const { data } = await supabase.from("politicians").select("id, name, party, state").order("name");
    if (data) setPoliticians(data);
  }

  async function loadPromises(politicianId: string) {
    if (!politicianId) { setPromises([]); return; }
    const { data } = await supabase.from("promises").select("*").eq("politician_id", politicianId).order("year_made", { ascending: false });
    if (data) setPromises(data);
  }

  function updatePolitician(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function updatePromise(field: string, value: string | number) {
    setPromiseForm(f => ({ ...f, [field]: value }));
  }

  function selectPoliticianForPromise(id: string) {
    setSelectedPolitician(id);
    const p = politicians.find(p => p.id === id);
    if (p) setPromiseForm(f => ({ ...f, politician_id: p.id, politician_name: p.name }));
    loadPromises(id);
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

  async function savePolitician() {
    if (!form.name || !form.party) { setError("Name and party are required"); return; }
    setLoading(true);
    setError("");
    const initials = form.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
    const { error: err } = await supabase.from("politicians").insert([{ ...form, initials, verified: false }]);
    if (err) { setError(err.message); setLoading(false); return; }
    setSaved(true);
    setForm(emptyPolitician);
    setLoading(false);
    loadPoliticians();
    setTimeout(() => setSaved(false), 3000);
  }

  async function savePromise() {
    if (!promiseForm.politician_id) { setPromiseError("Select a politician first"); return; }
    if (!promiseForm.title) { setPromiseError("Promise title is required"); return; }
    setPromiseLoading(true);
    setPromiseError("");
    if (editingPromise) {
      const { error: err } = await supabase.from("promises").update(promiseForm).eq("id", editingPromise);
      if (err) { setPromiseError(err.message); setPromiseLoading(false); return; }
      setEditingPromise(null);
    } else {
      const { error: err } = await supabase.from("promises").insert([promiseForm]);
      if (err) { setPromiseError(err.message); setPromiseLoading(false); return; }
    }
    setPromiseSaved(true);
    setPromiseForm({ ...emptyPromise, politician_id: promiseForm.politician_id, politician_name: promiseForm.politician_name });
    loadPromises(promiseForm.politician_id);
    setPromiseLoading(false);
    setTimeout(() => setPromiseSaved(false), 3000);
  }

  async function deletePromise(id: string) {
    if (!confirm("Delete this promise?")) return;
    await supabase.from("promises").delete().eq("id", id);
    loadPromises(selectedPolitician);
  }

  function editPromise(p: Promise) {
    setPromiseForm({
      politician_id: p.politician_id,
      politician_name: p.politician_name,
      title: p.title,
      description: p.description,
      category: p.category,
      status: p.status,
      source: p.source,
      year_made: p.year_made
    });
    setEditingPromise(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const statusColor = (s: string) => s === "Kept" ? "#12A854" : s === "Broken" ? "#e53e3e" : "#FF6B00";

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
        .subtitle { color: #666; margin-bottom: 24px; }
        .tabs { display: flex; gap: 0; margin-bottom: 32px; border: 2px solid #eee; border-radius: 12px; overflow: hidden; }
        .tab { flex: 1; padding: 14px; background: white; border: none; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; color: #999; transition: all 0.2s; }
        .tab.active { background: #0D1B3E; color: white; }
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
        input[type=text], input[type=number], select, textarea { width: 100%; padding: 12px 14px; border: 2px solid #eee; border-radius: 8px; font-size: 15px; outline: none; font-family: inherit; color: #0D1B3E; }
        input[type=text]:focus, input[type=number]:focus, select:focus, textarea:focus { border-color: #FF6B00; }
        textarea { resize: vertical; min-height: 100px; }
        .nums { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; }
        .save-btn { width: 100%; padding: 16px; background: #FF6B00; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: 700; cursor: pointer; margin-top: 8px; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cancel-btn { width: 100%; padding: 14px; background: white; color: #666; border: 2px solid #eee; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 8px; }
        .success { background: #e8f8ef; color: #12A854; padding: 16px; border-radius: 10px; text-align: center; font-weight: 700; margin-bottom: 16px; border: 1px solid #12A854; }
        .error { background: #fde8e8; color: #e53e3e; padding: 16px; border-radius: 10px; text-align: center; margin-bottom: 16px; border: 1px solid #e53e3e; }
        .politician-select { width: 100%; padding: 14px; border: 2px solid #eee; border-radius: 10px; font-size: 16px; outline: none; font-family: inherit; color: #0D1B3E; margin-bottom: 24px; }
        .politician-select:focus { border-color: #FF6B00; }
        .promise-list { margin-top: 24px; }
        .promise-list h3 { font-family: Georgia, serif; font-size: 18px; margin-bottom: 16px; color: #0D1B3E; }
        .promise-item { background: #faf8f5; border-radius: 10px; padding: 16px; margin-bottom: 12px; border: 1px solid #eee; }
        .promise-item-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .promise-title { font-weight: 700; font-size: 15px; color: #0D1B3E; }
        .promise-meta { font-size: 13px; color: #666; margin-top: 4px; }
        .promise-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .edit-btn { padding: 6px 14px; background: #0D1B3E; color: white; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: inherit; font-weight: 700; }
        .del-btn { padding: 6px 14px; background: white; color: #e53e3e; border: 2px solid #e53e3e; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: inherit; font-weight: 700; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; color: white; margin-left: 8px; }
        .empty-state { text-align: center; color: #999; padding: 32px; font-size: 15px; }
        @media (max-width: 600px) { .grid2 { grid-template-columns: 1fr; } .nums { grid-template-columns: 1fr 1fr; } .container { padding: 20px; } .nav { padding: 16px 20px; } }
      `}</style>
      <nav className="nav">
        <div className="nav-logo">Vaada Admin</div>
        <div className="nav-right">Powered by Groq</div>
      </nav>
      <div className="container">
        <h1>Admin Panel</h1>
        <p className="subtitle">Manage politicians and their promises</p>

        <div className="tabs">
          <button className={`tab ${activeTab === "politicians" ? "active" : ""}`} onClick={() => setActiveTab("politicians")}>Add Politician</button>
          <button className={`tab ${activeTab === "promises" ? "active" : ""}`} onClick={() => { setActiveTab("promises"); loadPoliticians(); }}>Manage Promises</button>
        </div>

        {activeTab === "politicians" && (
          <>
            {saved && <div className="success">Politician saved successfully!</div>}
            {error && <div className="error">{error}</div>}
            <div className="card">
              <h2>AI Auto-Fill</h2>
              <div className="ai-bar">
                <input className="ai-input" type="text" placeholder="e.g. Devendra Fadnavis" value={form.name} onChange={e => updatePolitician("name", e.target.value)} onKeyDown={e => e.key === "Enter" && autoFill()} />
                <button className="ai-btn" onClick={autoFill} disabled={aiLoading}>{aiLoading ? "Filling..." : "AI Fill"}</button>
              </div>
              <p className="ai-hint">Powered by Groq - free tier. Review all fields before saving.</p>
            </div>
            <div className="card">
              <h2>Details</h2>
              <div className="grid2">
                <div className="field"><label>Name</label><input type="text" value={form.name} onChange={e => updatePolitician("name", e.target.value)} /></div>
                <div className="field"><label>Role / Title</label><input type="text" value={form.role} onChange={e => updatePolitician("role", e.target.value)} /></div>
                <div className="field"><label>Party</label><input type="text" value={form.party} onChange={e => updatePolitician("party", e.target.value)} /></div>
                <div className="field"><label>State</label><input type="text" value={form.state} onChange={e => updatePolitician("state", e.target.value)} /></div>
                <div className="field"><label>Constituency</label><input type="text" value={form.constituency} onChange={e => updatePolitician("constituency", e.target.value)} /></div>
                <div className="field"><label>Level</label>
                  <select value={form.level} onChange={e => updatePolitician("level", e.target.value)}>
                    <option>National</option><option>State</option><option>Local</option>
                  </select>
                </div>
              </div>
              <div className="field"><label>Bio</label><textarea value={form.bio} onChange={e => updatePolitician("bio", e.target.value)} /></div>
              <div className="nums">
                <div className="field"><label>Total</label><input type="number" min="0" value={form.total_promises} onChange={e => updatePolitician("total_promises", parseInt(e.target.value) || 0)} /></div>
                <div className="field"><label>Kept</label><input type="number" min="0" value={form.promises_kept} onChange={e => updatePolitician("promises_kept", parseInt(e.target.value) || 0)} /></div>
                <div className="field"><label>In Progress</label><input type="number" min="0" value={form.promises_progress} onChange={e => updatePolitician("promises_progress", parseInt(e.target.value) || 0)} /></div>
                <div className="field"><label>Broken</label><input type="number" min="0" value={form.promises_broken} onChange={e => updatePolitician("promises_broken", parseInt(e.target.value) || 0)} /></div>
              </div>
              <button className="save-btn" onClick={savePolitician} disabled={loading}>{loading ? "Saving..." : "Save Politician"}</button>
            </div>
          </>
        )}

        {activeTab === "promises" && (
          <>
            {promiseSaved && <div className="success">{editingPromise ? "Promise updated!" : "Promise saved successfully!"}</div>}
            {promiseError && <div className="error">{promiseError}</div>}

            <div className="card">
              <h2>{editingPromise ? "Edit Promise" : "Add Promise"}</h2>
              <div className="field">
                <label>Select Politician</label>
                <select className="politician-select" value={selectedPolitician} onChange={e => selectPoliticianForPromise(e.target.value)}>
                  <option value="">-- Choose a politician --</option>
                  {politicians.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.party} - {p.state})</option>
                  ))}
                </select>
              </div>
              <div className="field"><label>Promise Title</label><input type="text" placeholder="e.g. Build 100 new schools in 2 years" value={promiseForm.title} onChange={e => updatePromise("title", e.target.value)} /></div>
              <div className="field"><label>Description</label><textarea placeholder="More details about the promise..." value={promiseForm.description} onChange={e => updatePromise("description", e.target.value)} /></div>
              <div className="grid2">
                <div className="field">
                  <label>Category</label>
                  <select value={promiseForm.category} onChange={e => updatePromise("category", e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select value={promiseForm.status} onChange={e => updatePromise("status", e.target.value)}>
                    <option>In Progress</option>
                    <option>Kept</option>
                    <option>Broken</option>
                  </select>
                </div>
                <div className="field"><label>Source URL</label><input type="text" placeholder="https://..." value={promiseForm.source} onChange={e => updatePromise("source", e.target.value)} /></div>
                <div className="field"><label>Year Made</label><input type="number" min="2000" max="2030" value={promiseForm.year_made} onChange={e => updatePromise("year_made", parseInt(e.target.value) || 2024)} /></div>
              </div>
              <button className="save-btn" onClick={savePromise} disabled={promiseLoading}>{promiseLoading ? "Saving..." : editingPromise ? "Update Promise" : "Save Promise"}</button>
              {editingPromise && <button className="cancel-btn" onClick={() => { setEditingPromise(null); setPromiseForm({ ...emptyPromise, politician_id: promiseForm.politician_id, politician_name: promiseForm.politician_name }); }}>Cancel Edit</button>}
            </div>

            {selectedPolitician && (
              <div className="card">
                <h2>Promises for {politicians.find(p => p.id === selectedPolitician)?.name}</h2>
                {promises.length === 0 ? (
                  <div className="empty-state">No promises added yet. Add one above.</div>
                ) : (
                  <div className="promise-list">
                    {promises.map(p => (
                      <div key={p.id} className="promise-item">
                        <div className="promise-item-top">
                          <div>
                            <div className="promise-title">
                              {p.title}
                              <span className="status-badge" style={{ background: statusColor(p.status) }}>{p.status}</span>
                            </div>
                            <div className="promise-meta">{p.category} - {p.year_made}</div>
                          </div>
                          <div className="promise-actions">
                            <button className="edit-btn" onClick={() => editPromise(p)}>Edit</button>
                            <button className="del-btn" onClick={() => deletePromise(p.id)}>Delete</button>
                          </div>
                        </div>
                        {p.description && <div style={{ fontSize: 14, color: "#666", marginTop: 8 }}>{p.description}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
