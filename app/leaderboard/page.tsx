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

const PARTY_COLORS: Record<string, string> = {
  BJP: "#FF6B00", INC: "#12A854", AAP: "#00AEEF", SP: "#e53e3e",
  TMC: "#22c55e", BSP: "#3b82f6", NCP: "#8b5cf6", SHS: "#f59e0b",
};

export default function Leaderboard() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [minPromises, setMinPromises] = useState(0);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("politicians")
        .select("*")
        .gt("total_promises", 0)
        .order("promises_kept", { ascending: false });
      if (data) setPoliticians(data);
      setLoading(false);
    }
    load();
  }, []);

  function getScore(p: Politician) {
    if (!p.total_promises) return 0;
    return Math.round((p.promises_kept / p.total_promises) * 100);
  }

  function getScoreColor(score: number) {
    if (score >= 60) return "#12A854";
    if (score >= 40) return "#f0a500";
    return "#e53e3e";
  }

  function getMedal(rank: number) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  }

  function slugify(name: string) {
    return name?.toLowerCase().replace(/\s+/g, "-") || "";
  }

  function getInitials(name: string) {
    return name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  const parties = ["All", ...Array.from(new Set(politicians.map(p => p.party).filter(Boolean)))].sort();

  const ranked = [...politicians]
    .filter(p => filter === "All" || p.party === filter)
    .filter(p => p.total_promises >= minPromises)
    .sort((a, b) => getScore(b) - getScore(a));

  const topScore = ranked.length ? getScore(ranked[0]) : 0;
  const avgScore = ranked.length ? Math.round(ranked.reduce((a, p) => a + getScore(p), 0) / ranked.length) : 0;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #faf8f5; color: #0D1B3E; }
        .hero { background: #0D1B3E; padding: 60px 40px 48px; }
        .hero h1 { font-family: Georgia, serif; font-size: 48px; color: white; margin-bottom: 12px; }
        .hero h1 span { color: #FF6B00; }
        .hero p { color: rgba(255,255,255,0.6); font-size: 18px; margin-bottom: 40px; }
        .hero-stats { display: flex; gap: 32px; flex-wrap: wrap; }
        .hero-stat { text-align: center; background: rgba(255,255,255,0.07); border-radius: 12px; padding: 16px 28px; }
        .hero-stat-num { font-family: Georgia, serif; font-size: 36px; font-weight: 700; color: #FF6B00; }
        .hero-stat-label { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 4px; }
        .container { max-width: 900px; margin: 0 auto; padding: 40px; }
        .controls { background: white; border-radius: 16px; padding: 24px; border: 1px solid #eee; margin-bottom: 32px; display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-end; }
        .control-group { flex: 1; min-width: 200px; }
        .control-label { font-size: 12px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
        .party-select { width: 100%; padding: 10px 14px; border: 2px solid #eee; border-radius: 8px; font-size: 14px; outline: none; font-family: inherit; color: #0D1B3E; }
        .party-select:focus { border-color: #FF6B00; }
        .min-select { width: 100%; padding: 10px 14px; border: 2px solid #eee; border-radius: 8px; font-size: 14px; outline: none; font-family: inherit; color: #0D1B3E; }
        .results-info { font-size: 14px; color: #666; margin-bottom: 20px; }
        .podium { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 32px; }
        .podium-card { background: white; border-radius: 16px; padding: 24px; border: 2px solid #eee; text-align: center; position: relative; transition: transform 0.2s; text-decoration: none; color: inherit; display: block; }
        .podium-card:hover { transform: translateY(-4px); }
        .podium-card.gold { border-color: #FFD700; background: linear-gradient(135deg, #fffbeb, white); }
        .podium-card.silver { border-color: #C0C0C0; background: linear-gradient(135deg, #f8f8f8, white); }
        .podium-card.bronze { border-color: #CD7F32; background: linear-gradient(135deg, #fdf5ee, white); }
        .podium-medal { font-size: 36px; margin-bottom: 8px; }
        .podium-rank { position: absolute; top: 12px; right: 14px; font-size: 12px; font-weight: 700; color: #999; }
        .podium-avatar { width: 60px; height: 60px; border-radius: 12px; background: linear-gradient(135deg, #FF6B00, #e55a00); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; font-family: Georgia, serif; margin: 0 auto 12px; }
        .podium-name { font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: #0D1B3E; margin-bottom: 4px; }
        .podium-party { font-size: 12px; font-weight: 700; margin-bottom: 12px; }
        .podium-score { font-size: 32px; font-weight: 700; font-family: Georgia, serif; }
        .podium-score-label { font-size: 12px; color: #666; margin-top: 2px; }
        .table { background: white; border-radius: 16px; border: 1px solid #eee; overflow: hidden; }
        .table-header { display: grid; grid-template-columns: 60px 1fr 100px 120px 80px; padding: 12px 20px; background: #f8f8f8; border-bottom: 1px solid #eee; font-size: 12px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.8px; }
        .table-row { display: grid; grid-template-columns: 60px 1fr 100px 120px 80px; padding: 16px 20px; border-bottom: 1px solid #f5f5f5; align-items: center; text-decoration: none; color: inherit; transition: background 0.15s; }
        .table-row:last-child { border-bottom: none; }
        .table-row:hover { background: #faf8f5; }
        .rank-num { font-family: Georgia, serif; font-size: 20px; font-weight: 700; color: #ccc; }
        .rank-medal { font-size: 22px; }
        .pol-info { display: flex; align-items: center; gap: 12px; }
        .pol-avatar { width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #FF6B00, #e55a00); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; font-family: Georgia, serif; flex-shrink: 0; }
        .pol-name { font-weight: 700; font-size: 15px; color: #0D1B3E; }
        .pol-role { font-size: 12px; color: #888; margin-top: 2px; }
        .party-chip { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; color: white; }
        .score-cell { font-size: 20px; font-weight: 700; font-family: Georgia, serif; }
        .bar-cell { width: 80px; }
        .mini-bar { height: 6px; border-radius: 3px; background: #f0f0f0; overflow: hidden; margin-top: 4px; }
        .mini-bar-fill { height: 100%; border-radius: 3px; }
        .empty { text-align: center; padding: 60px; color: #999; }
        .loading { text-align: center; padding: 80px; color: #666; }
        @media (max-width: 768px) {
          .hero { padding: 40px 20px 32px; }
          .hero h1 { font-size: 32px; }
          .container { padding: 20px; }
          .podium { grid-template-columns: 1fr; }
          .table-header { display: none; }
          .table-row { grid-template-columns: 40px 1fr 70px; gap: 8px; }
          .table-row > :nth-child(3), .table-row > :nth-child(5) { display: none; }
        }
      `}</style>

      <div className="hero">
        <h1>Promise <span>Leaderboard</span></h1>
        <p>Politicians ranked by percentage of promises kept - updated in real time</p>
        {!loading && (
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">{ranked.length}</div>
              <div className="hero-stat-label">Politicians ranked</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num" style={{ color: "#12A854" }}>{topScore}%</div>
              <div className="hero-stat-label">Highest score</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num" style={{ color: "#f0a500" }}>{avgScore}%</div>
              <div className="hero-stat-label">Average score</div>
            </div>
          </div>
        )}
      </div>

      <div className="container">
        <div className="controls">
          <div className="control-group">
            <div className="control-label">Filter by Party</div>
            <select className="party-select" value={filter} onChange={e => setFilter(e.target.value)}>
              {parties.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="control-group">
            <div className="control-label">Minimum Promises Tracked</div>
            <select className="min-select" value={minPromises} onChange={e => setMinPromises(Number(e.target.value))}>
              <option value={0}>Any number</option>
              <option value={5}>At least 5</option>
              <option value={10}>At least 10</option>
              <option value={15}>At least 15</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading leaderboard...</div>
        ) : ranked.length === 0 ? (
          <div className="empty">No politicians found with promises tracked.</div>
        ) : (
          <>
            <div className="results-info">Showing <strong>{ranked.length}</strong> politicians ranked by promise-kept percentage</div>
            {ranked.length >= 3 && (
              <div className="podium">
                {ranked.slice(0, 3).map((p, i) => {
                  const score = getScore(p);
                  const classes = ["gold", "silver", "bronze"][i];
                  return (
                    <Link key={p.id} href={`/politicians/${slugify(p.name)}`} className={`podium-card ${classes}`}>
                      <div className="podium-rank">#{i + 1}</div>
                      <div className="podium-medal">{getMedal(i + 1)}</div>
                      <div className="podium-avatar">{getInitials(p.name)}</div>
                      <div className="podium-name">{p.name}</div>
                      <div className="podium-party" style={{ color: PARTY_COLORS[p.party] || "#0D1B3E" }}>{p.party}</div>
                      <div className="podium-score" style={{ color: getScoreColor(score) }}>{score}%</div>
                      <div className="podium-score-label">{p.promises_kept} of {p.total_promises} kept</div>
                    </Link>
                  );
                })}
              </div>
            )}
            <div className="table">
              <div className="table-header">
                <div>Rank</div>
                <div>Politician</div>
                <div>Party</div>
                <div>Score</div>
                <div>Progress</div>
              </div>
              {ranked.map((p, i) => {
                const score = getScore(p);
                const medal = getMedal(i + 1);
                return (
                  <Link key={p.id} href={`/politicians/${slugify(p.name)}`} className="table-row">
                    <div>
                      {medal ? <span className="rank-medal">{medal}</span> : <span className="rank-num">#{i + 1}</span>}
                    </div>
                    <div className="pol-info">
                      <div className="pol-avatar">{getInitials(p.name)}</div>
                      <div>
                        <div className="pol-name">{p.name}</div>
                        <div className="pol-role">{p.state}</div>
                      </div>
                    </div>
                    <div>
                      <span className="party-chip" style={{ background: PARTY_COLORS[p.party] || "#0D1B3E" }}>{p.party}</span>
                    </div>
                    <div className="score-cell" style={{ color: getScoreColor(score) }}>{score}%</div>
                    <div className="bar-cell">
                      <div style={{ fontSize: 11, color: "#999" }}>{p.promises_kept}/{p.total_promises}</div>
                      <div className="mini-bar">
                        <div className="mini-bar-fill" style={{ width: `${score}%`, background: getScoreColor(score) }}></div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
