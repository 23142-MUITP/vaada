"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/politicians", label: "Politicians" },
  { href: "/promises", label: "Promises" },
  { href: "/states", label: "By State" },
  { href: "/parties", label: "By Party" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <style>{`
        .navbar { background: #0D1B3E; padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; }
        .navbar-logo { color: #FF6B00; font-size: 24px; font-weight: 700; font-family: Georgia, serif; text-decoration: none; line-height: 1; }
        .navbar-logo-sub { font-size: 10px; color: rgba(255,255,255,0.4); letter-spacing: 3px; display: block; margin-top: 2px; }
        .navbar-links { display: flex; gap: 24px; align-items: center; }
        .navbar-link { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.15s; }
        .navbar-link:hover { color: white; }
        .navbar-link.active { color: #FF6B00; font-weight: 700; }
        .navbar-cta { background: #FF6B00; color: white; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 700; text-decoration: none; white-space: nowrap; transition: background 0.15s; }
        .navbar-cta:hover { background: #e55a00; }
        .navbar-cta.active { background: #e55a00; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 4px; }
        .hamburger-line { width: 24px; height: 2px; background: white; border-radius: 2px; transition: all 0.3s; }
        .hamburger-line.open-1 { transform: rotate(45deg) translate(5px, 5px); }
        .hamburger-line.open-2 { opacity: 0; }
        .hamburger-line.open-3 { transform: rotate(-45deg) translate(5px, -5px); }
        .mobile-menu { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #0D1B3E; z-index: 99; flex-direction: column; padding: 100px 40px 40px; gap: 8px; }
        .mobile-menu.open { display: flex; }
        .mobile-link { color: rgba(255,255,255,0.8); text-decoration: none; font-size: 28px; font-weight: 700; font-family: Georgia, serif; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.08); transition: color 0.15s; }
        .mobile-link:hover { color: #FF6B00; }
        .mobile-link.active { color: #FF6B00; }
        .mobile-close { position: absolute; top: 20px; right: 24px; background: none; border: none; color: white; font-size: 32px; cursor: pointer; }
        @media (max-width: 768px) {
          .navbar { padding: 14px 20px; }
          .navbar-links { display: none; }
          .hamburger { display: flex; }
        }
      `}</style>

      <nav className="navbar">
        <Link href="/" className="navbar-logo">
          Vaada
          <span className="navbar-logo-sub">INDIA PROMISE TRACKER</span>
        </Link>
        <div className="navbar-links">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`${link.href === "/leaderboard" ? "navbar-cta" : "navbar-link"} ${pathname === link.href ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button className="hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </nav>

      {/* MOBILE FULL SCREEN MENU */}
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <button className="mobile-close" onClick={() => setOpen(false)}>x</button>
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`mobile-link ${pathname === link.href ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );
}
