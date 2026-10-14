import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GRAD } from "../theme";
import { SCENES } from "./Scenes";
import { OldFilm, PH, PW, weave } from "./Scenery";
import { END_CARD, Line, SCRIPT, SUBTITLE, TITLE } from "./script";

// Layout of the reference: a fixed title on black, the cartoon panel in the middle, yellow subtitles on the panel.
export const PANEL_Y = 520;
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const timeline = (fps: number) => {
  let at = 0;
  const shots = SCRIPT.map((l) => {
    const d = Math.round(l.dur * fps);
    const s = { line: l, from: at, dur: d };
    at += d;
    return s;
  });
  return { shots, end: at, total: at + Math.round(END_CARD * fps) };
};

// subtitles in short chunks (a few words), timed by length, like the reference
const chunks = (text: string) => {
  const words = text.split(" ");
  const out: string[] = [];
  let cur: string[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const end = /[.,?!:…»]$/.test(w) || cur.length >= 5;
    if (end || i === words.length - 1) {
      out.push(cur.join(" "));
      cur = [];
    }
  });
  return out;
};

export const Caption: React.FC<{ readonly line: Line; readonly dur: number }> = ({ line, dur }) => {
  const frame = useCurrentFrame();
  const parts = chunks(line.text);
  const total = parts.reduce((s, p) => s + p.length + 6, 0);
  let acc = 0, cur = parts[0];
  for (const p of parts) {
    const len = ((p.length + 6) / total) * dur;
    if (frame >= acc) cur = p;
    acc += len;
  }
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: PANEL_Y + PH - 150,
        height: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 52,
        lineHeight: 1.1,
        color: "#ffe14d",
        WebkitTextStroke: "10px #000",
        paintOrder: "stroke fill",
        letterSpacing: "-0.01em",
      }}
    >
      {cur}
    </div>
  );
};

const Shot: React.FC<{ readonly line: Line }> = ({ line }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const Scene = SCENES[line.id];
  const r = line.iris === "out"
    ? interpolate(frame, [durationInFrames - 12, durationInFrames - 1], [700, 0], cl)
    : line.iris === "in"
      ? interpolate(frame, [0, 12], [0, 700], cl)
      : 800;
  return (
    <AbsoluteFill style={{ top: PANEL_Y, height: PH, overflow: "hidden", background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, clipPath: `circle(${r}px at 50% 50%)`, translate: line.mode === "bw" ? weave(frame) : undefined }}>
        <svg width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`} style={{ display: "block" }}>
          <Scene mode={line.mode} />
        </svg>
        {line.mode === "bw" ? <OldFilm /> : null}
      </div>
    </AbsoluteFill>
  );
};

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, 10], [0.6, 1], cl);
  return (
    <AbsoluteFill style={{ top: PANEL_Y, height: PH, background: "radial-gradient(ellipse at 50% 40%, #134e4a, #020617 75%)", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <div style={{ width: 200, height: 200, borderRadius: 45, overflow: "hidden", scale: String(s), boxShadow: "0 30px 80px -20px rgba(45,212,191,0.7)" }}>
        <Img src={staticFile("logo.png")} style={{ width: "100%", height: "100%", scale: "1.03" }} />
      </div>
      <div style={{ marginTop: 34, fontWeight: 800, fontSize: 120, letterSpacing: "-0.05em", color: "#fff" }}>
        Sala<span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Flow</span>
      </div>
      <div style={{ marginTop: 30, padding: "24px 56px", borderRadius: 999, backgroundImage: GRAD, color: "#042f2e", fontWeight: 800, fontSize: 50, opacity: interpolate(frame, [8, 16], [0, 1], cl) }}>
        Prenota una visita
      </div>
      <div style={{ marginTop: 26, fontWeight: 800, fontSize: 44, color: "#fff", opacity: interpolate(frame, [14, 22], [0, 1], cl) }}>salaflow.com</div>
    </AbsoluteFill>
  );
};

export const Title: React.FC = () => (
  <div style={{ position: "absolute", top: 360, width: "100%", textAlign: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 800, fontSize: 60, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{TITLE}</div>
    <div style={{ marginTop: 14, fontWeight: 600, fontSize: 40, fontStyle: "italic", color: "#e5e5e5" }}>{SUBTITLE}</div>
  </div>
);

export const Cartoon: React.FC<{ readonly music: string }> = ({ music }) => {
  const { fps } = useVideoConfig();
  const t = timeline(fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Title />
      {t.shots.map((s) => (
        <Sequence key={s.line.id} name={`${s.line.id} · ${s.line.text}`} from={s.from} durationInFrames={s.dur} premountFor={fps}>
          <Shot line={s.line} />
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
