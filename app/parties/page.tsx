"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

type PartyGroup = {
  party: string;
  politicians: {
    id: string;
    name: string;
    state: string;
    role: string;
    promises_kept: number;
    promises_broken: number;
    promises_progress: number;
    total_promises: number;
  }[];
};

const PARTY_COLORS: Record<string, string> = {
  BJP: "#FF6B00",
  INC: "#12A854",
  AAP: "#00AEEF",
  SP: "#e53e3e",
  TMC: "#22c55e",
  BSP: "#3b82f6",
  NCP: "#8b5cf6",
  CPI: "#ef4444",
  DMK: "#f59e0b",
  AITC: "#06b6d4",
};

function getPartyColor(party: string) {
  return PARTY_COLORS[party] || "#0D1B3E";
}

export default function PartiesPage() {
  const [groups, setGroups] = useState<PartyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("politicians")
        .select("id, name, party, role, state, promises_kept, promises_broken, promises_progress, total_promises")
        .order("party");
      if (data) {
        const map: Record<string, PartyGroup> = {};
        data.forEach(p => {
          const party = p.party || "Independent";
          if (!map[party]) map[party] = { party, politicians: [] };
          map[party].politicians.push(p);
        });
        setGroups(
          Object.values(map).sort((a, b) => b.politicians.length - a.politicians.length)
        );
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

  function getPartyScore(politicians: PartyGroup["politicians"]) {
    const withData = politicians.filter(p => p.total_promises > 0);
    if (!withData.length) return null;
    const avg = withData.reduce((a, p) => a + (p.promises_kept / p.total_promises) * 100, 0) / withData.length;
    return Math.round(avg);
  }

  const filtered = groups.filter(g =>
    g.party.toLowerCase().includes(search.toLowerCase()) ||
    g.politicians.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #faf8f5; color: #0D1B3E; }
        .hero { background: #0D1B3E; padding: 60px 40px 48px; }
        .hero h1 { font-family: Georgia, serif; font-size: 48px; color: white; margin-bottom: 12px; }
        .hero p { color: rgba(255,255,255,0.65); font-size: 18px; }
        .container { max-width: 900px; margin: 0 auto; padding: 40px; }
        .search-bar { width: 100%; padding: 14px 18px; border: 2px solid #eee; border-radius: 10px; font-size: 16px; outline: none; font-family: inherit; color: #0D1B3E; margin-bottom: 32px; background: white; }
        .search-bar:focus { border-color: #FF6B00; }
        .party-card { background: white; border-radius: 16px; border: 1px solid #eee; margin-bottom: 16px; overflow: hidden; }
        .party-header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background 0.15s; }
        .party-header:hover { background: #faf8f5; }
        .party-header-left { display: flex; align-items: center; gap: 16px; }
        .party-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; }
        .party-name { font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #0D1B3E; }
        .party-count { font-size: 14px; color: #999; margin-top: 2px; }
        .party-header-right { display: flex; align-items: center; gap: 16px; }
        .party-score { font-size: 15px; font-weight: 700; }
        .party-arrow { font-size: 20px; color: #FF6B00; transition: transform 0.2s; }
        .party-arrow.open { transform: rotate(90deg); }
        .party-body { border-top: 1px solid #eee; padding: 16px 24px; }
        .politician-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f5f5f5; gap: 16px; }
        .politician-row:last-child { border-bottom: none; }
        .pol-left { flex: 1; }
        .pol-name { font-weight: 700; font-size: 15px; color: #0D1B3E; text-decoration: none; }
        .pol-name:hover { color: #FF6B00; }
        .pol-meta { font-size: 13px; color: #888; margin-top: 2px; }
        .pol-right { display: flex; align-items: center; gap: 12px; }
        .state-badge { padding: 4px 12px; background: #f5f5f5; color: #555; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .score-chip { padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; }
        .empty { text-align: center; padding: 80px 20px; color: #999; }
        .loading { text-align: center; padding: 80px; color: #666; }
        @media (max-width: 768px) {
          .hero { padding: 40px 20px 32px; }
          .hero h1 { font-size: 32px; }
          .container { padding: 20px; }
          .pol-right { flex-direction: column; align-items: flex-end; gap: 6px; }
        }
      `}</style>

      <div className="hero">
        <h1>Politicians by Party</h1>
        <p>Browse all politicians organized by political party</p>
      </div>

      <div className="container">
        <input
          className="search-bar"
          type="text"
          placeholder="Search by party or politician name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {loading ? (
          <div className="loading">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No results found</div>
        ) : (
          filtered.map(g => {
            const isOpen = expanded === g.party;
            const partyScore = getPartyScore(g.politicians);
            const color = getPartyColor(g.party);
            const scoreColor = partyScore === null ? "#999" : partyScore >= 60 ? "#12A854" : partyScore >= 30 ? "#FF6B00" : "#e53e3e";
            return (
              <div key={g.party} className="party-card">
                <div className="party-header" onClick={() => setExpanded(isOpen ? null : g.party)}>
                  <div className="party-header-left">
                    <div className="party-dot" style={{ background: color }}></div>
                    <div>
                      <div className="party-name">{g.party}</div>
                      <div className="party-count">{g.politicians.length} politician{g.politicians.length !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  <div className="party-header-right">
                    {partyScore !== null && (
                      <span className="party-score" style={{ color: scoreColor }}>{partyScore}% avg kept</span>
                    )}
                    <div className={`party-arrow ${isOpen ? "open" : ""}`}>›</div>
                  </div>
                </div>
                {isOpen && (
                  <div className="party-body">
                    {g.politicians.map(p => {
                      const score = getScore(p);
                      const sc = score === null ? "#999" : score >= 60 ? "#12A854" : score >= 30 ? "#FF6B00" : "#e53e3e";
                      return (
                        <div key={p.id} className="politician-row">
                          <div className="pol-left">
                            <Link href={`/politicians/${slugify(p.name)}`} className="pol-name">{p.name}</Link>
                            <div className="pol-meta">{p.role}</div>
                          </div>
                          <div className="pol-right">
                            {p.state && <span className="state-badge">{p.state}</span>}
                            {score !== null && (
                              <span className="score-chip" style={{ background: `${sc}18`, color: sc }}>{score}% kept</span>
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
