import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "../theme";
import { Caption, EndCard, PANEL_Y, timeline, Title } from "./Cartoon";
import { Question, Smartphone } from "./Props";
import { C25, C26 } from "./Scenes";
import { OldFilm, PH, PW } from "./Scenery";
import type { Line } from "./script";

// Same story, title, subtitles and music as the drawn cartoon, but the panel shows the clips the team generated
// with Kling (public/clips). Scenes without a clip are rebuilt from the clips: stills, overlays drawn here.
// The "today" part (24-29) has no colour clip yet: the world turns into SalaFlow colours instead.

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const CW = 1916, CH = 1080; // Kling clips

type Cut = {
  readonly clip?: string; // scena-XX
  readonly still?: string; // clips/stills/…
  readonly from?: number; // seconds into the clip
  readonly rate?: number;
  readonly focus?: readonly [number, number]; // 0..1 where the crop sits
  readonly zoom?: readonly [number, number]; // start → end
  readonly blur?: number;
  readonly tint?: boolean; // SalaFlow-coloured world
};

// fills the 1080×830 panel with a 16:9 clip or still: cover, with a focus point and a slow zoom
const Frame: React.FC<Cut> = ({ clip, still, from = 0, rate = 1, focus = [0.5, 0.5], zoom = [1, 1.04], blur = 0, tint = false }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const z = interpolate(frame, [0, durationInFrames], zoom, cl);
  const h = PH * z, w = (CW / CH) * h;
  const style: React.CSSProperties = { position: "absolute", left: (PW - w) * focus[0], top: (PH - h) * focus[1], width: w, height: h, filter: `${tint ? "url(#brandmap) " : ""}${blur ? `blur(${blur}px) brightness(0.75)` : ""}` || undefined };
  return (
    <AbsoluteFill>
      {clip ? (
        <Video src={staticFile(`clips/${clip}.mp4`)} trimBefore={Math.round(from * fps)} playbackRate={rate} muted objectFit="fill" style={style} />
      ) : (
        <Img src={staticFile(`clips/stills/${still}.jpg`)} style={style} />
      )}
    </AbsoluteFill>
  );
};

// gradient map for the SalaFlow world: ink → deep navy, mid-tones → teal, light → warm cream
const BrandMap: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id="brandmap" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
      <feComponentTransfer>
        <feFuncR type="table" tableValues="0.04 0.06 0.08 0.55 1" />
        <feFuncG type="table" tableValues="0.09 0.25 0.72 0.88 0.96" />
        <feFuncB type="table" tableValues="0.16 0.33 0.65 0.78 0.87" />
      </feComponentTransfer>
    </filter>
  </svg>
);

// handwriting that writes itself, with an optional strike-through
const Hand: React.FC<{ readonly text: string; readonly at: number; readonly x: number; readonly y: number; readonly size?: number; readonly strike?: number; readonly rot?: number }> = ({ text, at, x, y, size = 70, strike, rot = -4 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 20], [0, 100], cl);
  const s = strike === undefined ? 0 : interpolate(frame, [strike, strike + 7], [0, 100], cl);
  return (
    <div style={{ position: "absolute", left: x, top: y, rotate: `${rot}deg`, fontFamily: "Caveat, cursive", fontSize: size, color: "#1c1f2e", whiteSpace: "nowrap", clipPath: `inset(-20% ${100 - p}% -20% -5%)` }}>
      {text}
      {s > 0 ? <div style={{ position: "absolute", left: -6, top: "52%", width: `${s * 1.05}%`, height: 7, background: "#1c1f2e", borderRadius: 4, rotate: "-2deg" }} /> : null}
    </div>
  );
};

const Paper: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly rot?: number }> = ({ x, y, w, h, rot = -4 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, rotate: `${rot}deg`, background: "#ece4d3", borderRadius: 10, boxShadow: "0 0 30px 12px #ece4d3", backgroundImage: "repeating-linear-gradient(#ece4d3 0 54px, #c9bfa9 54px 57px)" }} />
);

