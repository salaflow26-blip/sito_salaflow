import { StrikeThrough } from "@remotion/rough-notation";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HAND, FONT, clamp } from "../theme";

const INK = "#1e293b";
const NOTES: { t: string; x: number; y: number; r: number; s: number; d: number; strike?: boolean }[] = [
  { t: "Rossi x4 — 20:30", x: 170, y: 150, r: -4, s: 64, d: 0 },
  { t: "T7 celiaco!!", x: 600, y: 250, r: 5, s: 70, d: 3 },
  { t: "Bianchi 6 pers. ore 21?", x: 190, y: 1440, r: 3, s: 60, d: 6, strike: true },
  { t: "richiamare Marco", x: 560, y: 1560, r: -6, s: 62, d: 9 },
  { t: "tav 12 → 14", x: 230, y: 1700, r: -2, s: 58, d: 12 },
];

// Paper notebook: "Il tuo locale gira ancora su un quaderno?" — then the word gets struck through.
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const line = (d: number) => spring({ frame: frame - d, fps, config: { damping: 15, stiffness: 150, mass: 0.6 } });
  const l1 = line(2), l2 = line(17), l3 = line(33);
  const out = interpolate(frame, [durationInFrames - 14, durationInFrames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#efe8da", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          scale: String(1.04 + frame * 0.0006 + out * 0.08),
          rotate: `${-1.2 + frame * 0.008}deg`,
          filter: `blur(${out * 10}px)`,
          backgroundColor: "#f6f1e6",
          backgroundImage: "linear-gradient(rgba(59,130,246,0.22) 2px, transparent 2px)",
          backgroundSize: "100% 72px",
          backgroundPosition: "0 40px",
        }}
      >
        <div style={{ position: "absolute", left: 130, top: 0, bottom: 0, width: 3, background: "rgba(239,68,68,0.45)" }} />
        {NOTES.map((n, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: n.x,
              top: n.y,
              rotate: `${n.r}deg`,
              fontFamily: HAND,
              fontSize: n.s,
              color: "rgba(30,58,138,0.55)",
              opacity: interpolate(frame, [n.d, n.d + 10], [0, 1], clamp),
              textDecoration: n.strike ? "line-through" : undefined,
              whiteSpace: "nowrap",
            }}
          >
            {n.t}
          </div>
        ))}
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, fontWeight: 800, color: INK, letterSpacing: "-0.04em", textAlign: "center" }}>
          <div style={{ fontSize: 112, lineHeight: 1.05, opacity: l1, translate: `0px ${(1 - l1) * 50}px` }}>Il tuo locale</div>
          <div style={{ fontSize: 112, lineHeight: 1.05, opacity: l2, translate: `0px ${(1 - l2) * 50}px` }}>gira ancora su un</div>
          <div style={{ marginTop: 10, opacity: l3, scale: String(0.7 + 0.3 * l3), rotate: `${-3 * l3}deg` }}>
            <StrikeThrough
              color="#dc2626"
              strokeWidth={14}
              iterations={2}
              progress={interpolate(frame, [64, 82], [0, 1], clamp)}
              style={{ fontFamily: HAND, fontWeight: 400, fontSize: 230, color: "#1d4ed8", letterSpacing: 0 }}
            >
              quaderno?
            </StrikeThrough>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
