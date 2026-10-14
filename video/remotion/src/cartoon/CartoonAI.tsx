import { loadFont } from "@remotion/fonts";
import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GRAD } from "../theme";
import { ColourReveal, Coverflow, mid, Pov } from "./ai/app";
import { AppScreen, Beams, Bokeh, Cam, camAt, CamKey, cl, Dust, Glow, Living, PhoneScreen, Quad, Sparkles, Stage, Steam, Sweat, toPanel, tracked } from "./ai/kit";
import { Caption, chunkStarts, PANEL_Y, timeline } from "./Cartoon";
import { OldFilm, PH, PW } from "./Scenery";
import type { Line } from "./script";
import { SUBTITLE, TITLE } from "./script";
import { BEAT } from "./style";

// Same story, subtitles and music as the drawn cartoon, made from the team's pictures:
// the Kling clips (public/clips) for the first part, the ChatGPT stills brought to life by scripts/vivi.py for the rest,
// and the SalaFlow part built here around the real app screens.

loadFont({ family: "AlfaSlab", url: staticFile("font/AlfaSlabOne.ttf"), weight: "400" });

const CW = 1916, CH = 1080; // Kling clips

type ShotProps = { readonly line: Line; readonly at: number; readonly dur: number };

// a Kling clip filling the panel, with a focus point and a slow zoom
const Clip: React.FC<{ readonly clip: string; readonly from?: number; readonly rate?: number; readonly focus?: readonly [number, number]; readonly zoom?: readonly [number, number] }> = ({ clip, from = 0, rate = 1, focus = [0.5, 0.5], zoom = [1, 1.04] }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const z = interpolate(frame, [0, durationInFrames], zoom, cl);
  const h = PH * z, w = (CW / CH) * h;
  return <Video src={staticFile(`clips/${clip}.mp4`)} trimBefore={Math.round(from * fps)} playbackRate={rate} muted objectFit="fill" style={{ position: "absolute", left: (PW - w) * focus[0], top: (PH - h) * focus[1], width: w, height: h }} />;
};

// ---------- overlays of single shots ----------

// 20 · the slogan stamped on the poster's empty ribbon
const Ribbon: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame - 5;
  const s = interpolate(t, [0, 5], [1.5, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const op = interpolate(t, [0, 3], [0, 0.93], cl);
  return (
    <svg width={1672} height={941} viewBox="0 0 1672 941" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <path id="rib" d="M 470 232 A 1049 1049 0 0 1 1210 232" />
        <filter id="ink" x="-10%" y="-30%" width="120%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={4} result="d" />
          <feComponentTransfer in="n" result="holes">
            <feFuncA type="discrete" tableValues="1 1 1 1 0.55 1 1 1" />
          </feComponentTransfer>
          <feComposite in="d" in2="holes" operator="in" />
        </filter>
      </defs>
      <g transform={`translate(840 160) scale(${s}) rotate(${(1 - s) * -6}) translate(-840 -160)`} opacity={op} style={{ mixBlendMode: "multiply" }}>
        <text fontFamily="AlfaSlab, serif" fontSize={66} fill="#2a1a10" letterSpacing={3} filter="url(#ink)" textLength={700} lengthAdjust="spacingAndGlyphs">
          <textPath href="#rib" startOffset="50%" textAnchor="middle">
            È SEMPRE STATO COSÌ!
          </textPath>
        </text>
      </g>
    </svg>
  );
};

// 23 · spinning hypnotic eyes, drawn over the picture's ones (they follow the head)
const SPIRAL = (() => {
  let d = "";
  const turns = 4.2;
  for (let i = 0; i <= 140; i++) {
    const th = (i / 140) * turns * 2 * Math.PI, r = (i / 140) * 1.05;
    d += `${i ? "L" : "M"} ${(Math.cos(th) * r).toFixed(3)} ${(Math.sin(th) * r).toFixed(3)} `;
  }
  return d;
})();

const Spirals: React.FC<{ readonly at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const eyes = tracked("23", "occhi", at, frame);
  const spec = [{ rx: 22, ry: 37, a: 153.5 - 90 }, { rx: 29, ry: 48, a: 157.8 - 90 }];
  return (
    <svg width={1672} height={941} viewBox="0 0 1672 941" style={{ position: "absolute", left: 0, top: 0 }}>
      {eyes.map((e, i) => (
        <g key={i} transform={`translate(${e[0]} ${e[1]}) rotate(${spec[i].a})`}>
          <clipPath id={`eye${i}`}>
            <ellipse rx={spec[i].rx} ry={spec[i].ry} />
          </clipPath>
          <ellipse rx={spec[i].rx} ry={spec[i].ry} fill="#f1e6d5" />
          <g clipPath={`url(#eye${i})`}>
            <g transform={`scale(${spec[i].rx} ${spec[i].ry}) rotate(${-frame * 16})`}>
              <path d={SPIRAL} stroke="#0b0805" strokeWidth={0.13} fill="none" strokeLinecap="round" />
            </g>
          </g>
          <ellipse rx={spec[i].rx} ry={spec[i].ry} fill="none" stroke="#0b0805" strokeWidth={4} />
        </g>
      ))}
    </svg>
  );
};

// 22 · whirls around the spinning owner
const Whirl: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  const rad = (deg: number) => (deg * Math.PI) / 180;
  return (
    <svg width={1672} height={941} viewBox="0 0 1672 941" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const r = 230 + i * 34, a0 = frame * (11 + i * 2) + i * 72;
        const p1 = [x + Math.cos(rad(a0)) * r, y + Math.sin(rad(a0)) * r * 0.55], p2 = [x + Math.cos(rad(a0 + 70)) * r, y + Math.sin(rad(a0 + 70)) * r * 0.55];
        return <path key={i} d={`M ${p1[0]} ${p1[1]} A ${r} ${r * 0.55} 0 0 1 ${p2[0]} ${p2[1]}`} stroke="#f3ece0" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.75} style={{ filter: "drop-shadow(0 0 2px #000)" }} />;
      })}
    </svg>
  );
};

