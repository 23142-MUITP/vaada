"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import Navbar from "../../components/Navbar";

type Politician = {
  id: string;
  name: string;
  role: string;
  party: string;
  state: string;
  bio: string;
  promises_kept: number;
  promises_progress: number;
  promises_broken: number;
  total_promises: number;
};

type Promise = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  source: string;
  year_made: number;
};

export default function PoliticianProfile() {
  const { slug } = useParams();
  const [politician, setPolitician] = useState<Politician | null>(null);
  const [promises, setPromises] = useState<Promise[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    async function load() {
      const name = (slug as string).replace(/-/g, " ");
      const { data } = await supabase.from("politicians").select("*").ilike("name", name).single();
      if (data) {
        setPolitician(data);
        const { data: pData } = await supabase.from("promises").select("*").eq("politician_id", data.id).order("year_made", { ascending: false });
        if (pData) setPromises(pData);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  function getInitials(name: string) {
    return name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  function getScore(p: Politician) {
    if (!p.total_promises) return 0;
    return Math.round((p.promises_kept / p.total_promises) * 100);
  }

  const statusColor = (s: string) => s === "Kept" ? "#12A854" : s === "Broken" ? "#e53e3e" : "#FF6B00";
  const statusBg = (s: string) => s === "Kept" ? "#e8f8ef" : s === "Broken" ? "#fde8e8" : "#fff4ec";

  const filteredPromises = filter === "All" ? promises : promises.filter(p => p.status === filter);

  if (loading) return <div style={{padding: "80px", textAlign: "center", fontFamily: "DM Sans, sans-serif", color: "#666"}}>Loading...</div>;
  if (!politician) return <div style={{padding: "80px", textAlign: "center", fontFamily: "DM Sans, sans-serif", color: "#666"}}>Politician not found.</div>;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #faf8f5; color: #0D1B3E; }
        .breadcrumb { padding: 16px 40px; font-size: 14px; color: #666; }
        .breadcrumb a { color: #FF6B00; text-decoration: none; }
        .hero { background: #0D1B3E; padding: 60px 40px; display: flex; gap: 40px; align-items: flex-start; }
        .avatar { width: 100px; height: 100px; border-radius: 20px; background: linear-gradient(135deg, #FF6B00, #e55a00); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 36px; flex-shrink: 0; }
        .hero-info { color: white; }
        .hero-name { font-family: Georgia, serif; font-size: 48px; font-weight: 700; margin-bottom: 8px; }
        .hero-role { font-size: 18px; opacity: 0.7; margin-bottom: 12px; }
        .badges { display: flex; gap: 10px; flex-wrap: wrap; }
        .badge { padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; }
        .badge-party { background: #FF6B00; color: white; }
        .badge-state { background: rgba(255,255,255,0.15); color: white; }
        .content { max-width: 1000px; margin: 0 auto; padding: 40px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
        .card { background: white; border-radius: 16px; padding: 28px; border: 1px solid #eee; }
        .card h2 { font-family: Georgia, serif; font-size: 22px; margin-bottom: 20px; color: #0D1B3E; }
        .score-big { font-size: 64px; font-weight: 700; color: #FF6B00; font-family: Georgia, serif; line-height: 1; }
        .score-label { font-size: 16px; color: #666; margin-top: 4px; margin-bottom: 20px; }
        .bar { height: 12px; border-radius: 6px; background: #f0f0f0; overflow: hidden; display: flex; margin-bottom: 16px; }
        .bar-kept { background: #12A854; height: 100%; }
        .bar-progress { background: #f0a500; height: 100%; }
        .bar-broken { background: #e53e3e; height: 100%; }
        .stats { display: flex; gap: 24px; }
        .stat { text-align: center; }
        .stat-num { font-size: 32px; font-weight: 700; font-family: Georgia, serif; }
        .stat-num-green { color: #12A854; }
        .stat-num-yellow { color: #f0a500; }
        .stat-num-red { color: #e53e3e; }
        .stat-label { font-size: 13px; color: #666; }
        .bio-text { font-size: 16px; line-height: 1.7; color: #444; }
        .back-btn { display: inline-flex; align-items: center; gap: 8px; color: #FF6B00; text-decoration: none; font-weight: 600; margin-bottom: 24px; }
        .promises-section { margin-top: 8px; }
        .promises-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
        .promises-header h2 { font-family: Georgia, serif; font-size: 28px; color: #0D1B3E; }
        .filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .filter-tab { padding: 8px 18px; border-radius: 20px; font-size: 14px; font-weight: 700; cursor: pointer; border: 2px solid #eee; background: white; color: #666; font-family: inherit; transition: all 0.15s; }
        .filter-tab:hover { border-color: #FF6B00; color: #FF6B00; }
        .filter-tab.active { background: #0D1B3E; color: white; border-color: #0D1B3E; }
        .promise-card { background: white; border-radius: 14px; padding: 24px; border: 1px solid #eee; margin-bottom: 16px; transition: box-shadow 0.2s; }
        .promise-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .promise-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 10px; }
        .promise-title { font-size: 17px; font-weight: 700; color: #0D1B3E; line-height: 1.4; }
        .status-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
        .promise-desc { font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 12px; }
        .promise-meta { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
        .meta-tag { font-size: 13px; color: #888; background: #f5f5f5; padding: 4px 10px; border-radius: 6px; }
        .promise-source { font-size: 13px; color: #FF6B00; text-decoration: none; }
        .promise-source:hover { text-decoration: underline; }
        .empty-promises { text-align: center; padding: 60px 20px; color: #999; }
        .empty-promises p { font-size: 16px; margin-top: 8px; }
        @media (max-width: 768px) {
          .hero { flex-direction: column; padding: 40px 20px; }
          .hero-name { font-size: 32px; }
          .grid { grid-template-columns: 1fr; }
          .content { padding: 20px; }
          .breadcrumb { padding: 16px 20px; }
          .promises-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <Navbar />

      <div className="breadcrumb">
        <Link href="/">Home</Link> &rsaquo; <Link href="/politicians">Politicians</Link> &rsaquo; {politician.name}
      </div>

      <div className="hero">
        <div className="avatar">{getInitials(politician.name)}</div>
        <div className="hero-info">
          <div className="hero-name">{politician.name}</div>
          <div className="hero-role">{politician.role}</div>
          <div className="badges">
            <span className="badge badge-party">{politician.party}</span>
            {politician.state && <span className="badge badge-state">{politician.state}</span>}
          </div>
        </div>
      </div>

      <div className="content">
        <Link href="/politicians" className="back-btn">- Back to all politicians</Link>
        <div className="grid">
          <div className="card">
            <h2>Promise Scorecard</h2>
            <div className="score-big">{getScore(politician)}%</div>
            <div className="score-label">promises kept out of {politician.total_promises} tracked</div>
            <div className="bar">
              <div className="bar-kept" style={{width: `${politician.total_promises ? (politician.promises_kept/politician.total_promises)*100 : 0}%`}}></div>
              <div className="bar-progress" style={{width: `${politician.total_promises ? (politician.promises_progress/politician.total_promises)*100 : 0}%`}}></div>
              <div className="bar-broken" style={{width: `${politician.total_promises ? (politician.promises_broken/politician.total_promises)*100 : 0}%`}}></div>
            </div>
            <div className="stats">
              <div className="stat">
                <div className="stat-num stat-num-green">{politician.promises_kept}</div>
                <div className="stat-label">Kept</div>
              </div>
              <div className="stat">
                <div className="stat-num stat-num-yellow">{politician.promises_progress}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat">
                <div className="stat-num stat-num-red">{politician.promises_broken}</div>
                <div className="stat-label">Broken</div>
              </div>
            </div>
          </div>
          <div className="card">
            <h2>About</h2>
            <p className="bio-text">{politician.bio || `${politician.name} is a prominent Indian politician serving as ${politician.role} representing the ${politician.party} party.`}</p>
          </div>
        </div>

        {promises.length > 0 && (
          <div className="promises-section">
            <div className="promises-header">
              <h2>Campaign Promises ({promises.length})</h2>
              <div className="filter-tabs">
                {["All", "Kept", "In Progress", "Broken"].map(f => (
                  <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
            </div>
            {filteredPromises.length === 0 ? (
              <div className="empty-promises">
                <p>No {filter.toLowerCase()} promises found.</p>
              </div>
            ) : (
              filteredPromises.map(p => (
                <div key={p.id} className="promise-card">
                  <div className="promise-top">
                    <div className="promise-title">{p.title}</div>
                    <span className="status-badge" style={{ background: statusBg(p.status), color: statusColor(p.status) }}>{p.status}</span>
                  </div>
                  {p.description && <p className="promise-desc">{p.description}</p>}
                  <div className="promise-meta">
                    {p.category && <span className="meta-tag">{p.category}</span>}
                    {p.year_made && <span className="meta-tag">{p.year_made}</span>}
                    {p.source && <a href={p.source} target="_blank" rel="noopener noreferrer" className="promise-source">View Source</a>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
