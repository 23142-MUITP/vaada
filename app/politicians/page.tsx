"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

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

export default function Politicians() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [filtered, setFiltered] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeParty, setActiveParty] = useState("All");
  const [activeLevel, setActiveLevel] = useState("All");

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from("politicians").select("*").order("name");
      if (data) { setPoliticians(data); setFiltered(data); }
      setLoading(false);
    }
    fetch();
  }, []);

  useEffect(() => {
    let result = politicians;
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.party?.toLowerCase().includes(search.toLowerCase()) || p.state?.toLowerCase().includes(search.toLowerCase()));
    if (activeParty !== "All") result = result.filter(p => p.party === activeParty);
    setFiltered(result);
  }, [search, activeParty, politicians]);

  function getInitials(name: string) {
    return name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  function getScore(p: Politician) {
    if (!p.total_promises) return 0;
    return Math.round((p.promises_kept / p.total_promises) * 100);
  }

  const parties = ["All", "BJP", "INC", "AAP", "SP", "TMC"];

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
        .controls { padding: 32px 40px; background: white; border-bottom: 1px solid #eee; position: sticky; top: 0; z-index: 10; }
        .search-bar { display: flex; gap: 12px; margin-bottom: 20px; }
        .search-bar input { flex: 1; padding: 12px 20px; border: 2px solid #eee; border-radius: 8px; font-size: 16px; outline: none; }
        .search-bar input:focus { border-color: #FF6B00; }
        .filters { display: flex; gap: 10px; flex-wrap: wrap; }
        .filter-btn { padding: 8px 20px; border-radius: 20px; border: 2px solid #eee; background: white; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s; }
        .filter-btn.active { background: #FF6B00; border-color: #FF6B00; color: white; }
        .filter-btn:hover:not(.active) { border-color: #FF6B00; color: #FF6B00; }
        .results-info { padding: 20px 40px; color: #666; font-size: 14px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; padding: 0 40px 60px; }
        .card { background: white; border-radius: 16px; padding: 24px; border: 1px solid #eee; transition: all 0.2s; text-decoration: none; color: inherit; display: block; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); border-color: #FF6B00; }
        .card-top { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .avatar { width: 56px; height: 56px; border-radius: 12px; background: linear-gradient(135deg, #FF6B00, #e55a00); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex-shrink: 0; }
        .card-name { font-family: Georgia, serif; font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        .card-role { font-size: 13px; color: #666; margin-bottom: 8px; }
        .party-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; background: #fff3e8; color: #FF6B00; }
        .scorecard { margin-bottom: 16px; }
        .score-header { display: flex; justify-content: space-between; font-size: 13px; color: #666; margin-bottom: 8px; }
        .score-pct { font-weight: 700; color: #0D1B3E; font-size: 16px; }
        .bar { height: 8px; border-radius: 4px; background: #f0f0f0; overflow: hidden; display: flex; }
        .bar-kept { background: #12A854; height: 100%; }
        .bar-progress { background: #f0a500; height: 100%; }
        .bar-broken { background: #e53e3e; height: 100%; }
        .stats { display: flex; gap: 16px; font-size: 13px; }
        .stat { display: flex; align-items: center; gap: 4px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot-green { background: #12A854; }
        .dot-yellow { background: #f0a500; }
        .dot-red { background: #e53e3e; }
        .loading { text-align: center; padding: 80px; color: #666; font-size: 18px; }
        @media (max-width: 768px) {
          .hero { padding: 40px 20px; }
          .hero h1 { font-size: 32px; }
          .controls { padding: 20px; }
          .grid { grid-template-columns: 1fr; padding: 0 20px 40px; }
          .results-info { padding: 16px 20px; }
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
        <p>Track promises made by every politician across India</p>
      </div>

      <div className="controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, party, state..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filters">
          {parties.map(p => (
            <button key={p} className={`filter-btn ${activeParty === p ? "active" : ""}`} onClick={() => setActiveParty(p)}>{p}</button>
          ))}
        </div>
      </div>

      <div className="results-info">
        Showing {filtered.length} politician{filtered.length !== 1 ? "s" : ""}
      </div>

      {loading ? (
        <div className="loading">Loading politicians...</div>
      ) : (
        <div className="grid">
          {filtered.map(p => (
            <Link href={`/politicians/${p.name.toLowerCase().replace(/ /g, "-")}`} key={p.id} className="card">
              <div className="card-top">
                <div className="avatar">{getInitials(p.name)}</div>
                <div>
                  <div className="card-name">{p.name}</div>
                  <div className="card-role">{p.role}</div>
                  <span className="party-badge">{p.party}</span>
                </div>
              </div>
              <div className="scorecard">
                <div className="score-header">
                  <span>Promise Scorecard</span>
                  <span className="score-pct">{getScore(p)}% kept - {p.total_promises} tracked</span>
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
          ))}
        </div>
      )}
    </>
  );
}
