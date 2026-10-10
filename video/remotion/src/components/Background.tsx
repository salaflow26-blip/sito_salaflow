import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";

// Dark stage with two slow brand-coloured glows and a faint grid.
export const Background: React.FC<{ readonly hue?: "teal" | "mix" }> = ({ hue = "mix" }) => {
  const frame = useCurrentFrame();
  const a = frame / 60;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1300,
          height: 1300,
          left: -520 + Math.sin(a) * 60,
          top: -560 + Math.cos(a * 0.8) * 50,
          background: "radial-gradient(closest-side, rgba(14,116,144,0.75), rgba(14,116,144,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          right: -640 + Math.cos(a * 0.9) * 60,
          bottom: -620 + Math.sin(a * 0.7) * 60,
          background:
            hue === "teal"
              ? "radial-gradient(closest-side, rgba(13,148,136,0.6), rgba(13,148,136,0) 70%)"
              : "radial-gradient(closest-side, rgba(4,120,87,0.65), rgba(4,120,87,0) 70%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: interpolate(frame, [0, 20], [0, 0.07], { extrapolateRight: "clamp" }),
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          backgroundPosition: `0px ${-frame * 0.6}px`,
          maskImage: "radial-gradient(ellipse at 50% 40%, black 20%, transparent 75%)",
        }}
      />
    </AbsoluteFill>
  );
};
