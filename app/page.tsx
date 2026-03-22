"use client";
import { useEffect, useState } from "react";
import IndiaMap from "./IndiaMap";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

type Stats = {
  politicians: number;
  promises: number;
  kept: number;
  progress: number;
  broken: number;
};

export default function Home() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const [{ data: pols }, { data: allPols }, { data: promises }] = await Promise.all([
        supabase.from("politicians").select("*").limit(5),
        supabase.from("politicians").select("promises_kept, promises_progress, promises_broken, total_promises"),
        supabase.from("promises").select("status"),
      ]);

      if (pols) setPoliticians(pols);

      if (allPols) {
        const totalKept = allPols.reduce((a, p) => a + (p.promises_kept || 0), 0);
        const totalProgress = allPols.reduce((a, p) => a + (p.promises_progress || 0), 0);
        const totalBroken = allPols.reduce((a, p) => a + (p.promises_broken || 0), 0);
        const totalPromises = promises?.length || 0;
        setStats({
          politicians: allPols.length,
          promises: totalPromises,
          kept: totalKept,
          progress: totalProgress,
          broken: totalBroken,
        });
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  function getInitials(name: string) {
    return name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  function slugify(name: string) {
    return name?.toLowerCase().replace(/\s+/g, "-") || "";
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) router.push(`/politicians?search=${encodeURIComponent(search.trim())}`);
    else router.push("/politicians");
  }

  const totalTracked = stats ? stats.kept + stats.progress + stats.broken : 0;
  const keptPct = totalTracked ? Math.round((stats!.kept / totalTracked) * 100) : 0;
  const progressPct = totalTracked ? Math.round((stats!.progress / totalTracked) * 100) : 0;
  const brokenPct = totalTracked ? Math.round((stats!.broken / totalTracked) * 100) : 0;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; overflow-x: hidden; }
        .nav { padding: 20px 60px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,107,0,0.15); background: rgba(13,27,62,0.95); position: sticky; top: 0; z-index: 100; }
        .nav-links { display: flex; gap: 36px; align-items: center; }
        .nav-link { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; transition: color 0.15s; }
        .nav-link:hover { color: #FF6B00; }
        .nav-cta { background: #FF6B00; color: white; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; text-decoration: none; white-space: nowrap; }
        .nav-mobile-cta { display: none; }
        .hero { padding: 70px 60px 60px; display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 40px; background: radial-gradient(ellipse 60% 50% at 70% 40%, rgba(255,107,0,0.12) 0%, transparent 60%); overflow: hidden; }
        .hero-left { width: 100%; max-width: 560px; }
        .hero-h1 { font-family: Georgia, serif; font-size: 72px; font-weight: 900; line-height: 1.0; letter-spacing: -2px; margin: 0 0 24px 0; }
        .hero-right { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; }
        .hero-map-container { width: 340px; height: 400px; overflow: hidden; margin: 0 auto; }
        .stats-bar { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(5, 1fr); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; background: rgba(255,255,255,0.03); }
        .stat-item { padding: 24px 28px; }
        .stat-num { font-family: Georgia, serif; font-size: 38px; font-weight: 700; }
        .stat-label { margin-top: 6px; font-size: 12px; color: rgba(255,255,255,0.4); }
        .search-section { padding: 100px 60px; background: #FFF8F0; }
        .search-h2 { font-family: Georgia, serif; font-size: 48px; font-weight: 700; color: #0D1B3E; margin-bottom: 48px; letter-spacing: -1px; }
        .search-box { display: flex; max-width: 680px; background: white; border-radius: 12px; border: 2px solid rgba(13,27,62,0.12); overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.08); }
        .cards-section { padding: 0 60px 100px; background: #FFF8F0; }
        .cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .politician-card { background: white; border-radius: 16px; padding: 28px; border: 1.5px solid rgba(13,27,62,0.06); cursor: pointer; text-decoration: none; display: block; transition: box-shadow 0.2s, transform 0.2s; }
        .politician-card:hover { box-shadow: 0 8px 40px rgba(0,0,0,0.12); transform: translateY(-2px); }
        .features-section { padding: 100px 60px; background: #0D1B3E; }
        .features-h2 { font-family: Georgia, serif; font-size: 48px; font-weight: 700; color: white; margin-bottom: 60px; letter-spacing: -1px; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .community-section { padding: 100px 60px; background: #FFF8F0; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .community-h2 { font-family: Georgia, serif; font-size: 48px; font-weight: 700; color: #0D1B3E; margin-bottom: 20px; letter-spacing: -1px; }
        .footer { background: #080F22; padding: 60px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); }
        @media (max-width: 768px) {
          .nav { padding: 14px 20px; }
          .nav-links { display: none; }
          .nav-mobile-cta { display: block; }
          .hero { padding: 36px 20px 28px; grid-template-columns: 1fr; gap: 0; text-align: center; }
          .hero-left { max-width: 100%; display: flex; flex-direction: column; align-items: center; }
          .hero-h1 { font-size: 38px; letter-spacing: -1px; margin-bottom: 16px; }
          .hero-right { width: 100%; margin-top: 32px; }
          .hero-map-container { width: 240px !important; height: 280px !important; }
          .stats-bar { grid-template-columns: repeat(2, 1fr) !important; margin-top: 24px; }
          .stat-item { padding: 16px; }
          .stat-num { font-size: 24px !important; }
          .search-section { padding: 48px 20px; }
          .search-h2 { font-size: 28px !important; margin-bottom: 24px; }
          .search-box { flex-direction: column; }
          .cards-section { padding: 0 20px 48px; }
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

        {/* NAV */}
        <nav className="nav">
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: "900", color: "#FF6B00" }}>Vaada</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "3px" }}>INDIA PROMISE TRACKER</div>
          </div>
          <div className="nav-links">
            <Link href="/politicians" className="nav-link">Politicians</Link>
            <Link href="/promises" className="nav-link">Promises</Link>
            <Link href="/states" className="nav-link">By State</Link>
            <Link href="/parties" className="nav-link">By Party</Link>
            <Link href="/leaderboard" className="nav-cta">Leaderboard</Link>
          </div>
          <Link href="/leaderboard" className="nav-cta nav-mobile-cta" style={{ fontSize: "12px", padding: "8px 14px" }}>Leaderboard</Link>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-left">
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.3)", padding: "6px 16px", borderRadius: "100px", marginBottom: "28px", fontSize: "12px", fontWeight: "600", letterSpacing: "1.5px", color: "#FF6B00" }}>
              By the people, for the people
            </div>
            <h1 className="hero-h1">
              <span style={{ display: "block" }}>Vaada kiya tha.</span>
              <span style={{ display: "block", color: "#FF6B00" }}>Nibhaya kya?</span>
            </h1>
            <p style={{ fontSize: "17px", lineHeight: "1.7", color: "rgba(255,255,255,0.55)", maxWidth: "460px", fontWeight: "300", margin: "0 0 36px 0" }}>
              India&apos;s first comprehensive politician accountability platform. Track promises made by every politician - from your local corporator to the Prime Minister.
            </p>
            <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/politicians" style={{ background: "#FF6B00", color: "white", padding: "14px 32px", borderRadius: "8px", fontSize: "15px", fontWeight: "600", textDecoration: "none", boxShadow: "0 4px 24px rgba(255,107,0,0.35)" }}>Browse Politicians</Link>
              <Link href="/promises" style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", textDecoration: "none" }}>See all promises -&gt;</Link>
            </div>
          </div>

          <div className="hero-right">
            <div style={{ textAlign: "center", marginBottom: "18px", width: "100%" }}>
              <div style={{ fontSize: "15px", fontWeight: "800", letterSpacing: "5px", color: "#FF6B00", textTransform: "uppercase" }}>Every State. Every Promise.</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontStyle: "italic", marginTop: "8px" }}>28 states. 8 union territories. Zero accountability - until now.</div>
            </div>
            <div className="hero-map-container"><IndiaMap /></div>
            <div style={{ textAlign: "center", marginTop: "18px", width: "100%" }}>
              <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.6)", letterSpacing: "3px", fontFamily: "Georgia, serif" }}>जनता जानना चाहती है</div>
              <div style={{ fontSize: "12px", color: "#FF6B00", letterSpacing: "4px", marginTop: "8px", textTransform: "uppercase", fontWeight: "700" }}>The Public Wants to Know</div>
            </div>
          </div>

          {/* LIVE STATS */}
          <div className="stats-bar">
            {[
              { num: loading ? "..." : stats?.politicians.toString() || "0", label: "Politicians tracked", color: "#FF6B00" },
              { num: loading ? "..." : stats?.promises.toString() || "0", label: "Promises recorded", color: "#FF6B00" },
              { num: loading ? "..." : `${keptPct}%`, label: "Promises kept", color: "#12A854" },
              { num: loading ? "..." : `${progressPct}%`, label: "In progress", color: "#F59E0B" },
              { num: loading ? "..." : `${brokenPct}%`, label: "Broken / Abandoned", color: "#EF4444" },
            ].map((stat, i) => (
              <div key={i} className="stat-item" style={{ borderRight: i < 4 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <div className="stat-num" style={{ color: stat.color }}>{stat.num}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SEARCH */}
        <section className="search-section">
          <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#FF6B00", marginBottom: "16px" }}>Find Your Neta</div>
          <h2 className="search-h2">Search any politician<br />across India</h2>
          <form onSubmit={handleSearch}>
            <div className="search-box">
              <input type="text" placeholder="Search by name, party, state or constituency..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: "18px 24px", border: "none", outline: "none", fontSize: "16px", fontFamily: "inherit", color: "#0D1B3E" }} />
              <button type="submit" style={{ background: "#FF6B00", color: "white", border: "none", padding: "0 32px", fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>Search</button>
            </div>
          </form>
          <div style={{ marginTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {["All", "National", "State", "BJP", "INC", "AAP", "SP", "TMC"].map(f => (
              <Link key={f} href={f === "All" ? "/politicians" : `/politicians?filter=${f}`} style={{ padding: "8px 18px", borderRadius: "100px", background: f === "All" ? "#FF6B00" : "white", color: f === "All" ? "white" : "#0D1B3E", border: "1.5px solid", borderColor: f === "All" ? "#FF6B00" : "rgba(13,27,62,0.12)", fontSize: "13px", fontWeight: "500", textDecoration: "none" }}>{f}</Link>
            ))}
          </div>
        </section>

        {/* POLITICIAN CARDS - LIVE FROM SUPABASE */}
        <section className="cards-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#FF6B00", marginBottom: "8px" }}>Featured Politicians</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "32px", fontWeight: "700", color: "#0D1B3E", margin: 0 }}>Recently added</h2>
            </div>
            <Link href="/politicians" style={{ color: "#FF6B00", fontWeight: "600", fontSize: "14px", textDecoration: "none" }}>View all {stats?.politicians || ""} politicians -&gt;</Link>
          </div>
          <div className="cards-grid">
            {loading ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "#8A8FA8", fontSize: "16px" }}>Loading politicians...</div>
            ) : politicians.map((p) => {
              const total = p.total_promises || 1;
              const keptPct = Math.round((p.promises_kept / total) * 100);
              const progressPct = Math.round((p.promises_progress / total) * 100);
              const brokenPct = Math.round((p.promises_broken / total) * 100);
              return (
                <Link key={p.id} href={`/politicians/${slugify(p.name)}`} className="politician-card">
                  <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "12px", flexShrink: 0, background: "linear-gradient(135deg, #FF6B00, #0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700", color: "white", fontFamily: "Georgia, serif" }}>
                      {getInitials(p.name)}
                    </div>
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
                      <div style={{ width: `${keptPct}%`, background: "#12A854" }}></div>
                      <div style={{ width: `${progressPct}%`, background: "#F59E0B" }}></div>
                      <div style={{ width: `${brokenPct}%`, background: "#EF4444" }}></div>
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
                <div style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: "700", color: "#0D1B3E", marginBottom: "8px" }}>{stats ? `${stats.politicians - 5}+ more` : "More politicians"}</div>
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
            <p style={{ fontSize: "16px", color: "rgba(13,27,62,0.55)", lineHeight: "1.8", marginBottom: "36px" }}>
              Vaada is built by citizens, for citizens. If you know of a promise we have missed, a status that has changed, or a politician we have not added - tell us. Every suggestion is reviewed and added.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input style={{ padding: "14px 18px", borderRadius: "10px", border: "1.5px solid rgba(13,27,62,0.12)", fontSize: "15px", fontFamily: "inherit", color: "#0D1B3E", outline: "none", width: "100%" }} placeholder="Politician name" />
              <input style={{ padding: "14px 18px", borderRadius: "10px", border: "1.5px solid rgba(13,27,62,0.12)", fontSize: "15px", fontFamily: "inherit", color: "#0D1B3E", outline: "none", width: "100%" }} placeholder="The promise made" />
              <input style={{ padding: "14px 18px", borderRadius: "10px", border: "1.5px solid rgba(13,27,62,0.12)", fontSize: "15px", fontFamily: "inherit", color: "#0D1B3E", outline: "none", width: "100%" }} placeholder="Source or evidence link" />
              <textarea style={{ padding: "14px 18px", borderRadius: "10px", border: "1.5px solid rgba(13,27,62,0.12)", fontSize: "15px", fontFamily: "inherit", color: "#0D1B3E", outline: "none", minHeight: "100px", resize: "vertical", width: "100%" }} placeholder="Any additional context..." />
              <button style={{ width: "fit-content", background: "#FF6B00", color: "white", border: "none", padding: "16px 36px", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>Submit Suggestion</button>
            </div>
          </div>
          <div style={{ background: "#0D1B3E", borderRadius: "24px", padding: "40px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginBottom: "8px", letterSpacing: "1px", textTransform: "uppercase" }}>Recent community suggestions</div>
            {[
              { user: "@delhi_citizen", time: "2 hours ago", text: "The free bus for women promise should be marked as Kept - it has been running since Oct 2019 continuously", tag: "Verified and Updated", green: true },
              { user: "@up_voter_22", time: "5 hours ago", text: "Please add Akhilesh Yadav's promise of laptop distribution to students from 2012 manifesto", tag: "Under Review", green: false },
              { user: "@mumbai_watch", time: "1 day ago", text: "Devendra Fadnavis needs to be added as Maharashtra CM with his new promises from Dec 2024", tag: "Being Added", green: false },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "18px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#FF6B00", fontWeight: "600" }}>{s.user}</span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{s.time}</span>
                </div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: "1.5" }}>{s.text}</div>
                <div style={{ display: "inline-block", marginTop: "10px", padding: "3px 10px", borderRadius: "100px", fontSize: "11px", background: s.green ? "rgba(18,168,84,0.2)" : "rgba(245,158,11,0.2)", color: s.green ? "#12A854" : "#F59E0B" }}>{s.tag}</div>
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
