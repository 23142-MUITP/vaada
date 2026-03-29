"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/politicians", label: "Politicians" },
  { href: "/promises", label: "Promises" },
  { href: "/states", label: "By State" },
  { href: "/parties", label: "By Party" },
  { href: "/about", label: "About" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <style>{`
        .vn {
          background: #0D1B3E;
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 200;
          border-bottom: 1px solid rgba(255,107,0,0.1);
        }
        .vn-logo {
          color: #FF6B00;
          font-size: 24px;
          font-weight: 700;
          font-family: Georgia, serif;
          text-decoration: none;
          line-height: 1;
        }
        .vn-sub {
          font-size: 10px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 3px;
          display: block;
          margin-top: 2px;
        }
        .vn-links {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        .vn-link {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }
        .vn-link:hover { color: white; }
        .vn-link.active { color: #FF6B00; }
        .vn-cta {
          background: #FF6B00;
          color: white !important;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
        }
        .vn-burger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 8px;
          margin: 0;
          appearance: none;
          -webkit-appearance: none;
        }
        .vn-burger span {
          width: 24px;
          height: 2px;
          background: white;
          display: block;
          border-radius: 2px;
          transition: background 0.2s;
        }
        .vn-mobile {
          display: none;
          position: fixed;
          inset: 0;
          background: #0D1B3E;
          z-index: 999;
          flex-direction: column;
          padding: 80px 40px 40px;
        }
        .vn-mobile.open { display: flex; }
        .vn-mlink {
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          font-size: 32px;
          font-weight: 700;
          font-family: Georgia, serif;
          padding: 20px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: block;
        }
        .vn-mlink:hover, .vn-mlink.active { color: #FF6B00; }
        .vn-close {
          position: absolute;
          top: 24px;
          right: 24px;
          background: none;
          border: none;
          color: white;
          font-size: 36px;
          cursor: pointer;
          line-height: 1;
          appearance: none;
          -webkit-appearance: none;
        }

        @media (max-width: 768px) {
          .vn { padding: 14px 20px !important; }
          .vn-links { display: none !important; }
          .vn-burger { display: flex !important; }
        }
      `}</style>

      <nav className="vn">
        <Link href="/" className="vn-logo">
          Vaada
          <span className="vn-sub">INDIA PROMISE TRACKER</span>
        </Link>
        <div className="vn-links">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`${link.href === "/leaderboard" ? "vn-cta" : "vn-link"} ${pathname === link.href ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button className="vn-burger" onClick={() => setOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
      </nav>

      <div className={`vn-mobile ${open ? "open" : ""}`}>
        <button className="vn-close" onClick={() => setOpen(false)} aria-label="Close menu">
          ×
        </button>
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`vn-mlink ${pathname === link.href ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );
}
