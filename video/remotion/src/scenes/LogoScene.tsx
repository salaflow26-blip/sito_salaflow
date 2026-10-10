import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Headline } from "../components/Headline";
import { Logo } from "../components/Logo";
import { C, FONT, GRAD, clamp } from "../theme";

// The answer: SalaFlow. Logo pops with a ring of light, wordmark, then the promise.
export const LogoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 6, fps, config: { damping: 11, stiffness: 120, mass: 0.8 } });
  const word = spring({ frame: frame - 18, fps, config: { damping: 18 } });
  const ring = interpolate(frame, [6, 40], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Background hue="teal" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "absolute", top: 560, left: "50%", width: 300, height: 300, marginLeft: -150, borderRadius: "50%", border: `6px solid ${C.teal}`, opacity: (1 - ring) * 0.8, scale: String(1 + ring * 2.4) }} />
        <div style={{ position: "absolute", top: 560, left: "50%", marginLeft: -150, scale: String(pop), rotate: `${(1 - pop) * -25}deg` }}>
          <Logo size={300} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 930,
            width: "100%",
            textAlign: "center",
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 190,
            letterSpacing: "-0.05em",
            color: C.ink,
            opacity: word,
            translate: `0px ${(1 - word) * 60}px`,
            filter: `blur(${(1 - word) * 12}px)`,
          }}
        >
          Sala<span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Flow</span>
        </div>
        <div style={{ position: "absolute", top: 1200, width: 900, left: 90 }}>
          <Headline text="Tutto il locale, | *in un'app*." delay={40} size={82} stagger={4} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
