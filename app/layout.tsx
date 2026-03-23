import type { Metadata } from "next";
import "./globals.css";
import SuggestModal from "./components/SuggestModal";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "Vaada - India Promise Tracker",
    template: "%s | Vaada"
  },
  description: "Track every promise made by Indian politicians. Hold your elected representatives accountable. India's first comprehensive politician accountability platform.",
  keywords: ["India politician promises", "politician accountability", "election promises India", "neta tracker", "BJP promises", "INC promises", "political accountability India"],
  authors: [{ name: "Vaada" }],
  creator: "Vaada",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://vaada-sigma.vercel.app",
    siteName: "Vaada - India Promise Tracker",
    title: "Vaada - India Promise Tracker",
    description: "Track every promise made by Indian politicians. Vaada kiya tha. Nibhaya kya?",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Vaada - India Promise Tracker" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaada - India Promise Tracker",
    description: "Track every promise made by Indian politicians. Vaada kiya tha. Nibhaya kya?",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
        <Navbar />
        {children}
        <SuggestModal />
      </body>
    </html>
  );
}
