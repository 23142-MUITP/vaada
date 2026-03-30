"use client";
import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const { data: pols } = await supabase.from("politicians").select("*").limit(5);
      if (pols) setPoliticians(pols);
      setLoading(false);
    }

    async function fetchNews() {
      try {
        const res = await fetch(
          `https://gnews.io/api/v4/search?q=India+politics+parliament&lang=en&country=in&max=10&apikey=193be28d502ec79048f750f819fb69d5`
        );
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

  function slugify(name: string) {
    return name?.toLowerCase().replace(/\s+/g, "-") || "";
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) router.push(`/politicians?search=${encodeURIComponent(search.trim())}`);
    else router.push("/politicians");
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
        .hero { padding: 70px 60px 60px; display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 40px; background: radial-gradient(ellipse 60% 50% at 70% 40%, rgba(255,107,0,0.12) 0%, transparent 60%); overflow: hidden; }
        .hero-left { width: 100%; max-width: 560px; }
        .hero-h1 { font-family: Georgia, serif; font-size: 72px; font-weight: 900; line-height: 1.0; letter-spacing: -2px; margin: 0 0 24px 0; }
        .hero-right { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; }
        .hero-map-container { width: 340px; height: 400px; overflow: hidden; margin: 0 auto; }
        .news-ticker-wrap { background: #080F22; border-top: 2px solid rgba(255,107,0,0.3); border-bottom: 2px solid rgba(255,107,0,0.3); padding: 0; overflow: hidden; display: flex; align-items: center; height: 44px; }
        .news-ticker-label { background: #FF6B00; color: white; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; padding: 0 18px; height: 100%; display: flex; align-items: center; white-space: nowrap; flex-shrink: 0; gap: 6px; }
        .news-ticker-track { display: flex; overflow: hidden; flex: 1; }
        .news-ticker-inner { display: flex; gap: 60px; animation: ticker 50s linear infinite; white-space: nowrap; padding-left: 40px; }
        .news-ticker-inner:hover { animation-play-state: paused; }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .news-item { font-size: 13px; color: rgba(255,255,255,0.8); white-space: nowrap; display: inline-flex; align-items: center; gap: 10px; }
        .news-item::before { content: "◆"; color: #FF6B00; font-size: 8px; }
        .news-item a { color: rgba(255,255,255,0.8); text-decoration: none; transition: color 0.2s; }
        .news-item a:hover { color: #FF6B00; }
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
        .community-section { padding: 100px 60px; background: #FFF8F0; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
        .community-h2 { font-family: Georgia, serif; font-size: 48px; font-weight: 700; color: #0D1B3E; margin-bottom: 20px; letter-spacing: -1px; }
        .footer { background: #080F22; padding: 60px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); }
        @media (max-width: 768px) {
          .hero-strip { font-size: 11px; padding: 8px 20px; letter-spacing: 1px; }
          .hero { padding: 36px 20px 28px; grid-template-columns: 1fr; gap: 0; text-align: center; }
          .hero-left { max-width: 100%; display: flex; flex-direction: column; align-items: center; }
          .hero-h1 { font-size: 38px; letter-spacing: -1px; margin-bottom: 16px; }
          .hero-right { width: 100%; margin-top: 32px; }
          .hero-map-container { width: 240px !important; height: 280px !important; }
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

        {/* TOP STRIP */}
        <div className="hero-strip">The only platform you need before you vote</div>

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
        </section>

        {/* NEWS TICKER - below hero */}
        <div className="news-ticker-wrap">
          <div className="news-ticker-label">
            <span style={{ fontSize: "8px", color: "#ff4444", animation: "pulse 1s infinite" }}>●</span>
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

        {/* POLITICIAN CARDS */}
        <section className="cards-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#FF6B00", marginBottom: "8px" }}>Featured Politicians</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "32px", fontWeight: "700", color: "#0D1B3E", margin: 0 }}>Recently added</h2>
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
