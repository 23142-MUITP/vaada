"use client";
import { useEffect, useState } from "react";

export default function WikiImage({
  name,
  size = 80,
  borderRadius = "12px",
}: {
  name: string;
  size?: number;
  borderRadius?: string;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImage() {
      try {
        const res = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`
        );
        const data = await res.json();
        if (data.thumbnail?.source) {
          setImgUrl(data.thumbnail.source);
        }
      } catch {
        // fall back to initials
      }
    }
    fetchImage();
  }, [name]);

  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  if (!imgUrl) {
    return (
      <div style={{
        width: size, height: size, borderRadius,
        background: "linear-gradient(135deg, #FF6B00, #e55a00)",
        color: "white", display: "flex", alignItems: "center",
        justifyContent: "center", fontWeight: 700,
        fontSize: size * 0.28, fontFamily: "Georgia, serif",
        flexShrink: 0,
      }}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={imgUrl}
      alt={name}
      style={{
        width: size, height: size, borderRadius,
        objectFit: "cover", flexShrink: 0,
      }}
    />
  );
}
