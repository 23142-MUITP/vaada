"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

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

const CATEGORIES = ["All", "Infrastructure", "Economy", "Healthcare", "Education", "Agriculture", "Security", "Environment", "Employment", "Welfare", "Other"];
const STATUSES = ["All", "Kept", "In Progress", "Broken"];

export default function PromisesPage() {
  const [promises, setPromises] = useState<Promise[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("promises")
        .select("*")
        .order("year_made", { ascending: false });
      if (data) setPromises(data);
      setLoading(false);
    }
    load();
  }, []);

  const statusColor = (s: string) => s === "Kept" ? "#12A854" : s === "Broken" ? "#e53e3e" : "#FF6B00";
  const statusBg = (s: string) => s === "Kept" ? "#e8f8ef" : s === "Broken" ? "#fde8e8" : "#fff4ec";

  const filtered = promises.filter(p => {
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    const matchCategory = categoryFilter === "All" || p.category === categoryFilter;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.politician_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCategory && matchSearch;
  });

  const keptCount = promises.filter(p => p.status === "Kept").length;
  const progressCount = promises.filter(p => p.status === "In Progress").length;
  const brokenCount = promises.filter(p => p.status === "Broken").length;

  function slugify(name: string) {
    return name?.toLowerCase().replace(/\s+/g, "-") || "";
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #faf8f5; color: #0D1B3E; }
        .hero { background: #0D1B3E; padding: 60px 40px 48px; }
        .hero h1 { font-family: Georgia, serif; font-size: 48px; color: white; margin-bottom: 12px; }
        .hero p { color: rgba(255,255,255,0.65); font-size: 18px; margin-bottom: 40px; }
        .stats-row { display: flex; gap: 24px; flex-wrap: wrap; }
        .stat-pill { background: rgba(255,255,255,0.1); border-radius: 12px; padding: 16px 28px; text-align: center; }
        .stat-pill-num { font-size: 32px; font-weight: 700; font-family: Georgia, serif; }
        .stat-pill-label { font-size: 13px; opacity: 0.7; margin-top: 2px; color: white; }
        .stat-green { color: #12A854; }
        .stat-orange { color: #FF6B00; }
        .stat-red { color: #e53e3e; }
        .stat-white { color: white; }
        .container { max-width: 1000px; margin: 0 auto; padding: 40px; }
        .filters { background: white; border-radius: 16px; padding: 24px; border: 1px solid #eee; margin-bottom: 32px; }
        .search-bar { width: 100%; padding: 14px 18px; border: 2px solid #eee; border-radius: 10px; font-size: 16px; outline: none; font-family: inherit; color: #0D1B3E; margin-bottom: 20px; }
        .search-bar:focus { border-color: #FF6B00; }
        .filter-group { margin-bottom: 16px; }
        .filter-group:last-child { margin-bottom: 0; }
        .filter-label { font-size: 12px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
        .filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .filter-tab { padding: 7px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; cursor: pointer; border: 2px solid #eee; background: white; color: #666; font-family: inherit; transition: all 0.15s; }
        .filter-tab:hover { border-color: #FF6B00; color: #FF6B00; }
        .filter-tab.active { background: #0D1B3E; color: white; border-color: #0D1B3E; }
        .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .results-count { font-size: 15px; color: #666; }
        .promise-card { background: white; border-radius: 14px; padding: 24px; border: 1px solid #eee; margin-bottom: 16px; transition: box-shadow 0.2s; }
        .promise-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .promise-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 8px; }
        .promise-title { font-size: 17px; font-weight: 700; color: #0D1B3E; line-height: 1.4; }
        .status-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
        .politician-link { font-size: 14px; color: #FF6B00; text-decoration: none; font-weight: 600; margin-bottom: 10px; display: inline-block; }
        .politician-link:hover { text-decoration: underline; }
        .promise-desc { font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 12px; }
        .promise-meta { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .meta-tag { font-size: 13px; color: #888; background: #f5f5f5; padding: 4px 10px; border-radius: 6px; }
        .promise-source { font-size: 13px; color: #FF6B00; text-decoration: none; }
        .promise-source:hover { text-decoration: underline; }
        .empty { text-align: center; padding: 80px 20px; color: #999; }
        .empty h3 { font-family: Georgia, serif; font-size: 24px; margin-bottom: 8px; color: #ccc; }
        .loading { text-align: center; padding: 80px; color: #666; }
        @media (max-width: 768px) {
          .hero { padding: 40px 20px 32px; }
          .hero h1 { font-size: 32px; }
          .container { padding: 20px; }
          .stats-row { gap: 12px; }
          .stat-pill { padding: 12px 20px; }
        }
      `}</style>

      <div className="hero">
        <h1>All Promises</h1>
        <p>Track every campaign promise made by Indian politicians</p>
        {!loading && (
          <div className="stats-row">
            <div className="stat-pill">
              <div className="stat-pill-num stat-white">{promises.length}</div>
              <div className="stat-pill-label">Total Promises</div>
            </div>
            <div className="stat-pill">
              <div className="stat-pill-num stat-green">{keptCount}</div>
              <div className="stat-pill-label">Kept</div>
            </div>
            <div className="stat-pill">
              <div className="stat-pill-num stat-orange">{progressCount}</div>
              <div className="stat-pill-label">In Progress</div>
            </div>
            <div className="stat-pill">
              <div className="stat-pill-num stat-red">{brokenCount}</div>
              <div className="stat-pill-label">Broken</div>
            </div>
          </div>
        )}
      </div>

      <div className="container">
        <div className="filters">
          <input
            className="search-bar"
            type="text"
            placeholder="Search promises or politician name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="filter-group">
            <div className="filter-label">Status</div>
            <div className="filter-tabs">
              {STATUSES.map(s => (
                <button key={s} className={`filter-tab ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <div className="filter-label">Category</div>
            <div className="filter-tabs">
              {CATEGORIES.map(c => (
                <button key={c} className={`filter-tab ${categoryFilter === c ? "active" : ""}`} onClick={() => setCategoryFilter(c)}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading promises...</div>
        ) : (
          <>
            <div className="results-header">
              <div className="results-count">{filtered.length} promise{filtered.length !== 1 ? "s" : ""} found</div>
            </div>
            {filtered.length === 0 ? (
              <div className="empty">
                <h3>No promises found</h3>
                <p>Try adjusting your filters</p>
              </div>
            ) : (
              filtered.map(p => (
                <div key={p.id} className="promise-card">
                  <div className="promise-top">
                    <div className="promise-title">{p.title}</div>
                    <span className="status-badge" style={{ background: statusBg(p.status), color: statusColor(p.status) }}>{p.status}</span>
                  </div>
                  {p.politician_name && (
                    <Link href={`/politicians/${slugify(p.politician_name)}`} className="politician-link">
                      {p.politician_name}
                    </Link>
                  )}
                  {p.description && <p className="promise-desc">{p.description}</p>}
                  <div className="promise-meta">
                    {p.category && <span className="meta-tag">{p.category}</span>}
                    {p.year_made && <span className="meta-tag">{p.year_made}</span>}
                    {p.source && <a href={p.source} target="_blank" rel="noopener noreferrer" className="promise-source">View Source</a>}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </>
  );
}
