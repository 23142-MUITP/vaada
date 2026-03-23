"use client";
import { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth <= 768); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      <nav style={{
        background: "#0D1B3E",
        padding: isMobile ? "14px 20px" : "16px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid rgba(255,107,0,0.1)",
      }}>
        <Link href="/" style={{ color: "#FF6B00", fontSize: "24px", fontWeight: "700", fontFamily: "Georgia, serif", textDecoration: "none", lineHeight: 1 }}>
          Vaada
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "3px", display: "block", marginTop: "2px", fontFamily: "DM Sans, sans-serif" }}>INDIA PROMISE TRACKER</span>
        </Link>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: link.href === "/leaderboard" ? "white" : pathname === link.href ? "#FF6B00" : "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: link.href === "/leaderboard" ? "700" : "500",
                  background: link.href === "/leaderboard" ? "#FF6B00" : "transparent",
                  padding: link.href === "/leaderboard" ? "10px 20px" : "0",
                  borderRadius: link.href === "/leaderboard" ? "8px" : "0",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Hamburger */}
        {isMobile && (
          <button
            onClick={() => setOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", flexDirection: "column", gap: "5px" }}
          >
            <span style={{ width: "24px", height: "2px", background: "white", display: "block", borderRadius: "2px" }}></span>
            <span style={{ width: "24px", height: "2px", background: "white", display: "block", borderRadius: "2px" }}></span>
            <span style={{ width: "24px", height: "2px", background: "white", display: "block", borderRadius: "2px" }}></span>
          </button>
        )}
      </nav>

      {/* Mobile fullscreen menu */}
      {open && (
        <div style={{
          position: "fixed", inset: 0, background: "#0D1B3E", zIndex: 999,
          display: "flex", flexDirection: "column", padding: "100px 40px 40px", gap: "8px",
        }}>
          <button
            onClick={() => setOpen(false)}
            style={{ position: "absolute", top: "20px", right: "24px", background: "none", border: "none", color: "white", fontSize: "32px", cursor: "pointer" }}
          >
            x
          </button>
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{
                color: pathname === link.href ? "#FF6B00" : "rgba(255,255,255,0.8)",
                textDecoration: "none",
                fontSize: "28px",
                fontWeight: "700",
                fontFamily: "Georgia, serif",
                padding: "16px 0",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