// a beat-synced "thump" of the camera
const Thump: React.FC<{ readonly at: number; readonly amount?: number; readonly children: React.ReactNode }> = ({ at, amount = 0.03, children }) => {
  const frame = useCurrentFrame();
  const k = Math.exp(-((at + frame) % BEAT) / 4);
  return <AbsoluteFill style={{ transform: `scale(${1 + amount * k})` }}>{children}</AbsoluteFill>;
};

// 16 · the light of the swinging lamp
const LampGlow: React.FC<{ readonly at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const lamp = tracked("16", "lampada", at, frame)[0];
  return <Glow x={lamp[0]} y={lamp[1] + 10} r={190} strength={0.42} color="255,236,200" />;
};

// 28b · "per le ricette": the owner writes a recipe, the boy's phone shows tonight's bookings
const Recipe: React.FC<{ readonly at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const keys: CamKey[] = [{ at: 0, cam: [900, 440, 1.16] }, { at: -1, cam: [860, 470, 1.0] }];
  const cam: Cam = camAt(frame, durationInFrames, keys);
  const q = tracked("29", "schermo", at, frame) as unknown as Quad;
  const page = toPanel(cam, [640, 590]);
  return (
    <AbsoluteFill>
      <Stage keys={keys}>
        <Living n="29" at={at} />
        <PhoneScreen quad={q} radius={30}>
          <AppScreen steps={[{ at: 0, src: "shots/serata.jpg", scroll: [0, 260] }]} />
        </PhoneScreen>
        <Glow x={mid(q)[0]} y={mid(q)[1]} r={150} color="94,234,212" strength={0.3} flicker={0.04} />
        <Glow x={333} y={60} r={200} strength={0.45} />
        <Glow x={1400} y={127} r={150} strength={0.35} seed="b" />
      </Stage>
      <Sparkles seed="s28b" box={[page[0] - 230, page[1] - 120, page[0] + 230, page[1] + 90]} n={12} from={2} every={4} size={24} />
      <Bokeh seed="b28b" n={10} />
    </AbsoluteFill>
  );
};

