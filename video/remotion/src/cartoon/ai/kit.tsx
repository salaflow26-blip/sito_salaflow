import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GRAD } from "../../theme";
import { PH, PW } from "../Scenery";
import { BEAT } from "../style";
import vivi from "../vivi.json";

// Building blocks of the AI version: a camera over an image, the living stills (scripts/vivi.py),
// app screens mapped onto the phones of the pictures, light, sparkles.

export const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const IW = 1672, IH = 941; // ChatGPT images
export type Pt = readonly [number, number];
export type Quad = readonly [Pt, Pt, Pt, Pt]; // tl, tr, br, bl

// ---------- camera ----------
// A camera is the image point in the middle of the panel and a zoom (1 = the image height fills the panel).
export type Cam = readonly [number, number, number];
export type CamKey = { readonly at: number; readonly cam: Cam; readonly ease?: (t: number) => number }; // ease: of the move that ends here

const lerpCam = (a: Cam, b: Cam, t: number): Cam => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export const camAt = (frame: number, dur: number, keys: readonly CamKey[], ease = Easing.inOut(Easing.sin)): Cam => {
  if (keys.length === 1) return keys[0].cam;
  const ks = keys.map((k) => ({ ...k, at: k.at < 0 ? dur + k.at : k.at }));
  if (frame <= ks[0].at) return ks[0].cam;
  for (let i = 1; i < ks.length; i++) {
    if (frame <= ks[i].at) return lerpCam(ks[i - 1].cam, ks[i].cam, (ks[i].ease ?? ease)((frame - ks[i - 1].at) / Math.max(1, ks[i].at - ks[i - 1].at)));
  }
  return ks[ks.length - 1].cam;
};

const camTransform = (cam: Cam, w: number, h: number) => {
  const k = (PH / h) * cam[2];
  const tx = Math.min(0, Math.max(PW - w * k, PW / 2 - cam[0] * k));
  const ty = Math.min(0, Math.max(PH - h * k, PH / 2 - cam[1] * k));
  return { k, tx, ty };
};

// image point -> panel point, for overlays drawn over the whole panel
export const toPanel = (cam: Cam, p: Pt, w = IW, h = IH): Pt => {
  const { k, tx, ty } = camTransform(cam, w, h);
  return [tx + p[0] * k, ty + p[1] * k];
};

