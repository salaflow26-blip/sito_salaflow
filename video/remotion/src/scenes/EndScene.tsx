import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Logo } from "../components/Logo";
import { C, FONT, GRAD, clamp } from "../theme";

// Closing card: no download link yet, the call to action is booking a visit.
export const EndScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number, damping = 16) => spring({ frame: frame - d, fps, config: { damping, stiffness: 120 } });
  const l = sp(4, 12), w = sp(12), p = sp(24), c = sp(34, 13), u = sp(44);
  const shine = interpolate(frame, [50, 90], [-120, 220], clamp);
  return (
    <AbsoluteFill>
      <Background hue="teal" />
      <AbsoluteFill style={{ alignItems: "center", fontFamily: FONT }}>
        <div style={{ marginTop: 470, scale: String(l), rotate: `${(1 - l) * -20}deg` }}>
          <Logo size={240} />
        </div>
        <div style={{ marginTop: 60, fontWeight: 800, fontSize: 170, letterSpacing: "-0.05em", color: C.ink, opacity: w, translate: `0px ${(1 - w) * 50}px` }}>
          Sala<span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Flow</span>
        </div>
        <div style={{ marginTop: 30, padding: "14px 34px", borderRadius: 999, border: "2px solid rgba(45,212,191,0.5)", color: C.teal, fontWeight: 800, fontSize: 36, letterSpacing: "0.14em", textTransform: "uppercase", opacity: p, scale: String(0.8 + 0.2 * p) }}>
          Presto disponibile
        </div>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            marginTop: 110,
            padding: "36px 80px",
            borderRadius: 999,
            backgroundImage: GRAD,
            color: "#042f2e",
            fontWeight: 800,
            fontSize: 64,
            letterSpacing: "-0.02em",
            boxShadow: "0 30px 80px -20px rgba(45,212,191,0.7)",
            opacity: c,
            scale: String(0.7 + 0.3 * c),
          }}
        >
          Prenota una visita
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `${shine}%`, width: "35%", background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent)" }} />
        </div>
        <div style={{ marginTop: 50, fontWeight: 800, fontSize: 56, color: C.ink, opacity: u }}>
          salaflow<span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>.com</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
