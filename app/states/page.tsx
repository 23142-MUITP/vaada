"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

type StateGroup = {
  state: string;
  politicians: {
    id: string;
    name: string;
    party: string;
    role: string;
    promises_kept: number;
    promises_broken: number;
    promises_progress: number;
    total_promises: number;
  }[];
};

export default function StatesPage() {
  const [groups, setGroups] = useState<StateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("politicians")
        .select("id, name, party, role, state, promises_kept, promises_broken, promises_progress, total_promises")
        .order("state");
      if (data) {
        const map: Record<string, StateGroup> = {};
        data.forEach(p => {
          const s = p.state || "Unknown";
          if (!map[s]) map[s] = { state: s, politicians: [] };
          map[s].politicians.push(p);
        });
        setGroups(Object.values(map).sort((a, b) => a.state.localeCompare(b.state)));
      }
      setLoading(false);
    }
    load();
  }, []);

  function slugify(name: string) {
    return name?.toLowerCase().replace(/\s+/g, "-") || "";
  }

  function getScore(p: { promises_kept: number; total_promises: number }) {
    if (!p.total_promises) return null;
    return Math.round((p.promises_kept / p.total_promises) * 100);
  }

  const filtered = groups.filter(g =>
    g.state.toLowerCase().includes(search.toLowerCase()) ||
    g.politicians.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
  );

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
        .hero { background: #0D1B3E; padding: 60px 40px 48px; }
        .hero h1 { font-family: Georgia, serif; font-size: 48px; color: white; margin-bottom: 12px; }
        .hero p { color: rgba(255,255,255,0.65); font-size: 18px; }
        .container { max-width: 900px; margin: 0 auto; padding: 40px; }
        .search-bar { width: 100%; padding: 14px 18px; border: 2px solid #eee; border-radius: 10px; font-size: 16px; outline: none; font-family: inherit; color: #0D1B3E; margin-bottom: 32px; background: white; }
        .search-bar:focus { border-color: #FF6B00; }
        .state-card { background: white; border-radius: 16px; border: 1px solid #eee; margin-bottom: 16px; overflow: hidden; }
        .state-header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background 0.15s; }
        .state-header:hover { background: #faf8f5; }
        .state-name { font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #0D1B3E; }
        .state-count { font-size: 14px; color: #999; margin-top: 2px; }
        .state-arrow { font-size: 20px; color: #FF6B00; transition: transform 0.2s; }
        .state-arrow.open { transform: rotate(90deg); }
        .state-body { border-top: 1px solid #eee; padding: 16px 24px; }
        .politician-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f5f5f5; gap: 16px; }
        .politician-row:last-child { border-bottom: none; }
        .pol-left { flex: 1; }
        .pol-name { font-weight: 700; font-size: 15px; color: #0D1B3E; text-decoration: none; }
        .pol-name:hover { color: #FF6B00; }
        .pol-meta { font-size: 13px; color: #888; margin-top: 2px; }
        .pol-right { display: flex; align-items: center; gap: 12px; }
        .party-badge { padding: 4px 12px; background: #0D1B3E; color: white; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .score-chip { padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; }
        .empty { text-align: center; padding: 80px 20px; color: #999; }
        .loading { text-align: center; padding: 80px; color: #666; }
        @media (max-width: 768px) {
          .nav { padding: 16px 20px; }
          .hero { padding: 40px 20px 32px; }
          .hero h1 { font-size: 32px; }
          .container { padding: 20px; }
          .pol-right { flex-direction: column; align-items: flex-end; gap: 6px; }
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
        <h1>Politicians by State</h1>
        <p>Browse all {groups.reduce((a, g) => a + g.politicians.length, 0)} politicians organized by state</p>
      </div>

      <div className="container">
        <input
          className="search-bar"
          type="text"
          placeholder="Search by state or politician name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {loading ? (
          <div className="loading">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No results found</div>
        ) : (
          filtered.map(g => {
            const isOpen = expanded === g.state;
            return (
              <div key={g.state} className="state-card">
                <div className="state-header" onClick={() => setExpanded(isOpen ? null : g.state)}>
                  <div>
                    <div className="state-name">{g.state}</div>
                    <div className="state-count">{g.politicians.length} politician{g.politicians.length !== 1 ? "s" : ""}</div>
                  </div>
                  <div className={`state-arrow ${isOpen ? "open" : ""}`}>›</div>
                </div>
                {isOpen && (
                  <div className="state-body">
                    {g.politicians.map(p => {
                      const score = getScore(p);
                      const scoreColor = score === null ? "#999" : score >= 60 ? "#12A854" : score >= 30 ? "#FF6B00" : "#e53e3e";
                      return (
                        <div key={p.id} className="politician-row">
                          <div className="pol-left">
                            <Link href={`/politicians/${slugify(p.name)}`} className="pol-name">{p.name}</Link>
                            <div className="pol-meta">{p.role}</div>
                          </div>
                          <div className="pol-right">
                            <span className="party-badge">{p.party}</span>
                            {score !== null && (
                              <span className="score-chip" style={{ background: `${scoreColor}18`, color: scoreColor }}>{score}% kept</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
