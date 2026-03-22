"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Politician = {
  id: string;
  name: string;
  role: string;
  party: string;
  state: string;
  promises_kept: number;
  promises_progress: number;
  promises_broken: number;
  total_promises: number;
};

function PoliticiansContent() {
  const searchParams = useSearchParams();
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [activeParty, setActiveParty] = useState(searchParams.get("filter") || "All");
  const [activeState, setActiveState] = useState("All");
  const [states, setStates] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("politicians").select("*").order("name");
      if (data) {
        setPoliticians(data);
        const uniqueStates = Array.from(new Set(data.map(p => p.state).filter(Boolean))).sort() as string[];
        setStates(uniqueStates);
      }
      setLoading(false);
    }
    load();
  }, []);

  function getInitials(name: string) {
    return name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  function getScore(p: Politician) {
    if (!p.total_promises) return 0;
    return Math.round((p.promises_kept / p.total_promises) * 100);
  }

  function getScoreColor(score: number) {
    if (score >= 60) return "#12A854";
    if (score >= 30) return "#f0a500";
    return "#e53e3e";
  }

  const parties = ["All", "BJP", "INC", "AAP", "SP", "TMC", "NCP", "BSP"];

  const filtered = politicians.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.party?.toLowerCase().includes(search.toLowerCase()) || p.state?.toLowerCase().includes(search.toLowerCase()) || p.role?.toLowerCase().includes(search.toLowerCase());
    const matchParty = activeParty === "All" || p.party === activeParty;
    const matchState = activeState === "All" || p.state === activeState;
    return matchSearch && matchParty && matchState;
  });

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #faf8f5; color: #0D1B3E; }
        .nav { background: #0D1B3E; padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; }
        .nav-logo { color: #FF6B00; font-size: 24px; font-weight: 700; font-family: Georgia, serif; text-decoration: none; }
        .nav-links { display: flex; gap: 24px; }
        .nav-links a { color: #fff; text-decoration: none; font-size: 14px; opacity: 0.8; }
        .nav-links a:hover { opacity: 1; color: #FF6B00; }
        .hero { background: #0D1B3E; padding: 60px 40px 40px; color: white; }
        .hero h1 { font-family: Georgia, serif; font-size: 48px; margin-bottom: 12px; }
        .hero h1 span { color: #FF6B00; }
        .hero p { opacity: 0.7; font-size: 18px; }
        .controls { padding: 24px 40px; background: white; border-bottom: 1px solid #eee; position: sticky; top: 0; z-index: 10; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .search-row { display: flex; gap: 12px; margin-bottom: 16px; }
        .search-input { flex: 1; padding: 12px 20px; border: 2px solid #eee; border-radius: 8px; font-size: 15px; outline: none; font-family: inherit; }
        .search-input:focus { border-color: #FF6B00; }
        .clear-btn { padding: 12px 20px; border: 2px solid #eee; border-radius: 8px; background: white; font-size: 14px; cursor: pointer; font-family: inherit; color: #666; white-space: nowrap; }
        .clear-btn:hover { border-color: #e53e3e; color: #e53e3e; }
        .filter-group { margin-bottom: 12px; }
        .filter-group:last-child { margin-bottom: 0; }
        .filter-label { font-size: 11px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
        .filter-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .filter-btn { padding: 6px 16px; border-radius: 20px; border: 2px solid #eee; background: white; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.15s; font-family: inherit; color: #666; }
        .filter-btn.active { background: #0D1B3E; border-color: #0D1B3E; color: white; }
        .filter-btn:hover:not(.active) { border-color: #FF6B00; color: #FF6B00; }
        .state-select { padding: 6px 14px; border-radius: 20px; border: 2px solid #eee; background: white; cursor: pointer; font-size: 13px; font-weight: 600; font-family: inherit; color: #666; outline: none; }
        .state-select:focus { border-color: #FF6B00; }
        .results-info { padding: 16px 40px; color: #666; font-size: 14px; display: flex; justify-content: space-between; align-items: center; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; padding: 0 40px 60px; }
        .card { background: white; border-radius: 16px; padding: 24px; border: 1px solid #eee; transition: all 0.2s; text-decoration: none; color: inherit; display: block; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); border-color: #FF6B00; }
        .card-top { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .avatar { width: 56px; height: 56px; border-radius: 12px; background: linear-gradient(135deg, #FF6B00, #e55a00); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex-shrink: 0; font-family: Georgia, serif; }
        .card-name { font-family: Georgia, serif; font-size: 20px; font-weight: 700; margin-bottom: 4px; color: #0D1B3E; }
        .card-role { font-size: 13px; color: #666; margin-bottom: 8px; }
        .card-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .party-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; background: #fff3e8; color: #FF6B00; }
        .state-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #f5f5f5; color: #555; }
        .scorecard { margin-bottom: 16px; }
        .score-header { display: flex; justify-content: space-between; font-size: 13px; color: #666; margin-bottom: 8px; align-items: center; }
        .score-pct { font-weight: 700; font-size: 16px; }
        .bar { height: 8px; border-radius: 4px; background: #f0f0f0; overflow: hidden; display: flex; }
        .bar-kept { background: #12A854; height: 100%; }
        .bar-progress { background: #f0a500; height: 100%; }
        .bar-broken { background: #e53e3e; height: 100%; }
        .stats { display: flex; gap: 16px; font-size: 13px; color: #666; }
        .stat { display: flex; align-items: center; gap: 4px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .dot-green { background: #12A854; }
        .dot-yellow { background: #f0a500; }
        .dot-red { background: #e53e3e; }
        .loading { text-align: center; padding: 80px; color: #666; font-size: 18px; }
        .empty { text-align: center; padding: 80px 20px; color: #999; grid-column: 1/-1; }
        .empty h3 { font-family: Georgia, serif; font-size: 24px; margin-bottom: 8px; color: #ccc; }
        @media (max-width: 768px) {
          .hero { padding: 40px 20px; }
          .hero h1 { font-size: 32px; }
          .controls { padding: 16px 20px; position: static; }
          .grid { grid-template-columns: 1fr; padding: 0 20px 40px; }
          .results-info { padding: 12px 20px; }
          .nav { padding: 16px 20px; }
          .nav-links { gap: 16px; }
        }
      `}</style>

      <nav className="nav">
        <Link href="/" className="nav-logo">Vaada</Link>
        <div className="nav-links">
          <Link href="/politicians">Politicians</Link>
          <Link href="/promises">Promises</Link>
          <Link href="/states">By State</Link>
          <Link href="/parties">By Party</Link>
        </div>
      </nav>

      <div className="hero">
        <h1>All <span>Politicians</span></h1>
        <p>Track promises made by {politicians.length} politicians across India</p>
      </div>

      <div className="controls">
        <div className="search-row">
          <input
            className="search-input"
            type="text"
            placeholder="Search by name, party, state, role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {(search || activeParty !== "All" || activeState !== "All") && (
            <button className="clear-btn" onClick={() => { setSearch(""); setActiveParty("All"); setActiveState("All"); }}>Clear filters</button>
          )}
        </div>
        <div className="filter-group">
          <div className="filter-label">Party</div>
          <div className="filter-row">
            {parties.map(p => (
              <button key={p} className={`filter-btn ${activeParty === p ? "active" : ""}`} onClick={() => setActiveParty(p)}>{p}</button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <div className="filter-label">State</div>
          <div className="filter-row">
            <select className="state-select" value={activeState} onChange={e => setActiveState(e.target.value)}>
              <option value="All">All States</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="results-info">
        <span>Showing <strong>{filtered.length}</strong> of {politicians.length} politicians</span>
      </div>

      {loading ? (
        <div className="loading">Loading politicians...</div>
      ) : (
        <div className="grid">
          {filtered.length === 0 ? (
            <div className="empty">
              <h3>No politicians found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : filtered.map(p => {
            const score = getScore(p);
            return (
              <Link href={`/politicians/${p.name.toLowerCase().replace(/ /g, "-")}`} key={p.id} className="card">
                <div className="card-top">
                  <div className="avatar">{getInitials(p.name)}</div>
                  <div>
                    <div className="card-name">{p.name}</div>
                    <div className="card-role">{p.role}</div>
                    <div className="card-badges">
                      <span className="party-badge">{p.party}</span>
                      {p.state && <span className="state-badge">{p.state}</span>}
                    </div>
                  </div>
                </div>
                <div className="scorecard">
                  <div className="score-header">
                    <span>Promise Scorecard</span>
                    <span className="score-pct" style={{ color: getScoreColor(score) }}>{score}% kept</span>
                  </div>
                  <div className="bar">
                    <div className="bar-kept" style={{width: `${p.total_promises ? (p.promises_kept/p.total_promises)*100 : 0}%`}}></div>
                    <div className="bar-progress" style={{width: `${p.total_promises ? (p.promises_progress/p.total_promises)*100 : 0}%`}}></div>
                    <div className="bar-broken" style={{width: `${p.total_promises ? (p.promises_broken/p.total_promises)*100 : 0}%`}}></div>
                  </div>
                </div>
                <div className="stats">
                  <span className="stat"><span className="dot dot-green"></span>{p.promises_kept} Kept</span>
                  <span className="stat"><span className="dot dot-yellow"></span>{p.promises_progress} In Progress</span>
                  <span className="stat"><span className="dot dot-red"></span>{p.promises_broken} Broken</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function Politicians() {
  return (
    <Suspense fallback={<div style={{padding: "80px", textAlign: "center", color: "#666"}}>Loading...</div>}>
      <PoliticiansContent />
    </Suspense>
  );
}