// ---------- the shots ----------
const SHOTS: Record<string, React.FC<ShotProps>> = {
  c1: () => <Clip clip="scena-01" from={0} focus={[0.42, 0.5]} />,
  c2: () => <Clip clip="scena-02" from={0.6} focus={[0.4, 0.5]} zoom={[1, 1.06]} />,
  c3: () => <Clip clip="scena-05" from={0} focus={[0.72, 0.5]} zoom={[1.05, 1.08]} />,
  c4: () => <Clip clip="scena-04" from={0.3} focus={[0.42, 0.5]} />,
  c5: () => <Clip clip="scena-05" from={1.9} focus={[0.72, 0.4]} zoom={[1.12, 1.18]} />,
  c6: () => <Clip clip="scena-06" from={2.9} focus={[0.45, 0.4]} zoom={[1.05, 1.15]} />,
  c7: () => <Clip clip="scena-07" from={0.4} focus={[0.55, 0.5]} />,
  c8: () => <Clip clip="scena-08" from={0.6} focus={[0.45, 0.5]} />,
  c9: () => <Clip clip="scena-09" from={1.8} focus={[0.5, 0.5]} />,
  c10: () => <Clip clip="scena-10" from={0} focus={[0.5, 0.5]} zoom={[1, 1.06]} />,
  c11: ({ at }) => (
    <Stage keys={[{ at: 0, cam: [836, 470, 1.02] }, { at: -1, cam: [780, 440, 1.16] }]} weave>
      <Living n="11" at={at} />
      <Sweat x={345} y={175} />
    </Stage>
  ),
  c12: () => <Clip clip="scena-12" from={0} focus={[0.5, 0.5]} />,
  c13: () => <Clip clip="scena-13" from={1.8} focus={[0.5, 0.5]} />,
  c14: () => <Clip clip="scena-14" from={0.2} focus={[0.35, 0.5]} />,
  c15: () => <Clip clip="scena-15" from={0.4} focus={[0.3, 0.5]} />,
  c16: ({ at }) => (
    <Stage keys={[{ at: 0, cam: [640, 380, 1.3] }, { at: -1, cam: [990, 600, 1.3] }]} weave>
      <Living n="16" at={at} />
      <LampGlow at={at} />
    </Stage>
  ),
  c17: ({ at }) => (
    <Stage keys={[{ at: 0, cam: [880, 470, 1.0] }, { at: -1, cam: [760, 410, 1.15] }]} weave>
      <Living n="17" at={at} />
      <Beams x={1560} y={-40} angle={38} len={1000} spread={330} opacity={0.3} />
      <Dust seed="d17" box={[900, 60, 1560, 820]} n={36} />
      <Steam x={876} y={455} scale={0.55} />
    </Stage>
  ),
  c18: ({ at, line, dur }) => {
    const c = chunkStarts(line.text, dur).map((p) => p.at);
    return (
      <Stage
        keys={[
          { at: 0, cam: [330, 470, 1.4] },
          { at: c[1] - 5, cam: [330, 470, 1.4] },
          { at: c[1] + 5, cam: [870, 480, 1.4] },
          { at: c[2] - 5, cam: [870, 480, 1.4] },
          { at: c[2] + 5, cam: [1330, 460, 1.4] },
          { at: -1, cam: [1330, 450, 1.46] },
        ]}
        ease={Easing.inOut(Easing.cubic)}
        weave
        blurX
      >
        <Living n="18" at={at} />
      </Stage>
    );
  },
  c19: ({ at }) => (
    <Stage keys={[{ at: 0, cam: [720, 480, 1.05] }, { at: -1, cam: [720, 420, 1.25] }]} weave>
      <Living n="19" at={at} />
    </Stage>
  ),
  c20: ({ at }) => (
    <Stage keys={[{ at: 0, cam: [836, 500, 1.0] }, { at: -1, cam: [836, 430, 1.12] }]} weave>
      <Living n="20" at={at} />
      <Ribbon />
    </Stage>
  ),
  c21: ({ at }) => (
    <Stage keys={[{ at: 0, cam: [760, 470, 1.05] }, { at: -1, cam: [930, 430, 1.2] }]} weave>
      <Living n="21" at={at} />
      <Glow x={490} y={125} r={170} strength={0.4} color="255,236,200" />
    </Stage>
  ),
  c22: ({ at }) => (
    <Thump at={at}>
      <Stage keys={[{ at: 0, cam: [836, 470, 1.12] }, { at: -1, cam: [800, 440, 1.22] }]} shake={6} weave>
        <Living n="22" at={at} />
        <Whirl x={800} y={430} />
      </Stage>
    </Thump>
  ),
  c23: ({ at }) => (
    <Stage keys={[{ at: 0, cam: [780, 360, 1.0] }, { at: -1, cam: [780, 300, 1.28] }]} weave>
      <Living n="23" at={at} />
      <Spirals at={at} />
    </Stage>
  ),
  c24: ({ at }) => <ColourReveal at={at} />,
  c25: ({ line, dur }) => {
    const c = chunkStarts(line.text, dur).map((p) => p.at);
    // "cucina e conto.": the bill shows up on "conto"
    return <Pov t={[c[0], c[1], c[2], c[3], c[3] + (c[4] - c[3]) * 0.52, c[4]]} />;
  },
  c26: ({ line, dur }) => {
    const c = chunkStarts(line.text, dur).map((p) => p.at);
    return <Coverflow t={[c[0], c[1], c[2], c[3], c[3] + (dur - c[3]) * 0.5]} />;
  },
  c27: ({ at }) => (
    <AbsoluteFill>
      <Stage keys={[{ at: 0, cam: [760, 420, 1.0] }, { at: -1, cam: [780, 360, 1.14] }]}>
        <Living n="27" at={at} />
        <Glow x={440} y={87} r={200} strength={0.45} />
        <Glow x={1520} y={173} r={160} strength={0.4} seed="b" />
      </Stage>
      <Bokeh seed="b27" n={10} />
    </AbsoluteFill>
  ),
  c28: ({ at }) => (
    <AbsoluteFill>
      <Stage keys={[{ at: 0, cam: [853, 420, 1.04] }, { at: -1, cam: [853, 380, 1.14] }]}>
        <Living n="28" at={at} />
        <Glow x={353} y={80} r={200} strength={0.45} />
        <Glow x={1473} y={187} r={160} strength={0.4} seed="b" />
      </Stage>
      <Bokeh seed="b28" n={10} />
    </AbsoluteFill>
  ),
  c28b: ({ at }) => <Recipe at={at} />,
  c29: ({ at }) => (
    <AbsoluteFill>
      <Stage keys={[{ at: 0, cam: [836, 430, 1.15] }, { at: -1, cam: [836, 470, 1.0] }]}>
        <Living n="30" at={at} />
        <Glow x={47} y={120} r={170} strength={0.55} />
        <Glow x={1633} y={120} r={170} strength={0.55} seed="b" />
        <Glow x={680} y={73} r={120} strength={0.4} seed="c" />
        <Glow x={920} y={67} r={120} strength={0.4} seed="d" />
        <Glow x={1333} y={100} r={120} strength={0.4} seed="e" />
      </Stage>
      <Sparkles seed="s29" box={[140, 60, 940, 560]} n={22} from={0} every={5} size={26} />
      <Bokeh seed="b29" n={12} />
    </AbsoluteFill>
  ),
};

