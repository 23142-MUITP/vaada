"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

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

export default function PoliticianProfile() {
  const { slug } = useParams();
  const [politician, setPolitician] = useState<Politician | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const name = (slug as string).replace(/-/g, " ");
      const { data } = await supabase.from("politicians").select("*").ilike("name", name).single();
      if (data) setPolitician(data);
      setLoading(false);
    }
    fetch();
  }, [slug]);

  function getInitials(name: string) {
    return name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  function getScore(p: Politician) {
    if (!p.total_promises) return 0;
    return Math.round((p.promises_kept / p.total_promises) * 100);
  }

  if (loading) return <div style={{padding: "80px", textAlign: "center", fontFamily: "DM Sans, sans-serif", color: "#666"}}>Loading...</div>;
  if (!politician) return <div style={{padding: "80px", textAlign: "center", fontFamily: "DM Sans, sans-serif", color: "#666"}}>Politician not found.</div>;

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
        @media (max-width: 768px) {
          .hero { flex-direction: column; padding: 40px 20px; }
          .hero-name { font-size: 32px; }
          .grid { grid-template-columns: 1fr; }
          .content { padding: 20px; }
          .breadcrumb { padding: 16px 20px; }
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
        <Link href="/politicians" className="back-btn">← Back to all politicians</Link>
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
      </div>
    </>
  );
}