export const Stage: React.FC<{
  readonly keys: readonly CamKey[];
  readonly w?: number;
  readonly h?: number;
  readonly ease?: (t: number) => number;
  readonly shake?: number; // px of hand-held shake
  readonly weave?: boolean; // old projector gate weave
  readonly blurX?: boolean; // horizontal motion blur when the camera moves fast
  readonly children: React.ReactNode;
}> = ({ keys, w = IW, h = IH, ease, shake = 0, weave = false, blurX = false, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cam = camAt(frame, durationInFrames, keys, ease);
  const { k, tx, ty } = camTransform(cam, w, h);
  const f2 = Math.floor(frame / 2);
  const wx = (weave ? (random(`wx${f2}`) - 0.5) * 3 : 0) + (shake ? Math.sin(frame * 1.7) * shake + Math.sin(frame * 0.63) * shake * 0.5 : 0);
  const wy = (weave ? (random(`wy${f2}`) - 0.5) * 4 : 0) + (shake ? Math.cos(frame * 2.3) * shake * 0.6 : 0);
  const rot = shake ? Math.sin(frame * 0.9) * shake * 0.12 : 0;
  let blur = 0;
  if (blurX) {
    const prev = camTransform(camAt(frame - 1, durationInFrames, keys, ease), w, h);
    blur = Math.min(24, Math.abs(tx - prev.tx) * 0.45);
  }
  const id = `mb${frame}`;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {blur > 0.5 ? (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={id}>
            <feGaussianBlur stdDeviation={`${blur} 0`} />
          </filter>
        </svg>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: w,
          height: h,
          transformOrigin: "0 0",
          transform: `translate(${tx + wx}px, ${ty + wy}px) rotate(${rot}deg) scale(${k})`,
          filter: blur > 0.5 ? `url(#${id})` : undefined,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

// ---------- living stills ----------
type ViviData = Record<string, { frames: number; schermo?: number[][][]; lampada?: number[][][]; occhi?: number[][][] }>;
const V = vivi as unknown as ViviData;

// `at` is where the shot starts in the whole video: the clip is trimmed so its beats fall on the music's beats
export const clipFrame = (at: number, frame: number) => (at % BEAT) + frame;

export const Living: React.FC<{ readonly n: string; readonly at: number; readonly style?: React.CSSProperties }> = ({ n, at, style }) => (
  <Video src={staticFile(`clips/vivi/nuova-${n}.mp4`)} trimBefore={at % BEAT} muted style={{ position: "absolute", left: 0, top: 0, width: IW, height: 940, ...style }} />
);

export const tracked = (n: string, key: "schermo" | "lampada" | "occhi", at: number, frame: number): Pt[] => {
  const arr = V[n]?.[key];
  if (!arr) throw new Error(`no ${key} for ${n}`);
  const pts = arr[Math.min(arr.length - 1, clipFrame(at, frame))];
  return pts.map((p) => [p[0], p[1]] as const);
};

// ---------- a flat DOM layer mapped onto any four corners (CSS matrix3d) ----------
export const quadMatrix = (w: number, h: number, q: Quad) => {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0;
  const d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
  return `matrix3d(${a / w},${d / w},0,${g / w},${b / h},${e / h},0,${hh / h},0,0,1,0,${c},${f},0,1)`;
};

// SCREEN is the content size of a phone screen; the quads come from the images, the corners are rounded here
export const SCREEN = { w: 430, h: 846 };

export const PhoneScreen: React.FC<{ readonly quad: Quad; readonly radius?: number; readonly notch?: boolean; readonly children: React.ReactNode }> = ({ quad, radius = 34, notch = true, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transformOrigin: "0 0", transform: quadMatrix(SCREEN.w, SCREEN.h, quad), borderRadius: radius, overflow: "hidden", background: "#020617" }}>
    {children}
    {/* glass */}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.03) 38%, rgba(255,255,255,0) 39%, rgba(255,255,255,0.05) 100%)" }} />
    {notch ? <div style={{ position: "absolute", left: SCREEN.w * 0.25, top: -2, width: SCREEN.w * 0.5, height: 30, borderRadius: "0 0 22px 22px", background: "#05070a" }} /> : null}
  </div>
);

// ---------- what the phones show ----------
export type Step = { readonly at: number; readonly src?: string; readonly scroll?: readonly [number, number]; readonly splash?: boolean; readonly tap?: Pt };

// app screens one after the other, pushed in from the right like a real app; splash = SalaFlow logo
export const AppScreen: React.FC<{ readonly steps: readonly Step[]; readonly w?: number; readonly h?: number }> = ({ steps, w = SCREEN.w, h = SCREEN.h }) => {
  const frame = useCurrentFrame();
  let i = 0;
  steps.forEach((s, k) => {
    if (frame >= s.at) i = k;
  });
  const p = i === 0 ? 1 : interpolate(frame, [steps[i].at, steps[i].at + 11], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const page = (s: Step, k: number, x: number, dim: number) => {
    const next = steps[k + 1]?.at ?? s.at + 90;
    const sc = s.scroll ? interpolate(frame, [s.at + 8, next], [s.scroll[0], s.scroll[1]], { ...cl, easing: Easing.inOut(Easing.cubic) }) : 0;
    return (
      <div key={k} style={{ position: "absolute", inset: 0, transform: `translateX(${x}px)`, filter: dim ? `brightness(${1 - dim})` : undefined }}>
        {s.splash ? <Splash from={s.at} w={w} h={h} /> : <Img src={staticFile(s.src!)} style={{ position: "absolute", left: 0, top: -sc * (w / 860), width: w }} />}
        {s.tap ? <Tap at={s.at + 14} x={s.tap[0] * (w / 860)} y={s.tap[1] * (w / 860) - sc * (w / 860)} /> : null}
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ background: "#020617", overflow: "hidden" }}>
      {i > 0 && p < 1 ? page(steps[i - 1], i - 1, -w * 0.3 * p, 0.5 * p) : null}
      <div style={{ position: "absolute", inset: 0, boxShadow: i > 0 && p < 1 ? "-20px 0 40px rgba(0,0,0,0.6)" : undefined, transform: `translateX(${(1 - p) * w}px)` }}>{page(steps[i], i, 0, 0)}</div>
    </AbsoluteFill>
  );
};

const Tap: React.FC<{ readonly at: number; readonly x: number; readonly y: number }> = ({ at, x, y }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 16) return null;
  const r = interpolate(t, [0, 16], [8, 60]);
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: "rgba(45,212,191,0.35)", border: "3px solid rgba(255,255,255,0.8)", opacity: interpolate(t, [0, 4, 16], [0, 1, 0]) }} />;
};

