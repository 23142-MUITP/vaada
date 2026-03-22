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

  // Politician add state
  const [form, setForm] = useState<PoliticianForm>(emptyPolitician);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Edit politician state
  const [editForm, setEditForm] = useState<PoliticianForm>(emptyPolitician);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSearch, setEditSearch] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editSaved, setEditSaved] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Promise state
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [promises, setPromises] = useState<Promise[]>([]);
  const [promiseForm, setPromiseForm] = useState<PromiseForm>(emptyPromise);
  const [promiseLoading, setPromiseLoading] = useState(false);
  const [promiseSaved, setPromiseSaved] = useState(false);
  const [promiseError, setPromiseError] = useState("");
  const [selectedPolitician, setSelectedPolitician] = useState("");
  const [activeTab, setActiveTab] = useState<"politicians" | "edit" | "promises" | "suggestions">("politicians");

  // Suggestions state
  const [suggestions, setSuggestions] = useState<{id: string; politician_name: string; state: string; suggestion_type: string; message: string; contact_email: string; status: string; created_at: string;}[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
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

  function updateEditForm(field: string, value: string | number) {
    setEditForm(f => ({ ...f, [field]: value }));
  }

  function updatePromise(field: string, value: string | number) {
    setPromiseForm(f => ({ ...f, [field]: value }));
  }

  async function selectPoliticianToEdit(id: string) {
    setEditingId(id);
    setEditError("");
    setEditSaved(false);
    setDeleteConfirm(false);
    const { data } = await supabase.from("politicians").select("*").eq("id", id).single();
    if (data) {
      setEditForm({
        name: data.name || "",
        role: data.role || "",
        party: data.party || "",
        state: data.state || "",
        constituency: data.constituency || "",
        level: data.level || "National",
        bio: data.bio || "",
        promises_kept: data.promises_kept || 0,
        promises_progress: data.promises_progress || 0,
        promises_broken: data.promises_broken || 0,
        total_promises: data.total_promises || 0,
      });
    }
  }

  async function saveEdit() {
    if (!editingId) return;
    if (!editForm.name || !editForm.party) { setEditError("Name and party are required"); return; }
    setEditLoading(true);
    setEditError("");
    const initials = editForm.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
    const { error: err } = await supabase.from("politicians").update({ ...editForm, initials }).eq("id", editingId);
    if (err) { setEditError(err.message); setEditLoading(false); return; }
    setEditSaved(true);
    setEditLoading(false);
    loadPoliticians();
    setTimeout(() => setEditSaved(false), 3000);
  }

  async function deletePolitician() {
    if (!editingId) return;
    setEditLoading(true);
    await supabase.from("promises").delete().eq("politician_id", editingId);
    const { error: err } = await supabase.from("politicians").delete().eq("id", editingId);
    if (err) { setEditError(err.message); setEditLoading(false); return; }
    setEditingId(null);
    setEditForm(emptyPolitician);
    setDeleteConfirm(false);
    setEditLoading(false);
    loadPoliticians();
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

  async function loadSuggestions() {
    setSuggestionsLoading(true);
    const { data } = await supabase.from("suggestions").select("*").order("created_at", { ascending: false });
    if (data) setSuggestions(data);
    setSuggestionsLoading(false);
  }

  async function updateSuggestionStatus(id: string, status: string) {
    await supabase.from("suggestions").update({ status }).eq("id", id);
    loadSuggestions();
  }

  async function deleteSuggestion(id: string) {
    await supabase.from("suggestions").delete().eq("id", id);
    loadSuggestions();
  }

  const statusColor = (s: string) => s === "Kept" ? "#12A854" : s === "Broken" ? "#e53e3e" : "#FF6B00";

  const filteredPoliticians = politicians.filter(p =>
    p.name.toLowerCase().includes(editSearch.toLowerCase()) ||
    p.party?.toLowerCase().includes(editSearch.toLowerCase()) ||
    p.state?.toLowerCase().includes(editSearch.toLowerCase())
  );

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
        .tab { flex: 1; padding: 14px; background: white; border: none; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; color: #999; transition: all 0.2s; }
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
        .delete-btn { width: 100%; padding: 14px; background: white; color: #e53e3e; border: 2px solid #e53e3e; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 8px; }
        .delete-confirm-btn { width: 100%; padding: 14px; background: #e53e3e; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 8px; }
        .success { background: #e8f8ef; color: #12A854; padding: 16px; border-radius: 10px; text-align: center; font-weight: 700; margin-bottom: 16px; border: 1px solid #12A854; }
        .error { background: #fde8e8; color: #e53e3e; padding: 16px; border-radius: 10px; text-align: center; margin-bottom: 16px; border: 1px solid #e53e3e; }
        .politician-select { width: 100%; padding: 14px; border: 2px solid #eee; border-radius: 10px; font-size: 16px; outline: none; font-family: inherit; color: #0D1B3E; margin-bottom: 16px; }
        .politician-select:focus { border-color: #FF6B00; }
        .search-input { width: 100%; padding: 12px 16px; border: 2px solid #eee; border-radius: 10px; font-size: 15px; outline: none; font-family: inherit; color: #0D1B3E; margin-bottom: 12px; }
        .search-input:focus { border-color: #FF6B00; }
        .pol-list { max-height: 280px; overflow-y: auto; border: 1px solid #eee; border-radius: 10px; margin-bottom: 24px; }
        .pol-item { padding: 12px 16px; cursor: pointer; border-bottom: 1px solid #f5f5f5; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s; }
        .pol-item:last-child { border-bottom: none; }
        .pol-item:hover { background: #faf8f5; }
        .pol-item.selected { background: #fff3e8; border-left: 3px solid #FF6B00; }
        .pol-item-name { font-weight: 700; font-size: 14px; color: #0D1B3E; }
        .pol-item-meta { font-size: 12px; color: #888; margin-top: 2px; }
        .pol-item-arrow { color: #FF6B00; font-size: 18px; }
        .promise-list { margin-top: 24px; }
        .promise-item { background: #faf8f5; border-radius: 10px; padding: 16px; margin-bottom: 12px; border: 1px solid #eee; }
        .promise-item-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .promise-title { font-weight: 700; font-size: 15px; color: #0D1B3E; }
        .promise-meta { font-size: 13px; color: #666; margin-top: 4px; }
        .promise-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .edit-btn { padding: 6px 14px; background: #0D1B3E; color: white; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: inherit; font-weight: 700; }
        .del-btn { padding: 6px 14px; background: white; color: #e53e3e; border: 2px solid #e53e3e; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: inherit; font-weight: 700; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; color: white; margin-left: 8px; }
        .empty-state { text-align: center; color: #999; padding: 32px; font-size: 15px; }
        .warning-box { background: #fff8e8; border: 1px solid #f0a500; border-radius: 10px; padding: 16px; margin-top: 16px; font-size: 14px; color: #7a5c00; }
        .suggestion-item { background: #faf8f5; border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 1px solid #eee; }
        .suggestion-item.reviewed { opacity: 0.6; }
        .suggestion-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
        .suggestion-type { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #FF6B00; margin-bottom: 4px; }
        .suggestion-who { font-weight: 700; font-size: 15px; color: #0D1B3E; }
        .suggestion-meta { font-size: 13px; color: #888; margin-top: 2px; }
        .suggestion-message { font-size: 14px; color: #444; line-height: 1.6; margin-bottom: 12px; background: white; padding: 12px; border-radius: 8px; border: 1px solid #eee; }
        .suggestion-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .sug-btn { padding: 7px 16px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; border: none; }
        .sug-btn-green { background: #e8f8ef; color: #12A854; }
        .sug-btn-orange { background: #fff3e8; color: #FF6B00; }
        .sug-btn-red { background: white; color: #e53e3e; border: 1px solid #e53e3e !important; }
        .status-pill { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .status-pill-pending { background: #fff3e8; color: #FF6B00; }
        .status-pill-reviewed { background: #e8f8ef; color: #12A854; }
        .status-pill-dismissed { background: #f5f5f5; color: #999; }
        .suggestion-date { font-size: 12px; color: #aaa; }
        .suggestions-summary { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
        .sum-card { background: white; border-radius: 10px; padding: 16px 24px; border: 1px solid #eee; text-align: center; }
        .sum-num { font-family: Georgia, serif; font-size: 28px; font-weight: 700; }
        .sum-label { font-size: 12px; color: #666; margin-top: 2px; }
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
          <button className={`tab ${activeTab === "edit" ? "active" : ""}`} onClick={() => { setActiveTab("edit"); loadPoliticians(); }}>Edit Politician</button>
          <button className={`tab ${activeTab === "promises" ? "active" : ""}`} onClick={() => { setActiveTab("promises"); loadPoliticians(); }}>Manage Promises</button>
          <button className={`tab ${activeTab === "suggestions" ? "active" : ""}`} onClick={() => { setActiveTab("suggestions"); loadSuggestions(); }}>Suggestions {suggestions.filter(s => s.status === "pending").length > 0 ? `(${suggestions.filter(s => s.status === "pending").length})` : ""}</button>
        </div>

        {/* ADD POLITICIAN TAB */}
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

        {/* EDIT POLITICIAN TAB */}
        {activeTab === "edit" && (
          <>
            {editSaved && <div className="success">Politician updated successfully!</div>}
            {editError && <div className="error">{editError}</div>}
            <div className="card">
              <h2>Select Politician to Edit</h2>
              <input
                className="search-input"
                type="text"
                placeholder="Search by name, party, state..."
                value={editSearch}
                onChange={e => setEditSearch(e.target.value)}
              />
              <div className="pol-list">
                {filteredPoliticians.length === 0 ? (
                  <div className="empty-state">No politicians found</div>
                ) : filteredPoliticians.map(p => (
                  <div key={p.id} className={`pol-item ${editingId === p.id ? "selected" : ""}`} onClick={() => selectPoliticianToEdit(p.id)}>
                    <div>
                      <div className="pol-item-name">{p.name}</div>
                      <div className="pol-item-meta">{p.party} - {p.state}</div>
                    </div>
                    <div className="pol-item-arrow">›</div>
                  </div>
                ))}
              </div>

              {editingId && (
                <>
                  <h2 style={{marginBottom: 20}}>Editing: {editForm.name}</h2>
                  <div className="grid2">
                    <div className="field"><label>Name</label><input type="text" value={editForm.name} onChange={e => updateEditForm("name", e.target.value)} /></div>
                    <div className="field"><label>Role / Title</label><input type="text" value={editForm.role} onChange={e => updateEditForm("role", e.target.value)} /></div>
                    <div className="field"><label>Party</label><input type="text" value={editForm.party} onChange={e => updateEditForm("party", e.target.value)} /></div>
                    <div className="field"><label>State</label><input type="text" value={editForm.state} onChange={e => updateEditForm("state", e.target.value)} /></div>
                    <div className="field"><label>Constituency</label><input type="text" value={editForm.constituency} onChange={e => updateEditForm("constituency", e.target.value)} /></div>
                    <div className="field"><label>Level</label>
                      <select value={editForm.level} onChange={e => updateEditForm("level", e.target.value)}>
                        <option>National</option><option>State</option><option>Local</option>
                      </select>
                    </div>
                  </div>
                  <div className="field"><label>Bio</label><textarea value={editForm.bio} onChange={e => updateEditForm("bio", e.target.value)} /></div>
                  <div className="nums">
                    <div className="field"><label>Total</label><input type="number" min="0" value={editForm.total_promises} onChange={e => updateEditForm("total_promises", parseInt(e.target.value) || 0)} /></div>
                    <div className="field"><label>Kept</label><input type="number" min="0" value={editForm.promises_kept} onChange={e => updateEditForm("promises_kept", parseInt(e.target.value) || 0)} /></div>
                    <div className="field"><label>In Progress</label><input type="number" min="0" value={editForm.promises_progress} onChange={e => updateEditForm("promises_progress", parseInt(e.target.value) || 0)} /></div>
                    <div className="field"><label>Broken</label><input type="number" min="0" value={editForm.promises_broken} onChange={e => updateEditForm("promises_broken", parseInt(e.target.value) || 0)} /></div>
                  </div>
                  <button className="save-btn" onClick={saveEdit} disabled={editLoading}>{editLoading ? "Saving..." : "Update Politician"}</button>
                  {!deleteConfirm ? (
                    <button className="delete-btn" onClick={() => setDeleteConfirm(true)}>Delete Politician</button>
                  ) : (
                    <>
                      <div className="warning-box">This will permanently delete {editForm.name} and all their promises. This cannot be undone.</div>
                      <button className="delete-confirm-btn" onClick={deletePolitician} disabled={editLoading}>Confirm Delete</button>
                      <button className="cancel-btn" onClick={() => setDeleteConfirm(false)}>Cancel</button>
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* MANAGE PROMISES TAB */}
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
        {/* SUGGESTIONS TAB */}
        {activeTab === "suggestions" && (
          <>
            <div className="suggestions-summary">
              <div className="sum-card">
                <div className="sum-num" style={{ color: "#FF6B00" }}>{suggestions.filter(s => s.status === "pending").length}</div>
                <div className="sum-label">Pending</div>
              </div>
              <div className="sum-card">
                <div className="sum-num" style={{ color: "#12A854" }}>{suggestions.filter(s => s.status === "reviewed").length}</div>
                <div className="sum-label">Reviewed</div>
              </div>
              <div className="sum-card">
                <div className="sum-num" style={{ color: "#999" }}>{suggestions.length}</div>
                <div className="sum-label">Total</div>
              </div>
            </div>

            <div className="card">
              <h2>User Suggestions</h2>
              {suggestionsLoading ? (
                <div className="empty-state">Loading suggestions...</div>
              ) : suggestions.length === 0 ? (
                <div className="empty-state">No suggestions yet. They will appear here when users submit them.</div>
              ) : (
                suggestions.map(s => (
                  <div key={s.id} className={`suggestion-item ${s.status !== "pending" ? "reviewed" : ""}`}>
                    <div className="suggestion-top">
                      <div>
                        <div className="suggestion-type">{s.suggestion_type}</div>
                        <div className="suggestion-who">
                          {s.politician_name ? s.politician_name : "General suggestion"}
                          {s.state ? ` - ${s.state}` : ""}
                        </div>
                        {s.contact_email && <div className="suggestion-meta">{s.contact_email}</div>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                        <span className={`status-pill status-pill-${s.status}`}>{s.status}</span>
                        <span className="suggestion-date">{new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                    <div className="suggestion-message">{s.message}</div>
                    <div className="suggestion-actions">
                      {s.status !== "reviewed" && (
                        <button className="sug-btn sug-btn-green" onClick={() => updateSuggestionStatus(s.id, "reviewed")}>Mark Reviewed</button>
                      )}
                      {s.status !== "pending" && (
                        <button className="sug-btn sug-btn-orange" onClick={() => updateSuggestionStatus(s.id, "pending")}>Mark Pending</button>
                      )}
                      <button className="sug-btn sug-btn-red" onClick={() => deleteSuggestion(s.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
