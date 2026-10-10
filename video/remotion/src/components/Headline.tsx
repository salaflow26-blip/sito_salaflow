import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, GRAD } from "../theme";

// "La serata, *dal vivo*." -> words rise in one after another; *starred* words get the brand gradient.
// A "|" forces a line break.
export const Headline: React.FC<{
  readonly text: string;
  readonly delay?: number;
  readonly size?: number;
  readonly stagger?: number;
  readonly align?: "center" | "left";
  readonly color?: string;
}> = ({ text, delay = 0, size = 96, stagger = 3, align = "center", color = C.ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = text.split("|").map((l) => l.trim());
  let i = 0;
  return (
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.06, letterSpacing: "-0.035em", color, textAlign: align }}>
      {lines.map((line, li) => {
        let grad = false;
        return (
          <div key={li}>
            {line.split(" ").map((raw, wi) => {
              const starts = raw.startsWith("*");
              if (starts) grad = true;
              const word = raw.replace(/\*/g, "");
              const g = grad;
              if (raw.replace(/[.,!?]+$/, "").endsWith("*")) grad = false;
              const s = spring({ frame: frame - delay - i++ * stagger, fps, config: { damping: 16, stiffness: 140, mass: 0.7 } });
              return (
                <span
                  key={wi}
                  style={{
                    display: "inline-block",
                    marginRight: "0.24em",
                    opacity: Math.min(1, s * 1.4),
                    translate: `0px ${(1 - s) * 60}px`,
                    filter: `blur(${(1 - Math.min(1, s)) * 14}px)`,
                    ...(g ? { backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", paddingBottom: "0.08em" } : {}),
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export const Kicker: React.FC<{ readonly label: string; readonly index?: string; readonly delay?: number }> = ({ label, index, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 26px",
        borderRadius: 999,
        border: "2px solid rgba(45,212,191,0.45)",
        background: "rgba(45,212,191,0.10)",
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 30,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: C.teal,
        opacity: s,
        scale: String(0.8 + 0.2 * s),
      }}
    >
      {index ? <span style={{ color: C.ink, opacity: 0.55 }}>{index}</span> : null}
      {label}
    </div>
  );
};