export const Splash: React.FC<{ readonly from: number; readonly w: number; readonly h: number }> = ({ from, w, h }) => {
  const frame = useCurrentFrame() - from;
  const s = interpolate(frame, [0, 10], [0.5, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
  const glow = 0.55 + 0.25 * Math.sin(frame / 6);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, #0f3b3a 0%, #071423 55%, #020617 100%)", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: w / 2 - w * 0.45, top: h * 0.42 - w * 0.45, width: w * 0.9, height: w * 0.9, borderRadius: "50%", background: "radial-gradient(circle, rgba(45,212,191,0.55), rgba(45,212,191,0) 65%)", opacity: glow }} />
      <div style={{ width: w * 0.36, height: w * 0.36, borderRadius: w * 0.08, overflow: "hidden", transform: `scale(${s})`, boxShadow: "0 20px 50px -10px rgba(45,212,191,0.7)", marginTop: -h * 0.08 }}>
        <Img src={staticFile("logo.png")} style={{ width: "100%", height: "100%", scale: "1.03" }} />
      </div>
      <div style={{ marginTop: w * 0.07, fontWeight: 800, fontSize: w * 0.13, letterSpacing: "-0.04em", color: "#fff", opacity: interpolate(frame, [4, 12], [0, 1], cl), transform: `translateY(${interpolate(frame, [4, 12], [14, 0], cl)}px)` }}>
        Sala<span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Flow</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- light ----------
export const Glow: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly color?: string; readonly strength?: number; readonly flicker?: number; readonly seed?: string }> = ({ x, y, r, color = "255,214,150", strength = 0.5, flicker = 0.12, seed = "g" }) => {
  const frame = useCurrentFrame();
  const f = 1 - flicker + flicker * (0.6 * Math.sin(frame / 3.1 + x) + 0.4 * random(`${seed}${Math.floor(frame / 2)}`));
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle, rgba(${color},${strength * f}) 0%, rgba(${color},${strength * f * 0.35}) 35%, rgba(${color},0) 70%)`, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

// floating out-of-focus lights in front of the scene (panel units)
export const Bokeh: React.FC<{ readonly seed: string; readonly n?: number; readonly color?: string; readonly opacity?: number }> = ({ seed, n = 14, color = "255,200,120", opacity = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity }}>
      {Array.from({ length: n }).map((_, i) => {
        const r = 14 + random(`${seed}r${i}`) * 46;
        const x = random(`${seed}x${i}`) * PW + Math.sin(frame / 50 + i) * 18;
        const y = random(`${seed}y${i}`) * PH - frame * (0.15 + random(`${seed}v${i}`) * 0.35);
        const a = 0.1 + 0.16 * (0.5 + 0.5 * Math.sin(frame / (9 + i) + i * 2));
        return <div key={i} style={{ position: "absolute", left: x - r, top: ((y % (PH + 120)) + PH + 120) % (PH + 120) - 60 - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle, rgba(${color},${a}) 0%, rgba(${color},${a * 0.8}) 55%, rgba(${color},0) 72%)` }} />;
      })}
    </AbsoluteFill>
  );
};

