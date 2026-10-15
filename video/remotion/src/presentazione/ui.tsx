import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GRAD } from "../theme";

// Pieces of the cinematic presentation (1920×1080): stock footage in the background, big keynote titles,
// frosted-glass interface elements, a finger that taps.

export const W = 1920, H = 1080;
export const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const io = Easing.inOut(Easing.cubic);
export const TEAL = "#5eead4";

// ---------- background footage (Mixkit, free licence), darkened so text reads ----------
export const Footage: React.FC<{ readonly src: string; readonly dim?: number; readonly from?: number; readonly zoom?: readonly [number, number]; readonly tint?: string }> = ({ src, dim = 0.45, from = 0, zoom = [1.06, 1], tint }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const z = interpolate(frame, [0, durationInFrames], zoom);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        <Video src={staticFile(`presentazione/${src}`)} trimBefore={Math.round(from * fps)} muted loop objectFit="cover" style={{ width: W, height: H }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} />
      {tint ? <AbsoluteFill style={{ background: tint, mixBlendMode: "soft-light" }} /> : null}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------- keynote titles: every word comes into focus ----------
// *word* gets the brand gradient
export const Words: React.FC<{ readonly text: string; readonly at: number; readonly out?: number; readonly size?: number; readonly stagger?: number; readonly weight?: number; readonly color?: string; readonly align?: "left" | "center"; readonly style?: React.CSSProperties }> = ({ text, at, out, size = 150, stagger = 3, weight = 800, color = "#fff", align = "center", style }) => {
  const frame = useCurrentFrame();
  const lines = text.split("\n");
  let k = 0, on = false;
  const leave = out === undefined ? 0 : interpolate(frame, [out, out + 10], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
  return (
    <div style={{ fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight: 1.02, letterSpacing: "-0.045em", color, textAlign: align, opacity: 1 - leave, filter: leave ? `blur(${leave * 14}px)` : undefined, transform: `scale(${1 + leave * 0.04})`, ...style }}>
      {lines.map((line, li) => (
        <div key={li}>
          {line.split(" ").map((w, wi) => {
            const t = interpolate(frame, [at + k * stagger, at + k * stagger + 14], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
            k++;
            // a highlight can span several words: *from here … to here*
            if (w.startsWith("*")) on = true;
            const hi = on;
            if (w.replace(/[.,!?;:]+$/, "").endsWith("*") || /\*[.,!?;:]*$/.test(w)) on = false;
            const word = w.replace(/\*/g, "");
            return (
              <span key={wi} style={{ display: "inline-block", marginRight: "0.24em", opacity: t, filter: `blur(${(1 - t) * 16}px)`, transform: `translateY(${(1 - t) * 0.25 * size}px)`, ...(hi ? { backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", paddingBottom: "0.08em" } : {}) }}>
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ---------- frosted glass ----------
export const glass = (radius = 28): React.CSSProperties => ({
  borderRadius: radius,
  background: "linear-gradient(160deg, rgba(255,255,255,0.20), rgba(255,255,255,0.07))",
  backdropFilter: "blur(26px) saturate(160%)",
  WebkitBackdropFilter: "blur(26px) saturate(160%)",
  border: "1.5px solid rgba(255,255,255,0.28)",
  boxShadow: "0 30px 80px -20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
});

// ---------- icons ----------
export const Icon: React.FC<{ readonly name: "phone" | "chat" | "note" | "table" | "chef" | "receipt" | "chart" | "play" | "check" | "bell"; readonly size?: number; readonly color?: string }> = ({ name, size = 40, color = "#fff" }) => {
  const p = { stroke: color, strokeWidth: 2, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      {name === "phone" ? <path {...p} d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /> : null}
      {name === "chat" ? <path {...p} d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /> : null}
      {name === "note" ? <path {...p} d="M5 3h10l4 4v14H5zM15 3v4h4M8 12h8M8 16h5" /> : null}
      {name === "table" ? <path {...p} d="M6 3v6a2 2 0 0 0 4 0V3M8 11v10M17 3c-2.6 2.2-2.6 7.4 0 9.2V21" /> : null}
      {name === "chef" ? <path {...p} d="M7 14a4 4 0 0 1 .8-7.9A4.6 4.6 0 0 1 16.2 6 4 4 0 0 1 17 14v6H7zM7 17h10" /> : null}
      {name === "receipt" ? <path {...p} d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3" /> : null}
      {name === "chart" ? <path {...p} d="M4 20V10M10 20V4M16 20v-7M22 20H2" /> : null}
      {name === "play" ? <path d="M7 4l13 8-13 8z" fill={color} /> : null}
      {name === "check" ? <path {...p} d="M4 12l5 5L20 6" /> : null}
      {name === "bell" ? <path {...p} d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4" /> : null}
    </svg>
  );
};

// ---------- a notification ----------
export type Note = { readonly icon: "phone" | "chat" | "note"; readonly app: string; readonly title: string; readonly text: string; readonly x: number; readonly y: number; readonly rot: number; readonly at: number; readonly tint: string };
export const Notification: React.FC<{ readonly n: Note; readonly leave: number; readonly dimAfter?: number }> = ({ n, leave, dimAfter = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - n.at, fps, config: { damping: 13, stiffness: 140 } });
  if (frame < n.at) return null;
  const age = Math.max(0, frame - n.at);
  const dim = Math.min(0.45, age * dimAfter);
  const fly = leave;
  return (
    <div
      style={{
        position: "absolute",
        left: n.x,
        top: n.y,
        width: 640,
        padding: "26px 30px",
        display: "flex",
        gap: 24,
        alignItems: "center",
        ...glass(30),
        fontFamily: FONT,
        color: "#fff",
        opacity: Math.min(1, s * 1.3) * (1 - fly),
        transform: `translate(${fly * (n.x - 700) * 0.6}px, ${(1 - s) * 40 + fly * (n.y - 400) * 0.6}px) rotate(${n.rot}deg) scale(${(0.85 + 0.15 * s) * (1 - 0.3 * fly)})`,
        filter: `brightness(${1 - dim}) blur(${fly * 12}px)`,
      }}
    >
      <div style={{ width: 76, height: 76, flex: "none", borderRadius: 20, background: n.tint, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={n.icon} size={42} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.02em" }}>
          <span>{n.app.toUpperCase()}</span>
          <span>ora</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em" }}>{n.title}</div>
        <div style={{ marginTop: 2, fontSize: 30, fontWeight: 500, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.text}</div>
      </div>
    </div>
  );
};

// ---------- a finger on the glass ----------
export type TouchKey = { readonly at: number; readonly x: number; readonly y: number };
export const Touch: React.FC<{ readonly keys: readonly TouchKey[]; readonly press: readonly number[]; readonly from: number; readonly to: number }> = ({ keys, press, from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  let x = keys[0].x, y = keys[0].y;
  for (let i = 1; i < keys.length; i++) {
    if (frame >= keys[i - 1].at) {
      const t = io(Math.min(1, Math.max(0, (frame - keys[i - 1].at) / Math.max(1, keys[i].at - keys[i - 1].at))));
      x = keys[i - 1].x + (keys[i].x - keys[i - 1].x) * t;
      y = keys[i - 1].y + (keys[i].y - keys[i - 1].y) * t;
    }
  }
  const op = interpolate(frame, [from, from + 6, to - 6, to], [0, 1, 1, 0], cl);
  const p = press.map((t) => frame - t).find((d) => d >= -3 && d < 18);
  const down = p !== undefined && p < 4 ? 0.78 : 1;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {p !== undefined && p >= 0 ? <div style={{ position: "absolute", left: x - 28 - p * 5, top: y - 28 - p * 5, width: 56 + p * 10, height: 56 + p * 10, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.85)", opacity: 1 - p / 18 }} /> : null}
      <div style={{ position: "absolute", left: x - 32, top: y - 32, width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.35)", border: "3px solid rgba(255,255,255,0.9)", boxShadow: "0 8px 30px rgba(0,0,0,0.45)", opacity: op, transform: `scale(${down})` }} />
    </AbsoluteFill>
  );
};

// ---------- the glass "next" pill with the progress filling it ----------
export const NextPill: React.FC<{ readonly label: string; readonly start: number; readonly end: number; readonly x?: number; readonly y?: number }> = ({ label, start, end, x = W - 120, y = H - 150 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - start, fps, config: { damping: 14 } });
  if (frame < start) return null;
  const fill = interpolate(frame, [start + 4, end - 3], [0, 100], cl);
  const press = frame >= end - 3 ? 0.95 : 1;
  return (
    <div style={{ position: "absolute", right: W - x, top: y, height: 96, borderRadius: 48, overflow: "hidden", ...glass(48), opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 30}px) scale(${press})`, transformOrigin: "100% 50%", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${fill}%`, background: "rgba(255,255,255,0.9)" }} />
      <div style={{ position: "relative", padding: "0 46px", height: 96, display: "flex", alignItems: "center", gap: 16, fontWeight: 700, fontSize: 36, color: "#fff", mixBlendMode: "difference" }}>
        <Icon name="play" size={26} />
        {label}
      </div>
    </div>
  );
};

// ---------- a piece of a real screen in a glass frame ----------
export const Chip: React.FC<{ readonly src: string; readonly crop: readonly [number, number, number, number]; readonly imgW?: number; readonly w: number; readonly style?: React.CSSProperties }> = ({ src, crop, imgW = 860, w, style }) => {
  const [x0, y0, x1, y1] = crop;
  const s = w / (x1 - x0);
  return (
    <div style={{ position: "absolute", width: w + 20, padding: 10, ...glass(26), ...style }}>
      <div style={{ position: "relative", width: w, height: (y1 - y0) * s, borderRadius: 18, overflow: "hidden", background: "#050b17" }}>
        <Img src={staticFile(src)} style={{ position: "absolute", left: -x0 * s, top: -y0 * s, width: imgW * s }} />
      </div>
    </div>
  );
};

// slow light drifting over everything (subtle)
export const Flare: React.FC<{ readonly seed: string; readonly color?: string; readonly opacity?: number }> = ({ seed, color = "94,234,212", opacity = 0.35 }) => {
  const frame = useCurrentFrame();
  const x = random(`${seed}x`) * W + Math.sin(frame / 60) * 200;
  const y = random(`${seed}y`) * H * 0.6 + Math.cos(frame / 70) * 80;
  return <div style={{ position: "absolute", left: x - 600, top: y - 600, width: 1200, height: 1200, borderRadius: "50%", background: `radial-gradient(circle, rgba(${color},${opacity}), rgba(${color},0) 65%)`, mixBlendMode: "screen", pointerEvents: "none" }} />;
};
