import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Headline } from "../components/Headline";
import { C, clamp } from "../theme";

const COLS = [
  ["serata", "comanda", "andamento", "turni", "cassa", "utile"],
  ["mappa", "fatture", "servizio", "magazzino", "piatti", "checklist"],
  ["hub", "cameriere", "spesa", "personale", "mansioni", "asporto"],
];

// A tilted wall of every screen, drifting, with the closing line on top.
export const WallScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ perspective: 2200 }}>
        <div style={{ position: "absolute", left: -380, top: -700, width: 1840, height: 3300, rotate: "x 38deg", transformStyle: "preserve-3d" }}>
          <div style={{ position: "absolute", inset: 0, rotate: "-20deg", display: "flex", gap: 40, justifyContent: "center" }}>
            {COLS.map((col, ci) => (
              <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 40, translate: `0px ${(ci % 2 ? -1 : 1) * (frame * 4) - (ci % 2 ? 0 : 500)}px` }}>
                {[...col, ...col].map((s, i) => (
                  <Img key={i} src={staticFile(`shots/${s}.jpg`)} style={{ width: 420, height: 840, objectFit: "cover", objectPosition: "top", borderRadius: 40, boxShadow: "0 0 0 2px rgba(148,163,184,0.25), 0 30px 60px -20px rgba(0,0,0,0.8)" }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(2,6,23,0.92) 25%, rgba(2,6,23,0.55) 60%, rgba(2,6,23,0.2) 100%)", opacity: interpolate(frame, [0, 12], [0, 1], clamp) }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: 980 }}>
          <Headline text="Tutto collegato. | *In un'app.*" delay={6} size={120} stagger={4} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