// where the iris closes, in panel units
const IRIS_AT: Record<string, readonly [number, number]> = { c29: [520, 560] };

const AIShot: React.FC<{ readonly line: Line; readonly at: number }> = ({ line, at }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const S = SHOTS[line.id];
  const [ix, iy] = IRIS_AT[line.id] ?? [PW / 2, PH / 2];
  const r = line.iris === "out" ? interpolate(frame, [durationInFrames - 13, durationInFrames - 1], [760, 0], { ...cl, easing: Easing.in(Easing.quad) }) : line.iris === "in" ? interpolate(frame, [0, 12], [0, 760], { ...cl, easing: Easing.out(Easing.quad) }) : 900;
  const flashback = line.mode === "bw" && Number(line.id.slice(1)) >= 7;
  return (
    <AbsoluteFill style={{ top: PANEL_Y, height: PH, overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ clipPath: `circle(${r}px at ${ix}px ${iy}px)` }}>
        <S line={line} at={at} dur={durationInFrames} />
        {flashback ? <OldFilm /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- around the panel ----------

// the title; when SalaFlow arrives "(lo credi tu)" gets crossed out and becomes "(adesso sì)"
const TitleAI: React.FC<{ readonly change: number }> = ({ change }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const strike = interpolate(frame, [change, change + 8], [0, 1], { ...cl, easing: Easing.out(Easing.quad) });
  const out = interpolate(frame, [change + 12, change + 20], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const pop = spring({ frame: frame - change - 16, fps, config: { damping: 10, stiffness: 140 } });
  return (
    <div style={{ position: "absolute", top: 360, width: "100%", textAlign: "center", fontFamily: FONT, color: "#fff" }}>
      <div style={{ fontWeight: 800, fontSize: 60, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{TITLE}</div>
      <div style={{ position: "relative", marginTop: 14, height: 52 }}>
        <div style={{ position: "absolute", width: "100%", fontWeight: 600, fontSize: 40, fontStyle: "italic", color: "#e5e5e5", opacity: 1 - out, transform: `translateY(${out * 34}px)` }}>
          <span style={{ position: "relative", display: "inline-block" }}>
            {SUBTITLE}
            {strike > 0 ? (
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ position: "absolute", left: -8, top: 6, width: "calc(100% + 16px)", height: 40, overflow: "visible", clipPath: `inset(-20px ${100 - strike * 100}% -20px -20px)` }}>
                <path d="M 0 22 Q 30 14 55 20 T 100 16" stroke="#f43f5e" strokeWidth={4.5} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
            ) : null}
          </span>
        </div>
        {frame >= change + 16 ? (
          <div style={{ position: "absolute", width: "100%", fontWeight: 800, fontSize: 44, fontStyle: "italic", transform: `scale(${0.4 + 0.6 * pop})`, opacity: Math.min(1, pop * 1.5) }}>
            <span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 0 18px rgba(45,212,191,0.45))" }}>(adesso sì)</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// warm light spilling out of the panel once the story turns to colour
const Ambient: React.FC<{ readonly from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [from + 10, from + 40], [0, 1], cl);
  if (k <= 0) return null;
  const b = 0.85 + 0.15 * Math.sin(frame / 22);
  return (
    <AbsoluteFill style={{ opacity: k * b }}>
      <div style={{ position: "absolute", left: -200, right: -200, top: PANEL_Y - 260, height: 420, background: "radial-gradient(ellipse at 50% 100%, rgba(251,191,36,0.32), rgba(251,191,36,0) 65%)" }} />
      <div style={{ position: "absolute", left: -200, right: -200, top: PANEL_Y + PH - 160, height: 460, background: "radial-gradient(ellipse at 50% 0%, rgba(45,212,191,0.3), rgba(45,212,191,0) 65%)" }} />
    </AbsoluteFill>
  );
};

const EndCardAI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 11, stiffness: 120 } });
  const word = (i: number) => spring({ frame: frame - 6 - i * 2, fps, config: { damping: 14 } });
  const cta = spring({ frame: frame - 16, fps, config: { damping: 12 } });
  const shine = interpolate(frame, [34, 58], [-60, 160], cl);
  return (
    <AbsoluteFill style={{ top: PANEL_Y, height: PH, overflow: "hidden", background: "radial-gradient(ellipse at 50% 38%, #12403d 0%, #071423 55%, #020617 100%)", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: -300 + frame * 4, top: -200, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,191,36,0.22), rgba(251,191,36,0) 65%)" }} />
      <div style={{ position: "absolute", right: -300 + frame * 3, bottom: -260, width: 760, height: 760, borderRadius: "50%", background: "radial-gradient(circle, rgba(45,212,191,0.28), rgba(45,212,191,0) 65%)" }} />
      <Bokeh seed="bend" n={12} color="153,246,228" />
      <div style={{ width: 190, height: 190, borderRadius: 44, overflow: "hidden", transform: `scale(${0.4 + 0.6 * logo}) rotate(${(1 - logo) * -14}deg)`, boxShadow: `0 30px 80px -20px rgba(45,212,191,${0.5 + 0.3 * Math.sin(frame / 8)})` }}>
        <Img src={staticFile("logo.png")} style={{ width: "100%", height: "100%", scale: "1.03" }} />
      </div>
      <div style={{ marginTop: 30, fontWeight: 800, fontSize: 118, letterSpacing: "-0.05em", color: "#fff", display: "flex" }}>
        {"SalaFlow".split("").map((ch, i) => (
          <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - word(i)) * 60}px)`, opacity: Math.min(1, word(i) * 1.4), ...(i >= 4 ? { backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } : {}) }}>
            {ch}
          </span>
        ))}
      </div>
      <div style={{ position: "relative", marginTop: 26, padding: "24px 58px", borderRadius: 999, backgroundImage: GRAD, color: "#042f2e", fontWeight: 800, fontSize: 50, overflow: "hidden", transform: `scale(${0.6 + 0.4 * cta})`, opacity: Math.min(1, cta * 1.5), boxShadow: "0 20px 60px -15px rgba(45,212,191,0.7)" }}>
        Prenota una visita
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${shine}%`, width: "30%", background: "linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,0.65), rgba(255,255,255,0))", transform: "skewX(-20deg)" }} />
      </div>
      <div style={{ marginTop: 24, fontWeight: 800, fontSize: 44, color: "#fff", opacity: interpolate(frame, [24, 32], [0, 1], cl) }}>salaflow.com</div>
      <Sparkles seed="send" box={[300, 120, 780, 420]} n={14} from={4} every={5} size={24} />
    </AbsoluteFill>
  );
};

export const CartoonAI: React.FC<{ readonly music: string }> = ({ music }) => {
  const { fps } = useVideoConfig();
  const t = timeline(fps);
  const colour = t.shots.find((s) => s.line.id === "c24")!.from;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Ambient from={colour} />
      <TitleAI change={colour + 14} />
      {t.shots.map((s) => (
        <Sequence key={s.line.id} name={`${s.line.id} · ${s.line.text}`} from={s.from} durationInFrames={s.dur} premountFor={fps}>
          <AIShot line={s.line} at={s.from} />
          <Caption line={s.line} dur={s.dur} />
        </Sequence>
      ))}
      <Sequence name="Logo" from={t.end} durationInFrames={t.total - t.end} premountFor={fps}>
        <EndCardAI />
      </Sequence>
      <Audio src={staticFile(music)} premountFor={fps} />
    </AbsoluteFill>
  );
};