// four-point twinkles
export const Sparkles: React.FC<{ readonly seed: string; readonly box: readonly [number, number, number, number]; readonly n?: number; readonly from?: number; readonly every?: number; readonly size?: number; readonly color?: string }> = ({ seed, box, n = 10, from = 0, every = 7, size = 26, color = "#fff6d8" }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const t0 = from + i * every + random(`${seed}t${i}`) * every;
        const t = (frame - t0) / 18;
        if (t < 0 || t > 1) return null;
        const x = box[0] + random(`${seed}x${i}`) * (box[2] - box[0]);
        const y = box[1] + random(`${seed}y${i}`) * (box[3] - box[1]);
        const s = Math.sin(t * Math.PI) * size * (0.6 + random(`${seed}s${i}`) * 0.8);
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${t * 90})`} style={{ filter: "drop-shadow(0 0 6px rgba(255,236,170,0.9))" }}>
            <path d={`M 0 ${-s} Q ${s * 0.12} ${-s * 0.12} ${s} 0 Q ${s * 0.12} ${s * 0.12} 0 ${s} Q ${-s * 0.12} ${s * 0.12} ${-s} 0 Q ${-s * 0.12} ${-s * 0.12} 0 ${-s} Z`} fill={color} />
          </g>
        );
      })}
    </svg>
  );
};

// soft shafts of light (image units)
export const Beams: React.FC<{ readonly x: number; readonly y: number; readonly angle: number; readonly len: number; readonly spread?: number; readonly opacity?: number }> = ({ x, y, angle, len, spread = 260, opacity = 0.35 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `rotate(${angle}deg)`, mixBlendMode: "screen", pointerEvents: "none" }}>
      {[0, 1, 2, 3].map((i) => {
        const a = opacity * (0.55 + 0.45 * Math.sin(frame / (14 + i * 3) + i * 1.7));
        const w = spread * (0.25 + 0.15 * i);
        return <div key={i} style={{ position: "absolute", left: -w / 2 + (i - 1.5) * spread * 0.32, top: 0, width: w, height: len, background: `linear-gradient(rgba(255,244,214,${a}), rgba(255,244,214,0))`, filter: "blur(18px)", transform: `skewX(${(i - 1.5) * 6}deg)` }} />;
      })}
    </div>
  );
};

// dust in the light (image units)
export const Dust: React.FC<{ readonly seed: string; readonly box: readonly [number, number, number, number]; readonly n?: number }> = ({ seed, box, n = 40 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "screen" }}>
      {Array.from({ length: n }).map((_, i) => {
        const x = box[0] + random(`${seed}x${i}`) * (box[2] - box[0]) + Math.sin(frame / 20 + i) * 12;
        const y = box[1] + ((random(`${seed}y${i}`) * (box[3] - box[1]) + frame * (0.3 + random(`${seed}v${i}`))) % (box[3] - box[1]));
        const r = 1.5 + random(`${seed}r${i}`) * 3;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: "50%", background: "rgba(255,248,230,0.8)", opacity: 0.35 + 0.4 * Math.sin(frame / 7 + i) }} />;
      })}
    </div>
  );
};

// steam from a cup (image units)
export const Steam: React.FC<{ readonly x: number; readonly y: number; readonly scale?: number }> = ({ x, y, scale = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={200} height={260} viewBox="-100 -260 200 260" style={{ position: "absolute", left: x - 100 * scale, top: y - 260 * scale, width: 200 * scale, height: 260 * scale, overflow: "visible", pointerEvents: "none" }}>
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 14) % 42) / 42;
        const d = `M ${(i - 1) * 14} 0 C ${(i - 1) * 14 + 26 * Math.sin(frame / 8 + i)} -60, ${(i - 1) * 14 - 26 * Math.sin(frame / 9 + i)} -120, ${(i - 1) * 14 + 18 * Math.sin(frame / 7 + i)} -190`;
        return <path key={i} d={d} stroke="#f4ede0" strokeWidth={9 - t * 4} strokeLinecap="round" fill="none" opacity={Math.sin(t * Math.PI) * 0.7} strokeDasharray="60 400" strokeDashoffset={-t * 200} />;
      })}
    </svg>
  );
};

// drops of sweat flying off a forehead (image units)
export const Sweat: React.FC<{ readonly x: number; readonly y: number; readonly every?: number }> = ({ x, y, every = 15 }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={IW} height={IH} viewBox={`0 0 ${IW} ${IH}`} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {[0, 1, 2, 3].map((i) => {
        const t = ((frame + i * (every / 2)) % every) / every;
        const side = i % 2 ? 1 : -1;
        const px = x + side * (30 + t * 90), py = y - 40 * Math.sin(t * Math.PI) + t * 70;
        return (
          <g key={i} transform={`translate(${px} ${py}) rotate(${side * (30 + t * 60)})`} opacity={1 - t}>
            <path d="M 0 -16 Q 11 2 0 9 Q -11 2 0 -16 Z" fill="#f1ebe0" stroke="#111" strokeWidth={3.5} />
          </g>
        );
      })}
    </svg>
  );
};
