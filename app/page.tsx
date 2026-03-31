"use client";
import { useEffect, useState, useRef } from "react";
import IndiaMap from "./IndiaMap";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WikiImage from "./components/WikiImage";

type Politician = {
  id: number;
  name: string;
  role: string;
  party: string;
  state: string;
  promises_kept: number;
  promises_progress: number;
  promises_broken: number;
  total_promises: number;
};

type NewsItem = {
  title: string;
  url: string;
};

export default function Home() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [allPoliticians, setAllPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Politician[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      const [{ data: pols }, { data: all }] = await Promise.all([
        supabase.from("politicians").select("*").limit(5),
        supabase.from("politicians").select("*").order("name"),
      ]);
      if (pols) setPoliticians(pols);
      if (all) setAllPoliticians(all);
      setLoading(false);
    }

    async function fetchNews() {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        if (data.articles) {
          setNews(data.articles.map((a: { title: string; url: string }) => ({ title: a.title, url: a.url })));
        }
      } catch {
        setNews([]);
      }
    }

    fetchData();
    fetchNews();
  }, []);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); setShowDropdown(false); return; }
    const q = search.toLowerCase().replace(/\s+/g, "");
    const results = allPoliticians.filter(p => {
      const name = p.name.toLowerCase().replace(/\s+/g, "");
      const party = p.party?.toLowerCase() || "";
      const state = p.state?.toLowerCase() || "";
      if (name.includes(q) || party.includes(q) || state.includes(q)) return true;
      let qi = 0;
      for (let i = 0; i < name.length && qi < q.length; i++) {
        if (name[i] === q[qi]) qi++;
      }
      return qi === q.length;
    }).slice(0, 6);
    setSearchResults(results);
    setShowDropdown(results.length > 0);
  }, [search, allPoliticians]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function slugify(name: string) {
    return name?.toLowerCase().replace(/\s+/g, "-") || "";
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchResults.length > 0) {
      router.push(`/politicians/${slugify(searchResults[0].name)}`);
    } else if (search.trim()) {
      router.push(`/politicians?search=${encodeURIComponent(search.trim())}`);
    }
  }

  function openSuggestModal() {
    document.querySelector<HTMLButtonElement>(".sm-btn")?.click();
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; overflow-x: hidden; }
        .hero-strip { background: #FF6B00; padding: 10px 40px; text-align: center; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; color: white; text-transform: uppercase; }
        .hero-outer { background: #0D1B3E; display: flex; flex-direction: column; }
        .hero { padding: 40px 60px 0; display: grid; grid-template-columns: 1fr 1fr; align-items: start; gap: 40px; background: radial-gradient(ellipse 60% 50% at 70% 40%, rgba(255,107,0,0.12) 0%, transparent 60%); }
        .hero-left { width: 100%; max-width: 560px; padding-bottom: 40px; }
        .hero-h1 { font-family: Georgia, serif; font-size: 72px; font-weight: 900; line-height: 1.0; letter-spacing: -2px; margin: 0 0 20px 0; }
        .hero-right { display: flex; flex-direction: column; align-items: center; width: 100%; }
        .hero-map-container { width: 320px; height: 340px; overflow: hidden; margin: 0 auto; }
        .hero-search-wrap { position: relative; margin-top: 28px; }
        .hero-search-box { display: flex; background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,107,0,0.4); border-radius: 10px; overflow: visible; }
        .hero-search-input { flex: 1; padding: 16px 20px; background: transparent; border: none; outline: none; font-size: 15px; font-family: inherit; color: white; }
        .hero-search-input::placeholder { color: rgba(255,255,255,0.35); }
        .hero-search-btn { background: #FF6B00; color: white; border: none; padding: 0 24px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; border-radius: 0 8px 8px 0; white-space: nowrap; }
        .search-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #0D1B3E; border: 1px solid rgba(255,107,0,0.3); border-radius: 10px; z-index: 100; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .search-dropdown-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; transition: background 0.15s; text-decoration: none; color: white; }
        .search-dropdown-item:hover { background: rgba(255,107,0,0.1); }
        .search-dropdown-name { font-weight: 700; font-size: 14px; }
        .search-dropdown-meta { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 2px; }
        .news-ticker-wrap { background: #080F22; border-top: 2px solid rgba(255,107,0,0.4); overflow: hidden; display: flex; align-items: center; height: 52px; width: 100%; }
        .news-ticker-label { background: #FF6B00; color: white; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; padding: 0 20px; height: 100%; display: flex; align-items: center; white-space: nowrap; flex-shrink: 0; gap: 8px; min-width: 110px; }
        .news-live-dot { width: 8px; height: 8px; background: white; border-radius: 50%; animation: pulse 1.2s ease-in-out infinite; flex-shrink: 0; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
        .news-ticker-track { display: flex; overflow: hidden; flex: 1; }
        .news-ticker-inner { display: flex; gap: 60px; animation: ticker 60s linear infinite; white-space: nowrap; padding-left: 40px; align-items: center; }
        .news-ticker-inner:hover { animation-play-state: paused; }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .news-item { font-size: 13px; color: rgba(255,255,255,0.8); white-space: nowrap; display: inline-flex; align-items: center; gap: 12px; }
        .news-item::before { content: "◆"; color: #FF6B00; font-size: 7px; flex-shrink: 0; }
        .news-item a { color: rgba(255,255,255,0.8); text-decoration: none; }
        .news-item a:hover { color: #FF6B00; }
        .cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .politician-card { background: white; border-radius: 16px; padding: 28px; border: 1.5px solid rgba(13,27,62,0.06); cursor: pointer; text-decoration: none; display: block; transition: box-shadow 0.2s, transform 0.2s; }
        .politician-card:hover { box-shadow: 0 8px 40px rgba(0,0,0,0.12); transform: translateY(-2px); }
        .features-section { padding: 100px 60px; background: #0D1B3E; }
        .features-h2 { font-family: Georgia, serif; font-size: 48px; font-weight: 700; color: white; margin-bottom: 60px; letter-spacing: -1px; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .community-section { padding: 100px 60px; background: #FFF8F0; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
        .community-h2 { font-family: Georgia, serif; font-size: 48px; font-weight: 700; color: #0D1B3E; margin-bottom: 20px; letter-spacing: -1px; }
        .footer { background: #080F22; padding: 60px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); }
        @media (max-width: 768px) {
          .hero-strip { font-size: 11px; padding: 8px 20px; letter-spacing: 1px; }
          .hero { padding: 28px 20px 0; grid-template-columns: 1fr; gap: 0; text-align: center; }
          .hero-left { max-width: 100%; display: flex; flex-direction: column; align-items: center; padding-bottom: 20px; }
          .hero-h1 { font-size: 38px; letter-spacing: -1px; margin-bottom: 16px; }
          .hero-right { width: 100%; }
          .hero-map-container { width: 220px !important; height: 240px !important; }
          .news-ticker-wrap { height: 44px; }
          .news-ticker-label { min-width: 80px; padding: 0 12px; font-size: 10px; }
          .cards-grid { grid-template-columns: 1fr !important; }
          .features-section { padding: 48px 20px; }
          .features-h2 { font-size: 28px !important; margin-bottom: 28px; }
          .features-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .community-section { padding: 48px 20px; grid-template-columns: 1fr !important; gap: 40px !important; }
          .community-h2 { font-size: 28px !important; }
          .footer { padding: 40px 20px; flex-direction: column; gap: 16px; text-align: center; }
        }
      `}</style>

      <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#0D1B3E", color: "white", minHeight: "100vh", margin: 0, padding: 0, overflowX: "hidden" }}>

        {/* TOP STRIP */}
        <div className="hero-strip">The only platform you need before you vote</div>

        {/* HERO + NEWS TICKER wrapped together */}
        <div className="hero-outer">
          <section className="hero">
            <div className="hero-left">
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.3)", padding: "6px 16px", borderRadius: "100px", marginBottom: "24px", fontSize: "12px", fontWeight: "600", letterSpacing: "1.5px", color: "#FF6B00" }}>
                By the people, for the people
              </div>
              <h1 className="hero-h1">
                <span style={{ display: "block" }}>Vaada kiya tha.</span>
                <span style={{ display: "block", color: "#FF6B00" }}>Nibhaya kya?</span>
              </h1>
              <p style={{ fontSize: "17px", lineHeight: "1.7", color: "rgba(255,255,255,0.55)", maxWidth: "460px", fontWeight: "300", margin: "0" }}>
                India&apos;s first comprehensive politician accountability platform. Track promises made by every politician - from your local corporator to the Prime Minister.
              </p>
              <div className="hero-search-wrap" ref={searchRef}>
                <form onSubmit={handleSearch}>
                  <div className="hero-search-box">
                    <input
                      className="hero-search-input"
                      type="text"
                      placeholder="Search any politician..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                      autoComplete="off"
                    />
                    <button type="submit" className="hero-search-btn">Search</button>
                  </div>
                </form>
                {showDropdown && (
                  <div className="search-dropdown">
                    {searchResults.map(p => (
                      <Link
                        key={p.id}
                        href={`/politicians/${slugify(p.name)}`}
                        className="search-dropdown-item"
                        onClick={() => { setShowDropdown(false); setSearch(""); }}
                      >
                        <WikiImage name={p.name} size={36} borderRadius="8px" />
                        <div>
                          <div className="search-dropdown-name">{p.name}</div>
                          <div className="search-dropdown-meta">{p.party} - {p.state}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="hero-right">
              <div style={{ textAlign: "center", marginBottom: "8px", width: "100%" }}>
                <div style={{ fontSize: "15px", fontWeight: "800", letterSpacing: "5px", color: "#FF6B00", textTransform: "uppercase" }}>Every State. Every Promise.</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontStyle: "italic", marginTop: "4px" }}>28 states. 8 union territories. Zero accountability - until now.</div>
              </div>
              <div className="hero-map-container"><IndiaMap /></div>
              <div style={{ textAlign: "center", marginTop: "8px", width: "100%", paddingBottom: "16px" }}>
                <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", letterSpacing: "3px", fontFamily: "Georgia, serif" }}>जनता जानना चाहती है</div>
                <div style={{ fontSize: "12px", color: "#FF6B00", letterSpacing: "4px", marginTop: "4px", textTransform: "uppercase", fontWeight: "700" }}>The Public Wants to Know</div>
              </div>
            </div>
          </section>

          {/* NEWS TICKER - at bottom of hero, touching white section */}
          <div className="news-ticker-wrap">
            <div className="news-ticker-label">
              <div className="news-live-dot"></div>
              Live News
            </div>
            <div className="news-ticker-track">
              {news.length > 0 ? (
                <div className="news-ticker-inner">
                  {[...news, ...news].map((item, i) => (
                    <span key={i} className="news-item">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "0 24px", fontSize: "13px", color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                  Loading latest Indian political news...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FEATURED POLITICIANS */}
        <section style={{ padding: "60px 60px 80px", background: "#FFF8F0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#FF6B00", marginBottom: "10px" }}>Featured Politicians</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "40px", fontWeight: "700", color: "#0D1B3E", margin: 0, letterSpacing: "-1px" }}>Track your neta</h2>
            </div>
            <Link href="/politicians" style={{ color: "#FF6B00", fontWeight: "600", fontSize: "14px", textDecoration: "none" }}>View all politicians -&gt;</Link>
          </div>
          <div className="cards-grid">
            {loading ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "#8A8FA8", fontSize: "16px" }}>Loading politicians...</div>
            ) : politicians.map((p) => {
              const total = p.total_promises || 1;
              const kPct = Math.round((p.promises_kept / total) * 100);
              const prPct = Math.round((p.promises_progress / total) * 100);
              const brPct = Math.round((p.promises_broken / total) * 100);
              return (
                <Link key={p.id} href={`/politicians/${slugify(p.name)}`} className="politician-card">
                  <div style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "center" }}>
                    <WikiImage name={p.name} size={64} borderRadius="12px" />
                    <div>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: "700", color: "#0D1B3E" }}>{p.name}</div>
                      <div style={{ fontSize: "13px", color: "#8A8FA8", marginTop: "4px" }}>{p.role}</div>
                      <div style={{ display: "inline-block", marginTop: "8px", padding: "3px 10px", borderRadius: "100px", background: "rgba(255,107,0,0.1)", color: "#FF6B00", fontSize: "11px", fontWeight: "700" }}>{p.party}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#8A8FA8" }}>Promise Scorecard</span>
                      <strong style={{ fontSize: "12px", color: "#0D1B3E" }}>{p.total_promises} tracked</strong>
                    </div>
                    <div style={{ height: "8px", borderRadius: "100px", background: "#F4F4F8", overflow: "hidden", display: "flex" }}>
                      <div style={{ width: `${kPct}%`, background: "#12A854" }}></div>
                      <div style={{ width: `${prPct}%`, background: "#F59E0B" }}></div>
                      <div style={{ width: `${brPct}%`, background: "#EF4444" }}></div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    {[
                      { color: "#12A854", label: "Kept", val: p.promises_kept },
                      { color: "#F59E0B", label: "In Progress", val: p.promises_progress },
                      { color: "#EF4444", label: "Broken", val: p.promises_broken },
                    ].map(c => (
                      <div key={c.label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#8A8FA8" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: c.color }}></div>
                        <strong style={{ color: "#0D1B3E" }}>{c.val}</strong> {c.label}
                      </div>
                    ))}
                  </div>
                </Link>
              );
            })}
            <Link href="/politicians" style={{ background: "rgba(255,107,0,0.04)", borderRadius: "16px", border: "2px dashed rgba(255,107,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px", textDecoration: "none" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>+</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: "700", color: "#0D1B3E", marginBottom: "8px" }}>More politicians</div>
                <div style={{ fontSize: "13px", color: "#8A8FA8", marginBottom: "16px" }}>Being added every day</div>
                <span style={{ color: "#FF6B00", fontWeight: "600", fontSize: "14px" }}>View all -&gt;</span>
              </div>
            </Link>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-section">
          <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#FF6B00", marginBottom: "16px" }}>What Vaada Tracks</div>
          <h2 className="features-h2">Everything about your<br />elected representative</h2>
          <div className="features-grid">
            {[
              { icon: "📋", title: "Promise Tracking", desc: "Every promise made in manifestos, speeches and press conferences - tracked with evidence, sources and current status.", soon: false },
              { icon: "⚖️", title: "Criminal Cases and FIRs", desc: "Data sourced from ADR and Election Commission affidavits. Know exactly how many cases are filed against your neta.", soon: true },
              { icon: "₹", title: "Asset Declaration", desc: "Track how politician wealth changes election to election. All data from official EC affidavits.", soon: true },
              { icon: "📍", title: "Constituency Work", desc: "What has your MP or MLA actually done for your area? Development funds, projects, attendance in Parliament.", soon: true },
              { icon: "📊", title: "Party Comparison", desc: "Which party keeps more promises? Compare BJP vs INC vs AAP vs regional parties on a level playing field.", soon: false },
              { icon: "🤝", title: "Community Reporting", desc: "Citizens can submit promises we have missed, flag incorrect data, and help keep Vaada accurate.", soon: false },
            ].map((f, i) => (
              <div key={i} style={{ padding: "36px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontSize: "36px", marginBottom: "20px" }}>{f.icon}</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "700", marginBottom: "12px", color: "white" }}>{f.title}</div>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: "1.7" }}>{f.desc}</div>
                {f.soon && <div style={{ display: "inline-block", marginTop: "16px", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", color: "#FF6B00", opacity: 0.7 }}>Coming Soon</div>}
              </div>
            ))}
          </div>
        </section>

        {/* COMMUNITY */}
        <section className="community-section">
          <div>
            <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#FF6B00", marginBottom: "16px" }}>Community</div>
            <h2 className="community-h2">You are the<br />fact-checker</h2>
            <p style={{ fontSize: "17px", color: "#555", lineHeight: "1.8", marginBottom: "32px" }}>Vaada is built by citizens, for citizens. If you know of a promise we have missed, a status that has changed, or a politician we have not added - tell us. Every suggestion is reviewed and added.</p>
            <button onClick={openSuggestModal} style={{ background: "#FF6B00", color: "white", border: "none", padding: "16px 32px", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>Submit Suggestion</button>
          </div>
          <div>
            <div style={{ marginBottom: "16px", fontSize: "14px", fontWeight: "700", color: "#0D1B3E", letterSpacing: "1px", textTransform: "uppercase" }}>Recent community suggestions</div>
            {[
              { user: "@delhi_citizen", time: "2 hours ago", text: "The free bus for women promise should be marked as Kept - it has been running since Oct 2019 continuously", status: "Verified and Updated", color: "#12A854" },
              { user: "@up_voter_2", time: "5 hours ago", text: "Please add Akhilesh Yadav's promise of laptop distribution to students from 2012 manifesto", status: "Under Review", color: "#f0a500" },
              { user: "@mumbai_watch", time: "1 day ago", text: "Devendra Fadnavis needs to be added as Maharashtra CM with his new promises from Dec 2024", status: "Being Added", color: "#FF6B00" },
            ].map((s, i) => (
              <div key={i} style={{ background: "white", borderRadius: "12px", padding: "20px", marginBottom: "12px", border: "1px solid #eee" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "700", fontSize: "13px", color: "#0D1B3E" }}>{s.user}</span>
                  <span style={{ fontSize: "12px", color: "#999" }}>{s.time}</span>
                </div>
                <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.6", marginBottom: "10px" }}>{s.text}</p>
                <span style={{ fontSize: "12px", fontWeight: "700", color: s.color }}>{s.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: "900", color: "#FF6B00" }}>Vaada</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: "6px" }}>Holding India&apos;s politicians accountable - one promise at a time.</div>
          </div>
          <div style={{ fontSize: "24px" }}>🇮🇳</div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", textAlign: "right" }}>
            <div>Built for the people of India</div>
            <div style={{ marginTop: "8px" }}>Data from public records, manifestos and fact-checkers</div>
          </div>
        </footer>

      </main>
    </>
  );
}