const QuestionMarks: React.FC<{ readonly items: readonly { x: number; y: number; at: number; s: number; label?: string }[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`} style={{ position: "absolute", inset: 0 }}>
      {items.map((q, i) => {
        const k = interpolate(frame, [q.at, q.at + 8], [0, 1], cl);
        return k > 0 ? (
          <g key={i} transform={`translate(${q.x} ${q.y}) scale(${k}) translate(${-q.x} ${-q.y})`}>
            <g filter="url(#qglow)">
              <Question x={q.x} y={q.y} scale={q.s} label={q.label} offset={i * 5} />
            </g>
          </g>
        ) : null;
      })}
      <defs>
        <filter id="qglow">
          <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d" />
          <feFlood floodColor="#f2ecdf" />
          <feComposite in2="d" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
};

const Poster: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = interpolate(frame, [0, durationInFrames], [1, 1.1], cl);
  return (
    <div style={{ position: "absolute", left: PW / 2 - 250, top: 40, width: 500, height: 750, scale: String(s), rotate: "-1.5deg", background: "#ebe3d0", border: "10px solid #1a1a1a", boxShadow: "0 30px 60px rgba(0,0,0,0.6), inset 0 0 0 6px #ebe3d0, inset 0 0 0 10px #1a1a1a", fontFamily: FONT, textAlign: "center" }}>
      <div style={{ marginTop: 34, fontWeight: 800, fontSize: 54, letterSpacing: "0.04em", color: "#1a1a1a", lineHeight: 1 }}>È SEMPRE</div>
      <div style={{ marginTop: 6, fontWeight: 800, fontSize: 60, letterSpacing: "0.04em", color: "#c81e1e", lineHeight: 1 }}>STATO COSÌ!</div>
      <div style={{ margin: "26px auto 0", width: 400, height: 430, overflow: "hidden", borderRadius: 8, border: "4px solid #1a1a1a", position: "relative" }}>
        <Img src={staticFile("clips/stills/nb10a.jpg")} style={{ position: "absolute", width: 1040, left: -110, top: -120 }} />
      </div>
      <div style={{ marginTop: 26, fontWeight: 800, fontSize: 26, letterSpacing: "0.18em", color: "#1a1a1a" }}>IL QUADERNO NON SBAGLIA</div>
    </div>
  );
};

const Spiral: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.38 }}>
      <g transform={`translate(${PW / 2} ${PH * 0.4}) rotate(${frame * 9})`}>
        {Array.from({ length: 16 }).map((_, i) => (
          <path key={i} d={`M 0 0 L ${Math.cos((i / 16) * Math.PI * 2) * 900} ${Math.sin((i / 16) * Math.PI * 2) * 900} L ${Math.cos(((i + 0.5) / 16) * Math.PI * 2) * 900} ${Math.sin(((i + 0.5) / 16) * Math.PI * 2) * 900} Z`} fill={i % 2 ? "#111" : "none"} />
        ))}
      </g>
    </svg>
  );
};

const Shake: React.FC<{ readonly children: React.ReactNode; readonly amount?: number }> = ({ children, amount = 10 }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ translate: `${Math.sin(frame * 1.7) * amount}px ${Math.cos(frame * 2.3) * amount * 0.6}px`, rotate: `${Math.sin(frame * 0.9) * 1.5}deg`, scale: "1.06" }}>{children}</AbsoluteFill>;
};

// the colour arrives from the phone
const ColourFromPhone: React.FC = () => {
  const frame = useCurrentFrame();
  const r = interpolate(frame, [8, 34], [0, 1400], cl);
  const up = interpolate(frame, [0, 12], [700, 0], { ...cl });
  return (
    <AbsoluteFill>
      <Frame clip="scena-01" from={2.2} focus={[0.45, 0.5]} zoom={[1.02, 1.06]} />
      <AbsoluteFill style={{ clipPath: `circle(${r}px at 72% 40%)` }}>
        <Frame clip="scena-01" from={2.2} focus={[0.45, 0.5]} zoom={[1.02, 1.06]} tint />
      </AbsoluteFill>
      <svg width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(0 ${up})`}>
          <Smartphone x={780} y={330} scale={0.62} rot={-8} src="shots/serata.jpg" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const SHOTS: Record<string, React.FC> = {
  c1: () => <Frame clip="scena-01" from={0} focus={[0.42, 0.5]} />,
  c2: () => <Frame clip="scena-02" from={0.6} focus={[0.4, 0.5]} zoom={[1, 1.06]} />,
  c3: () => <Frame clip="scena-05" from={0} focus={[0.72, 0.5]} zoom={[1.05, 1.08]} />,
  c4: () => <Frame clip="scena-04" from={0.3} focus={[0.42, 0.5]} />,
  c5: () => <Frame clip="scena-05" from={1.9} focus={[0.72, 0.4]} zoom={[1.12, 1.18]} />,
  c6: () => <Frame clip="scena-06" from={2.9} focus={[0.45, 0.4]} zoom={[1.05, 1.15]} />,
  c7: () => <Frame clip="scena-07" from={0.4} focus={[0.55, 0.5]} />,
  c8: () => <Frame clip="scena-08" from={0.6} focus={[0.45, 0.5]} />,
  c9: () => <Frame clip="scena-09" from={1.8} focus={[0.5, 0.5]} />,
  c10: () => <Frame clip="scena-10" from={0} focus={[0.5, 0.5]} zoom={[1, 1.06]} />,
  c11: () => (
    <AbsoluteFill>
      <Frame still="nb10b" focus={[0.72, 0.42]} zoom={[1.7, 1.85]} />
      <Paper x={300} y={330} w={560} h={250} />
      <Hand text="Tav. 4 — Ferri" at={-20} strike={14} x={330} y={330} />
      <Hand text="Tav. 6 !!! (forse)" at={26} x={330} y={445} />
      <OldFilm />
    </AbsoluteFill>
  ),
  c12: () => <Frame clip="scena-12" from={0} focus={[0.5, 0.5]} />,
  c13: () => <Frame clip="scena-13" from={1.8} focus={[0.5, 0.5]} />,
  c14: () => <Frame clip="scena-14" from={0.2} focus={[0.35, 0.5]} />,
  c15: () => <Frame clip="scena-15" from={0.4} focus={[0.3, 0.5]} />,
  c16: () => (
    <AbsoluteFill>
      <Frame clip="scena-10" from={1.6} focus={[0.7, 0.4]} zoom={[1.45, 1.55]} />
      <Paper x={360} y={170} w={520} h={330} rot={-3} />
      <Hand text="14 + 12 + 22 +" at={4} x={380} y={170} size={66} rot={-3} />
      <Hand text="9 + 18 + 5 + 11…" at={26} x={380} y={270} size={66} rot={-3} />
      <Hand text="= ???" at={50} x={520} y={370} size={84} rot={-3} />
    </AbsoluteFill>
  ),
  c17: () => (
    <AbsoluteFill>
      <Frame clip="scena-06" from={1.6} rate={0.8} focus={[0.45, 0.3]} zoom={[1.3, 1.38]} />
      <QuestionMarks items={[{ x: 250, y: 220, at: 8, s: 0.7 }, { x: 830, y: 170, at: 20, s: 0.8 }, { x: 600, y: 120, at: 32, s: 0.6 }]} />
    </AbsoluteFill>
  ),
  c18: () => (
    <AbsoluteFill>
      <Frame still="tratt07" blur={9} zoom={[1.1, 1.15]} />
      <QuestionMarks items={[{ x: 200, y: 380, at: 0, s: 1.2, label: "INCASSO?" }, { x: 540, y: 380, at: 30, s: 1.2, label: "SPESE?" }, { x: 880, y: 380, at: 64, s: 1.2, label: "TI RESTA?" }]} />
      <OldFilm />
    </AbsoluteFill>
  ),
  c19: () => <Frame clip="scena-12" from={2.6} focus={[0.5, 0.5]} zoom={[1.08, 1.14]} />,
  c20: () => (
    <AbsoluteFill>
      <Frame still="tratt07" blur={10} zoom={[1.15, 1.2]} />
      <Poster />
      <OldFilm />
    </AbsoluteFill>
  ),
  c21: () => <Frame clip="scena-04" from={2.4} focus={[0.4, 0.35]} zoom={[1.15, 1.22]} />,
  c22: () => (
    <Shake>
      <Frame clip="scena-09" from={0} rate={1.7} focus={[0.5, 0.5]} zoom={[1.05, 1.12]} />
    </Shake>
  ),
  c23: () => (
    <AbsoluteFill>
      <Frame still="oste06" focus={[0.42, 0.25]} zoom={[1.15, 1.45]} />
      <Spiral />
      <OldFilm />
    </AbsoluteFill>
  ),
  c24: () => <ColourFromPhone />,
  c25: () => (
    <svg width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`}>
      <C25 mode="color" />
    </svg>
  ),
  c26: () => (
    <svg width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`}>
      <C26 mode="color" />
    </svg>
  ),
  c27: () => <Frame clip="scena-02" from={3.0} focus={[0.4, 0.4]} zoom={[1.05, 1.1]} tint />,
  c28: () => <Frame clip="scena-05" from={0.4} focus={[0.72, 0.4]} zoom={[1.1, 1.15]} tint />,
  c29: () => <Frame clip="scena-01" from={0} focus={[0.42, 0.5]} zoom={[1, 1.06]} tint />,
};

const AIShot: React.FC<{ readonly line: Line }> = ({ line }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const S = SHOTS[line.id];
  const r = line.iris === "out" ? interpolate(frame, [durationInFrames - 12, durationInFrames - 1], [700, 0], cl) : line.iris === "in" ? interpolate(frame, [0, 12], [0, 700], cl) : 800;
  return (
    <AbsoluteFill style={{ top: PANEL_Y, height: PH, overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ clipPath: `circle(${r}px at 50% 50%)` }}>
        <S />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const CartoonAI: React.FC<{ readonly music: string }> = ({ music }) => {
  const { fps } = useVideoConfig();
  const t = timeline(fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <BrandMap />
      <Title />
      {t.shots.map((s) => (
        <Sequence key={s.line.id} name={`${s.line.id} · ${s.line.text}`} from={s.from} durationInFrames={s.dur} premountFor={fps}>
          <AIShot line={s.line} />
          <Caption line={s.line} dur={s.dur} />
        </Sequence>
      ))}
      <Sequence name="Logo" from={t.end} durationInFrames={t.total - t.end} premountFor={fps}>
        <EndCard />
      </Sequence>
      <Audio src={staticFile(music)} premountFor={fps} />
    </AbsoluteFill>
  );
};
