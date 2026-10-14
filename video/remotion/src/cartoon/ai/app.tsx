import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Device } from "../../components/Device";
import { PH, PW } from "../Scenery";
import { AppScreen, Bokeh, camAt, CamKey, cl, Glow, IH, IW, Living, PhoneScreen, Pt, Quad, Sparkles, Stage, Step, toPanel, tracked } from "./kit";

// The SalaFlow part: colour comes out of the phone, the app opens up around it, the management screens fan out.

export const mid = (q: readonly Pt[]): Pt => [(q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4];

// ---------- 24 · "Guarda qui": the phone lights up and the colour spreads from it ----------
export const ColourReveal: React.FC<{ readonly at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const keys: CamKey[] = [{ at: 0, cam: [960, 430, 1.02] }, { at: -1, cam: [1010, 400, 1.12] }];
  const cam = camAt(frame, durationInFrames, keys);
  const q = tracked("24", "schermo", at, frame) as unknown as Quad;
  const c = mid(q);
  const R = interpolate(frame, [12, 38], [0, 1900], { ...cl, easing: Easing.in(Easing.quad) });
  const on = interpolate(frame, [3, 9], [0, 1], cl);
  const pc = toPanel(cam, c);
  const rays = interpolate(frame, [8, 18, 40, 60], [0, 0.55, 0.25, 0.12], cl);
  return (
    <AbsoluteFill>
      <Stage keys={keys}>
        <Living n="24" at={at} />
        <Living n="24" at={at} style={{ filter: "grayscale(1) sepia(0.32) contrast(1.06) brightness(0.92)", WebkitMaskImage: `radial-gradient(circle at ${c[0]}px ${c[1]}px, transparent ${R}px, black ${R + 110}px)`, maskImage: `radial-gradient(circle at ${c[0]}px ${c[1]}px, transparent ${R}px, black ${R + 110}px)` }} />
        {/* in the old world only the notebook is red */}
        <Living n="24" at={at} style={{ clipPath: "polygon(546px 439px, 546px 625px, 412px 673px, 384px 620px, 333px 468px, 479px 414px)" }} />
        <div style={{ position: "absolute", left: c[0] - R, top: c[1] - R, width: R * 2, height: R * 2, borderRadius: "50%", border: "14px solid rgba(255,240,200,0.85)", filter: "blur(10px)", mixBlendMode: "screen", opacity: R > 0 ? interpolate(R, [0, 300, 1900], [0, 1, 0]) : 0 }} />
        <Glow x={c[0]} y={c[1]} r={300} color="94,234,212" strength={0.75 * on} flicker={0.05} />
        <div style={{ opacity: on, filter: `brightness(${1 + (1 - on) * 2})` }}>
          <PhoneScreen quad={q} radius={30}>
            <AppScreen steps={[{ at: 4, splash: true }]} />
          </PhoneScreen>
        </div>
      </Stage>
      <div style={{ position: "absolute", left: pc[0] - 900, top: pc[1] - 900, width: 1800, height: 1800, borderRadius: "50%", background: "repeating-conic-gradient(from 0deg, rgba(255,246,214,0.5) 0deg 4deg, rgba(255,246,214,0) 4deg 18deg)", WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 60%)", maskImage: "radial-gradient(circle, black 0%, transparent 60%)", transform: `rotate(${frame * 0.6}deg)`, mixBlendMode: "screen", opacity: rays }} />
      <Sparkles seed="s24" box={[pc[0] - 220, pc[1] - 200, pc[0] + 200, pc[1] + 220]} n={14} from={6} every={3} size={30} />
      <Bokeh seed="b24" n={10} opacity={interpolate(frame, [20, 40], [0, 1], cl)} />
    </AbsoluteFill>
  );
};

// ---------- 25 · the phone in our hand: the app opens up, pieces fly out, then everything goes back in ----------
const SCREEN25: Quad = [[627, 47.1], [1035.3, 45.4], [1021.9, 849], [627, 849]];
const PHONE25: Pt = [830, 450];

type Frag = { readonly src: string; readonly crop: readonly [number, number, number, number]; readonly imgW: number; readonly w: number; readonly to: Pt; readonly ry: number; readonly rz: number };
const FRAGS: readonly Frag[] = [
  { src: "shots/serata.jpg", crop: [30, 905, 830, 1225], imgW: 860, w: 380, to: [205, 158], ry: 20, rz: -5 }, // a booking
  { src: "shots/mappa.jpg", crop: [60, 680, 800, 1200], imgW: 860, w: 345, to: [880, 178], ry: -20, rz: 5 }, // the floor plan
  { src: "shots/comanda.jpg", crop: [30, 505, 830, 760], imgW: 860, w: 370, to: [200, 405], ry: 18, rz: -3 }, // the order
  { src: "shots/cucina.jpg", crop: [27, 286, 589, 1072], imgW: 1536, w: 232, to: [895, 468], ry: -18, rz: 4 }, // the kitchen ticket
  { src: "shots/cassa.jpg", crop: [30, 1010, 830, 1310], imgW: 860, w: 360, to: [212, 598], ry: 16, rz: -4 }, // the bill
];

const FragCard: React.FC<{ readonly f: Frag; readonly style: React.CSSProperties }> = ({ f, style }) => {
  const [x0, y0, x1, y1] = f.crop;
  const s = f.w / (x1 - x0);
  return (
    <div style={{ position: "absolute", width: f.w, height: (y1 - y0) * s, borderRadius: 16, overflow: "hidden", background: "#050b17", border: "1.5px solid rgba(148,163,184,0.35)", boxShadow: "0 26px 60px -10px rgba(0,0,0,0.65), 0 0 46px -6px rgba(45,212,191,0.45)", ...style }}>
      <Img src={staticFile(f.src)} style={{ position: "absolute", left: -x0 * s, top: -y0 * s, width: f.imgW * s }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(255,255,255,0.12), rgba(255,255,255,0) 40%)" }} />
    </div>
  );
};

export const Pov: React.FC<{ readonly t: readonly number[] }> = ({ t }) => {
  // t: when each word starts (prenotazioni, sala, comande, cucina, conto, "in un'app sola")
  const frame = useCurrentFrame();
  const { fps, durationInFrames: D } = useVideoConfig();
  // at the end the camera dives into the screen: the next shot starts inside the app
  const keys: CamKey[] = [{ at: 0, cam: [836, 470, 1.0] }, { at: D - 11, cam: [836, 455, 1.06] }, { at: D, cam: [829, 446, 3.4], ease: Easing.in(Easing.cubic) }];
  const cam = camAt(frame, D, keys, Easing.inOut(Easing.cubic));
  const s = frame / fps;
  const appear = [t[0] + 6, t[1] + 4, t[2] + 4, t[3] + 4, t[4] + 4];
  const back = t[5];
  const splash = back + 10;
  const punch = spring({ frame: frame - splash, fps, config: { damping: 9, stiffness: 160 } });
  const ry = 7 * Math.sin((2 * Math.PI * s) / 3.4 + 0.6), rx = -3 * Math.sin((2 * Math.PI * s) / 2.7), dy = 9 * Math.sin((2 * Math.PI * s) / 1.7);
  const steps: Step[] = [
    { at: 0, src: "shots/serata.jpg", scroll: [0, 120] },
    { at: t[1], src: "shots/mappa.jpg" },
    { at: t[2], src: "shots/comanda.jpg", tap: [770, 566] },
    { at: t[3], src: "shots/cucina.jpg" },
    { at: t[4], src: "shots/cassa.jpg" },
    { at: splash, splash: true },
  ];
  const pc = toPanel(cam, PHONE25);
  const flash = interpolate(frame, [splash - 2, splash + 2, splash + 14], [0, 0.55, 0], cl);
  const rays = interpolate(frame, [splash, splash + 8, D], [0, 0.5, 0.35], cl);
  return (
    <AbsoluteFill>
      <Stage keys={keys} ease={Easing.inOut(Easing.cubic)}>
        <Img src={staticFile("clips/vivi/sfondo-25.jpg")} style={{ position: "absolute", left: 0, top: 0, width: IW, height: IH, transform: `scale(${1.02 + 0.03 * (frame / D)}) translateX(${-12 * (frame / D)}px)`, transformOrigin: "50% 50%" }} />
        <Glow x={340} y={113} r={190} strength={0.5} seed="l1" />
        <Glow x={1320} y={167} r={170} strength={0.45} seed="l2" />
        <Glow x={1233} y={307} r={90} strength={0.4} seed="l3" />
        <div style={{ position: "absolute", left: PHONE25[0] - 1000, top: PHONE25[1] - 1000, width: 2000, height: 2000, borderRadius: "50%", background: "repeating-conic-gradient(from 0deg, rgba(94,234,212,0.55) 0deg 3deg, rgba(94,234,212,0) 3deg 15deg)", WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 55%)", maskImage: "radial-gradient(circle, black 0%, transparent 55%)", transform: `rotate(${frame * 0.5}deg)`, mixBlendMode: "screen", opacity: rays }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: IW, height: 1101, transformOrigin: `${PHONE25[0]}px ${PHONE25[1]}px`, transform: `perspective(1800px) translateY(${dy}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${1 + 0.04 * punch - 0.04 * Math.max(0, punch - 1)})` }}>
          <Img src={staticFile("clips/vivi/mano-25.png")} style={{ position: "absolute", left: 0, top: 0, width: IW, height: 1101 }} />
          <PhoneScreen quad={SCREEN25} radius={36}>
            <AppScreen steps={steps} />
          </PhoneScreen>
          <Glow x={PHONE25[0]} y={PHONE25[1]} r={420} color="94,234,212" strength={0.22 + 0.35 * flash} flicker={0} />
        </div>
      </Stage>
      <Bokeh seed="b25" n={12} />
      {FRAGS.map((f, i) => {
        const a = appear[i];
        if (frame < a) return null;
        const p = spring({ frame: frame - a, fps, config: { damping: 12, stiffness: 110, mass: 0.75 } });
        const e = interpolate(frame, [back + i * 2, back + i * 2 + 11], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
        const float = Math.sin(frame / 17 + i * 1.3) * 7;
        const ghost = (lag: number, op: number) => {
          const pg = spring({ frame: frame - a - lag, fps, config: { damping: 12, stiffness: 110, mass: 0.75 } });
          return { pg, op };
        };
        const place = (pp: number, op: number, key: string) => {
          const x = pc[0] + (f.to[0] - pc[0]) * pp, y = pc[1] + (f.to[1] - pc[1]) * pp + float * pp;
          const x2 = x + (pc[0] - x) * e, y2 = y + (pc[1] - y) * e;
          const sc = (0.18 + 0.82 * Math.min(1.08, pp)) * (1 - 0.82 * e);
          const fh = ((f.crop[3] - f.crop[1]) * f.w) / (f.crop[2] - f.crop[0]);
          return (
            <FragCard
              key={key}
              f={f}
              style={{
                left: x2 - f.w / 2,
                top: y2 - fh / 2,
                opacity: op * interpolate(frame - a, [0, 4], [0, 1], cl) * (1 - e * e),
                transform: `perspective(1200px) rotateY(${f.ry * Math.min(1, pp)}deg) rotateX(${-12 * (1 - Math.min(1, pp))}deg) rotateZ(${f.rz * Math.min(1, pp)}deg) scale(${sc})`,
              }}
            />
          );
        };
        const g1 = ghost(2, 0.22), g2 = ghost(4, 0.1);
        const beam = interpolate(frame - a, [0, 3, 16], [0, 0.9, 0], cl) * (1 - e);
        const bx = pc[0] + (f.to[0] - pc[0]) * Math.min(1, p), by = pc[1] + (f.to[1] - pc[1]) * Math.min(1, p);
        return (
          <AbsoluteFill key={i}>
            {beam > 0 ? (
              <svg width={PW} height={PH} style={{ position: "absolute", inset: 0, overflow: "visible", mixBlendMode: "screen" }}>
                <line x1={pc[0]} y1={pc[1]} x2={bx} y2={by} stroke="rgba(94,234,212,0.9)" strokeWidth={5} strokeLinecap="round" opacity={beam} style={{ filter: "drop-shadow(0 0 10px rgba(45,212,191,1))" }} />
                <circle cx={bx} cy={by} r={18 * beam} fill="rgba(204,251,241,0.9)" style={{ filter: "blur(6px)" }} />
              </svg>
            ) : null}
            {p < 0.97 ? place(g2.pg, g2.op, "g2") : null}
            {p < 0.97 ? place(g1.pg, g1.op, "g1") : null}
            {place(p, 1, "c")}
          </AbsoluteFill>
        );
      })}
      <Sparkles seed="s25" box={[pc[0] - 260, pc[1] - 330, pc[0] + 260, pc[1] + 300]} n={16} from={splash - 2} every={2} size={34} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${pc[0]}px ${pc[1]}px, rgba(204,251,241,${flash}), rgba(45,212,191,${flash * 0.4}) 40%, rgba(0,0,0,0) 70%)`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

// ---------- 26 · "e per te": the management screens fan out in 3D, the one being named comes to the front ----------
const CARDS = [
  { src: "shots/andamento_full.jpg", scroll: 760 },
  { src: "shots/fattura_full.jpg", scroll: 980 },
  { src: "shots/magazzino_full.jpg", scroll: 820 },
  { src: "shots/turni_full.jpg", scroll: 900 },
];

export const Coverflow: React.FC<{ readonly t: readonly number[] }> = ({ t }) => {
  // t: "e per te", incassi, fatture, magazzino, turni
  const frame = useCurrentFrame();
  const { fps, durationInFrames: D } = useVideoConfig();
  const goto = [1.5, 0, 1, 2, 3];
  let a = goto[0];
  for (let k = 1; k < goto.length; k++) a += (goto[k] - goto[k - 1]) * spring({ frame: frame - t[k], fps, config: { damping: 15, stiffness: 120 } });
  const W = 330;
  const intro = interpolate(frame, [0, 9], [1, 0], { ...cl, easing: Easing.out(Easing.quad) });
  const tilt = 6 + 2 * Math.sin(frame / 30);
  const cards = CARDS.map((c, i) => {
    const d = i - a;
    const ad = Math.abs(d);
    const x = PW / 2 + Math.sign(d) * (Math.min(ad, 1) * 255 + Math.max(0, ad - 1) * 115);
    const z = -Math.min(ad, 2.2) * 250;
    const rot = Math.max(-58, Math.min(58, -d * 44));
    const rise = spring({ frame: frame - i * 4, fps, config: { damping: 14, stiffness: 90 } });
    const active = Math.max(0, 1 - ad);
    const k = goto.indexOf(i) > 0 ? t[goto.indexOf(i)] : 0;
    const next = t[goto.indexOf(i) + 1] ?? D;
    const scroll = interpolate(frame, [k + 8, next + 6], [0, c.scroll], { ...cl, easing: Easing.inOut(Easing.cubic) });
    return { c, i, ad, x, z, rot, rise, active, scroll };
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#0a0f1a" }}>
      <Img src={staticFile("clips/vivi/sfondo-25-blur.jpg")} style={{ position: "absolute", left: -260 - frame * 0.6, top: -80, height: PH + 160, width: ((PH + 160) * IW) / IH, opacity: 0.85 }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(45,212,191,0.3) 0%, rgba(2,6,23,0.3) 45%, rgba(2,6,23,0.8) 100%)" }} />
      <div style={{ position: "absolute", left: -260 + Math.sin(frame / 40) * 60, top: 120, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,191,36,0.3), rgba(251,191,36,0) 65%)", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", right: -240 + Math.cos(frame / 36) * 60, top: -120, width: 760, height: 760, borderRadius: "50%", background: "radial-gradient(circle, rgba(45,212,191,0.32), rgba(45,212,191,0) 65%)", mixBlendMode: "screen" }} />
      <Bokeh seed="b26" n={16} />
      <AbsoluteFill style={{ perspective: 1400, perspectiveOrigin: "50% 40%" }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(${tilt}deg)` }}>
          {[...cards].sort((p, q) => q.ad - p.ad).map(({ c, i, ad, x, z, rot, rise, active, scroll }) => (
            <div key={i} style={{ position: "absolute", left: x - W / 2, top: 58 + (1 - rise) * 800, width: W, transformStyle: "preserve-3d", transform: `translateZ(${z}px) rotateY(${rot}deg)`, filter: `brightness(${1 - 0.5 * Math.min(1, ad)})`, opacity: rise }}>
              <div style={{ position: "absolute", left: -40, top: 610, width: W + 80, height: 60, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.6), rgba(0,0,0,0) 70%)" }} />
              <Device src={c.src} width={W} scroll={scroll} style={{ boxShadow: `0 0 0 2px rgba(148,163,184,0.25), 0 50px 100px -30px rgba(0,0,0,0.9), 0 0 ${60 * active}px ${8 * active}px rgba(45,212,191,${0.55 * active})` }} />
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <Sparkles seed="s26" box={[PW / 2 - 200, 80, PW / 2 + 200, 680]} n={12} from={t[1]} every={8} size={22} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, #0f3b3a 0%, #071423 55%, #020617 100%)", opacity: intro }} />
    </AbsoluteFill>
  );
};

