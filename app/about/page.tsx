import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #faf8f5; color: #0D1B3E; }
        .hero { background: #0D1B3E; padding: 80px 40px; text-align: center; }
        .hero-badge { display: inline-block; background: rgba(255,107,0,0.15); color: #FF6B00; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 24px; }
        .hero h1 { font-family: Georgia, serif; font-size: 56px; color: white; margin-bottom: 20px; line-height: 1.15; }
        .hero h1 span { color: #FF6B00; }
        .hero p { color: rgba(255,255,255,0.65); font-size: 20px; max-width: 600px; margin: 0 auto; line-height: 1.7; }
        .section { max-width: 860px; margin: 0 auto; padding: 80px 40px; }
        .section-label { font-size: 12px; font-weight: 700; color: #FF6B00; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .section h2 { font-family: Georgia, serif; font-size: 36px; color: #0D1B3E; margin-bottom: 20px; }
        .section p { font-size: 17px; color: #555; line-height: 1.8; margin-bottom: 16px; }
        .divider { border: none; border-top: 1px solid #eee; margin: 0; }
        .how-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; margin-top: 48px; }
        .how-card { background: white; border-radius: 16px; padding: 32px; border: 1px solid #eee; }
        .how-num { font-family: Georgia, serif; font-size: 48px; font-weight: 700; color: #FF6B00; opacity: 0.3; line-height: 1; margin-bottom: 16px; }
        .how-title { font-family: Georgia, serif; font-size: 20px; font-weight: 700; color: #0D1B3E; margin-bottom: 10px; }
        .how-desc { font-size: 15px; color: #666; line-height: 1.7; }
        .sources-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 40px; }
        .source-card { background: white; border-radius: 12px; padding: 24px; border: 1px solid #eee; display: flex; gap: 16px; align-items: flex-start; }
        .source-icon { font-size: 28px; flex-shrink: 0; }
        .source-title { font-weight: 700; font-size: 16px; color: #0D1B3E; margin-bottom: 4px; }
        .source-desc { font-size: 14px; color: #777; line-height: 1.6; }
        .values-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 40px; }
        .value-card { background: white; border-radius: 12px; padding: 24px; border: 1px solid #eee; }
        .value-title { font-weight: 700; font-size: 16px; color: #0D1B3E; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
        .value-desc { font-size: 14px; color: #777; line-height: 1.6; }
        .cta-section { background: #0D1B3E; padding: 80px 40px; text-align: center; }
        .cta-section h2 { font-family: Georgia, serif; font-size: 40px; color: white; margin-bottom: 16px; }
        .cta-section p { color: rgba(255,255,255,0.6); font-size: 18px; margin-bottom: 40px; max-width: 500px; margin-left: auto; margin-right: auto; }
        .cta-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .btn-primary { background: #FF6B00; color: white; padding: 16px 32px; border-radius: 10px; font-weight: 700; font-size: 16px; text-decoration: none; }
        .btn-primary:hover { background: #e55a00; }
        .btn-secondary { background: rgba(255,255,255,0.1); color: white; padding: 16px 32px; border-radius: 10px; font-weight: 700; font-size: 16px; text-decoration: none; border: 1px solid rgba(255,255,255,0.2); }
        .btn-secondary:hover { background: rgba(255,255,255,0.15); }
        @media (max-width: 768px) {
          .hero { padding: 60px 20px; }
          .hero h1 { font-size: 36px; }
          .hero p { font-size: 17px; }
          .section { padding: 60px 20px; }
          .section h2 { font-size: 28px; }
          .how-grid { grid-template-columns: 1fr; gap: 20px; }
          .sources-grid { grid-template-columns: 1fr; }
          .values-grid { grid-template-columns: 1fr; }
          .cta-section { padding: 60px 20px; }
          .cta-section h2 { font-size: 28px; }
        }
      `}</style>

      <div className="hero">
        <div className="hero-badge">Our Mission</div>
        <h1>Accountability is a <span>right</span>, not a privilege</h1>
        <p>Vaada was built on one simple belief - every Indian citizen deserves to know if their elected representative kept their word.</p>
      </div>

      <div className="section">
        <div className="section-label">Why Vaada</div>
        <h2>The problem we are solving</h2>
        <p>Every election cycle, thousands of promises are made - in manifestos, rallies, press conferences and speeches. Once the election is over, most of these promises are forgotten. There is no single place where citizens can go to track what was promised and what was delivered.</p>
        <p>Vaada changes that. We track every promise, from the Prime Minister down to state-level leaders, and give citizens the tools to hold their representatives accountable - with data, sources and community verification.</p>
      </div>

      <hr className="divider" />

      <div className="section">
        <div className="section-label">How It Works</div>
        <h2>Simple, transparent, open</h2>
        <div className="how-grid">
          <div className="how-card">
            <div className="how-num">01</div>
            <div className="how-title">Politicians are added</div>
            <div className="how-desc">We add politicians at every level - national, state and local. Each profile includes their role, party, constituency and a promise scorecard.</div>
          </div>
          <div className="how-card">
            <div className="how-num">02</div>
            <div className="how-title">Promises are tracked</div>
            <div className="how-desc">Every promise is logged with its source - manifesto, speech or press conference - along with the year it was made and its current status.</div>
          </div>
          <div className="how-card">
            <div className="how-num">03</div>
            <div className="how-title">Community keeps us honest</div>
            <div className="how-desc">Citizens submit promises we missed, flag status changes and help verify data. Every suggestion is reviewed before going live.</div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      <div className="section">
        <div className="section-label">Data Sources</div>
        <h2>Where our data comes from</h2>
        <div className="sources-grid">
          <div className="source-card">
            <div className="source-icon">📋</div>
            <div>
              <div className="source-title">Party Manifestos</div>
              <div className="source-desc">Official election manifestos from the Election Commission of India archives and party websites.</div>
            </div>
          </div>
          <div className="source-card">
            <div className="source-icon">⚖️</div>
            <div>
              <div className="source-title">EC Affidavits</div>
              <div className="source-desc">Candidate affidavits filed with the Election Commission - the primary source for asset and criminal record data.</div>
            </div>
          </div>
          <div className="source-card">
            <div className="source-icon">🔍</div>
            <div>
              <div className="source-title">ADR and MyNeta</div>
              <div className="source-desc">Association for Democratic Reforms and MyNeta.info - India's leading political transparency organizations.</div>
            </div>
          </div>
          <div className="source-card">
            <div className="source-icon">📰</div>
            <div>
              <div className="source-title">News and Fact-checkers</div>
              <div className="source-desc">Verified reporting from established news organizations and independent fact-checking outlets.</div>
            </div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      <div className="section">
        <div className="section-label">Our Values</div>
        <h2>What we stand for</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-title">🇮🇳 Non-partisan</div>
            <div className="value-desc">We track promises from every party - BJP, INC, AAP, SP, TMC and all regional parties. No political affiliation, no bias.</div>
          </div>
          <div className="value-card">
            <div className="value-title">🔓 Open data</div>
            <div className="value-desc">All our data comes from public sources. We believe political accountability information should be free and accessible to everyone.</div>
          </div>
          <div className="value-card">
            <div className="value-title">✅ Source-first</div>
            <div className="value-desc">Every promise on Vaada is linked to a verifiable source. No claim is made without evidence citizens can check themselves.</div>
          </div>
          <div className="value-card">
            <div className="value-title">🤝 Community-powered</div>
            <div className="value-desc">Vaada is built with citizens, not just for them. Your submissions, corrections and suggestions make this platform better every day.</div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Help us hold India accountable</h2>
        <p>Know a promise we missed? A politician we have not added? Tell us.</p>
        <div className="cta-buttons">
          <Link href="/politicians" className="btn-primary">Browse Politicians</Link>
          <Link href="/promises" className="btn-secondary">See All Promises</Link>
        </div>
      </div>
    </>
  );
}
