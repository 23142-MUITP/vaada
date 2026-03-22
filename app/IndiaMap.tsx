"use client";
import India from "@svg-maps/india";
 
export default function IndiaMap() {
  const locations = India.locations;
  return (
    <>
      <style>{`
        @keyframes pulse-india { 
          0%,100%{opacity:0.4; filter: drop-shadow(0 0 4px rgba(255,107,0,0.3));} 
          50%{opacity:0.9; filter: drop-shadow(0 0 14px rgba(255,107,0,0.65));} 
        }
        .india-state { 
          fill: rgba(255,107,0,0.07); 
          stroke: #FF6B00; 
          stroke-width: 0.8;
          animation: pulse-india 5s ease-in-out infinite;
          transition: fill 0.3s;
        }
        .india-state:hover { fill: rgba(255,107,0,0.28); cursor: pointer; }
      `}</style>
      <svg viewBox={India.viewBox} style={{ width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
        {locations.map((location: { id: string; name: string; path: string }, i: number) => (
          <path key={location.id} id={location.id} d={location.path} className="india-state" style={{ animationDelay: `${i * 0.15}s` }}>
            <title>{location.name}</title>
          </path>
        ))}
      </svg>
    </>
  );
}
 