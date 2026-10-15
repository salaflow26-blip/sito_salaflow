import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Device, screenGeometry } from "../components/Device";
import { FONT, GRAD } from "../theme";
import { Chip, cl, Flare, Footage, glass, H, Icon, io, NextPill, Note, Notification, TEAL, Touch, W, Words } from "./ui";

// SalaFlow, presented like a product keynote: cinematic footage, big words, frosted glass, the real app.
// 16:9, meant to be played full screen on a monitor and filmed. Music at 120 BPM: a beat every 15 frames.

export const SECTIONS = { open: 0, chaos: 240, reveal: 540, tiles: 780, features: 960, manage: 1710, close: 2070, end: 2340 } as const;
const FEAT = 150;

// ---------- 1 · Saturday night ----------
const Open: React.FC = () => (
  <AbsoluteFill>
    <Footage src="bg-pioggia.mp4" dim={0.35} zoom={[1.12, 1.0]} />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Words text="Sabato sera." at={18} out={108} size={190} />
    </AbsoluteFill>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Words text="*Tutto esaurito.*" at={124} out={226} size={190} />
    </AbsoluteFill>
  </AbsoluteFill>
);

// ---------- 2 · the phone never stops ----------
const NOTES: readonly Note[] = [
  { icon: "phone", app: "Telefono", title: "Chiamata in arrivo", text: "Tavolo per sei, stasera?", x: 1150, y: 110, rot: -2, at: 15, tint: "#16a34a" },
  { icon: "chat", app: "Messaggi", title: "Marco", text: "Arriviamo in 8, non in 6", x: 800, y: 250, rot: 2, at: 35, tint: "#2563eb" },
  { icon: "chat", app: "Messaggi", title: "Giulia", text: "Per me senza glutine, mi raccomando", x: 1180, y: 390, rot: -1.5, at: 52, tint: "#2563eb" },
  { icon: "note", app: "Post-it", title: "Tav. 12", text: "Celiaco? Chiedere in cucina", x: 760, y: 530, rot: 3, at: 68, tint: "#d97706" },
  { icon: "phone", app: "Telefono", title: "3 chiamate perse", text: "Numero sconosciuto", x: 1220, y: 660, rot: -3, at: 82, tint: "#16a34a" },
  { icon: "chat", app: "Messaggi", title: "Sara", text: "Si può spostare alle 21:30?", x: 840, y: 800, rot: 1.5, at: 95, tint: "#2563eb" },
  { icon: "note", app: "Post-it", title: "Tavolo 4", text: "Il secondo quando arriva?", x: 1180, y: 900, rot: -2, at: 106, tint: "#d97706" },
  { icon: "phone", app: "Telefono", title: "Chiamata in arrivo", text: "Avete posto per due?", x: 780, y: 90, rot: -3, at: 116, tint: "#16a34a" },
  { icon: "chat", app: "Messaggi", title: "Luca", text: "Conto diviso per sette, si può?", x: 1230, y: 240, rot: 2.5, at: 125, tint: "#2563eb" },
  { icon: "note", app: "Post-it", title: "Allergie", text: "Noci al tav. 3 (o era il 5?)", x: 820, y: 420, rot: -2, at: 133, tint: "#d97706" },
  { icon: "chat", app: "Messaggi", title: "Fornitore", text: "Domani la consegna salta", x: 1200, y: 560, rot: 1, at: 140, tint: "#2563eb" },
  { icon: "phone", app: "Telefono", title: "Chiamata in arrivo", text: "Prenotazione per dieci", x: 900, y: 700, rot: -1, at: 146, tint: "#16a34a" },
];
export const NOTE_TIMES = NOTES.map((n) => n.at);

const Chaos: React.FC = () => {
  const frame = useCurrentFrame();
  const leave = interpolate(frame, [266, 290], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  const shake = frame > 100 && frame < 266 ? Math.sin(frame * 1.9) * 2.5 * Math.min(1, (frame - 100) / 60) : 0;
  return (
    <AbsoluteFill style={{ opacity: interpolate(frame, [285, 300], [1, 0], cl) }}>
      <Footage src="bg-bar.mp4" dim={0.3} zoom={[1.0, 1.12]} />
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
        {NOTES.map((n, i) => (
          <Notification key={i} n={n} leave={leave} dimAfter={0.004} />
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0) 60%)" }} />
      <div style={{ position: "absolute", left: 130, top: 350 }}>
        <Words text={"Il telefono\nnon smette."} at={40} out={150} size={118} align="left" />
      </div>
      <div style={{ position: "absolute", left: 130, top: 350 }}>
        <Words text={"E il quaderno\n*non basta più.*"} at={166} out={262} size={112} align="left" />
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3 · the reveal ----------
const Logo: React.FC<{ readonly size: number; readonly at: number }> = ({ size, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 110 } });
  const sweep = interpolate(frame, [at + 6, at + 30], [-120, 160], cl);
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: size * 0.23, overflow: "hidden", transform: `translateY(${(1 - s) * 80}px) scale(${0.7 + 0.3 * s})`, opacity: Math.min(1, s * 1.5), boxShadow: `0 40px 120px -20px rgba(45,212,191,${0.75 * s})` }}>
      <Img src={staticFile("logo.png")} style={{ width: "100%", height: "100%", scale: "1.03" }} />
      <div style={{ position: "absolute", top: -40, bottom: -40, left: `${sweep}%`, width: "40%", background: "linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,0.7), rgba(255,255,255,0))", transform: "skewX(-18deg)" }} />
    </div>
  );
};

const Wordmark: React.FC<{ readonly size: number; readonly at: number }> = ({ size, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: "-0.05em", color: "#fff" }}>
      {"SalaFlow".split("").map((ch, i) => {
        const s = spring({ frame: frame - at - i * 2, fps, config: { damping: 15 } });
        return (
          <span key={i} style={{ display: "inline-block", opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 50}px)`, filter: `blur(${(1 - Math.min(1, s)) * 10}px)`, ...(i >= 4 ? { backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } : {}) }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const lights = interpolate(frame, [80, 120], [0, 1], cl);
  return (
    <AbsoluteFill style={{ background: "#000", opacity: interpolate(frame, [226, 240], [1, 0], cl) }}>
      <AbsoluteFill style={{ opacity: lights }}>
        <Footage src="bg-luci.mp4" dim={0.6} zoom={[1.15, 1.0]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Words text={"E se fosse tutto\nin un *posto solo*?"} at={8} out={72} size={128} />
      </AbsoluteFill>
      {frame >= 88 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34 }}>
          <Logo size={230} at={95} />
          <Wordmark size={170} at={110} />
          <Words text={"La sala, la cucina, la cassa. *In un'app sola.*"} at={150} size={54} weight={600} stagger={2} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- 4 · one app, the whole restaurant ----------
const TILES = [
  { label: "Sala", icon: "table", tint: "rgba(45,212,191,0.55)" },
  { label: "Cucina", icon: "chef", tint: "rgba(251,146,60,0.55)" },
  { label: "Cassa", icon: "receipt", tint: "rgba(167,139,250,0.55)" },
  { label: "Gestione", icon: "chart", tint: "rgba(52,211,153,0.55)" },
] as const;
const TILE = 300, TILE_Y = 430;
const tileX = (i: number) => (W - (4 * TILE + 3 * 44)) / 2 + i * (TILE + 44);
export const TILE_PRESS = 120;

const Tiles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const go = interpolate(frame, [TILE_PRESS + 26, 180], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ opacity: 1 - interpolate(frame, [168, 180], [0, 1], cl) }}>
      <Footage src="bg-sala.mp4" dim={0.55} zoom={[1.0, 1.08]} />
      <div style={{ position: "absolute", top: 150, width: "100%", opacity: 1 - go }}>
        <Words text={"Un'app. *Tutto il locale.*"} at={6} size={112} />
      </div>
      {TILES.map((t, i) => {
        const s = spring({ frame: frame - 30 - i * 6, fps, config: { damping: 14 } });
        const chosen = i === 0;
        const pressed = chosen && frame >= TILE_PRESS - 2 && frame < TILE_PRESS + 4;
        const glow = chosen ? interpolate(frame, [TILE_PRESS, TILE_PRESS + 10], [0, 1], cl) : 0;
        const zoom = chosen ? 1 + go * 5 : 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: tileX(i),
              top: TILE_Y,
              width: TILE,
              height: TILE,
              ...glass(36),
              overflow: "hidden",
              opacity: Math.min(1, s * 1.4) * (chosen ? 1 - Math.max(0, go - 0.6) * 2.5 : 1 - go),
              transform: `translateY(${(1 - s) * 60}px) scale(${(0.9 + 0.1 * s) * (pressed ? 0.95 : 1) * zoom})`,
              boxShadow: glow ? `0 0 0 ${3 * glow}px ${TEAL}, 0 0 ${80 * glow}px rgba(45,212,191,0.6), 0 30px 80px -20px rgba(0,0,0,0.55)` : (glass().boxShadow as string),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 26,
              fontFamily: FONT,
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 30% 20%, ${t.tint}, rgba(0,0,0,0) 70%)` }} />
            <div style={{ position: "relative" }}>
              <Icon name={t.icon} size={110} />
            </div>
            <div style={{ position: "relative", fontWeight: 700, fontSize: 46, color: "#fff", letterSpacing: "-0.02em" }}>{t.label}</div>
          </div>
        );
      })}
      <Touch keys={[{ at: 70, x: 1500, y: 960 }, { at: 112, x: tileX(0) + TILE / 2, y: TILE_Y + TILE / 2 }]} press={[TILE_PRESS]} from={70} to={TILE_PRESS + 18} />
    </AbsoluteFill>
  );
};

// ---------- 5 · the service, one feature at a time ----------
type Feat = {
  readonly kicker: string;
  readonly title: string;
  readonly sub: string;
  readonly src: string;
  readonly kind?: "phone" | "tablet";
  readonly bg: string;
  readonly bgFrom?: number;
  readonly chip: { readonly src: string; readonly crop: readonly [number, number, number, number]; readonly imgW?: number; readonly w: number; readonly to: readonly [number, number] }; // to: offset from the default spot
  readonly tap?: { readonly at: readonly [number, number]; readonly frame: number; readonly next?: string };
  readonly scroll?: number;
  readonly pill: string;
};

export const FEATS: readonly Feat[] = [
  { kicker: "SALA · 01", title: "La serata,\n*dal vivo.*", sub: "Chi è a tavola, chi deve arrivare, quanti coperti mancano. Aggiornato in tempo reale.", src: "shots/serata.jpg", bg: "bg-sala.mp4", chip: { src: "shots/serata.jpg", crop: [30, 905, 830, 1225], w: 420, to: [0, 0] }, pill: "Avanti" },
  { kicker: "SALA · 02", title: "La sala,\n*tavolo per tavolo.*", sub: "Libero, prenotato o arrivato: lo vedi a colpo d'occhio.", src: "shots/mappa.jpg", bg: "bg-sala.mp4", bgFrom: 4, chip: { src: "shots/mappa.jpg", crop: [60, 680, 800, 1200], w: 400, to: [0, 0] }, pill: "Avanti" },
  { kicker: "SALA · 03", title: "La comanda\n*parte dal tavolo.*", sub: "Un tocco per piatto, divisa per uscite. E arriva subito in cucina.", src: "shots/comanda_prima.jpg", bg: "bg-bar.mp4", bgFrom: 3, tap: { at: [774, 566], frame: 52, next: "shots/comanda.jpg" }, chip: { src: "shots/comanda.jpg", crop: [30, 505, 830, 760], w: 440, to: [0, 0] }, pill: "Avanti" },
  { kicker: "CUCINA · 04", title: "In cucina,\n*in tempo reale.*", sub: "Le comande in fila sul tablet, con le allergie in evidenza.", src: "shots/cucina.jpg", kind: "tablet", bg: "bg-cucina.mp4", chip: { src: "shots/cucina.jpg", crop: [615, 290, 1175, 1000], imgW: 1536, w: 300, to: [0, 0] }, pill: "Avanti" },
  { kicker: "CASSA · 05", title: "Il conto\n*è già pronto.*", sub: "Piatti e coperti sono già nel conto. Dividi e incassi.", src: "shots/cassa.jpg", bg: "bg-bar.mp4", bgFrom: 8, tap: { at: [643, 1247], frame: 70 }, chip: { src: "shots/cassa.jpg", crop: [30, 1010, 830, 1310], w: 430, to: [0, 0] }, pill: "E per chi gestisce" },
];

const Feature: React.FC<{ readonly f: Feat }> = ({ f }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const kind = f.kind ?? "phone";
  const dw = kind === "tablet" ? 700 : 430;
  const g = screenGeometry(kind, dw);
  const dx = kind === "tablet" ? 1050 : 1200, dy = (H - g.height) / 2;
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  const leave = interpolate(frame, [FEAT - 12, FEAT], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  const ry = -13 + 3 * Math.sin(frame / 40), rx = 3 + Math.sin(frame / 50);
  const chipS = spring({ frame: frame - 34, fps, config: { damping: 13, stiffness: 110 } });
  const after = f.tap?.next ? interpolate(frame, [f.tap.frame + 2, f.tap.frame + 8], [0, 1], cl) : 0;
  const scroll = f.scroll ? interpolate(frame, [20, 110], [0, f.scroll], { ...cl, easing: io }) : 0;
  const tapX = f.tap ? g.bezel + f.tap.at[0] * g.scale : 0;
  const tapY = f.tap ? g.bezel + g.status + f.tap.at[1] * g.scale - scroll * g.scale : 0;
  const centre = [dx + dw / 2, dy + g.height / 2];
  // the piece lands on the left edge of the device, low, clear of the text
  const chipH = ((f.chip.crop[3] - f.chip.crop[1]) * f.chip.w) / (f.chip.crop[2] - f.chip.crop[0]);
  const land = [dx + 20 + f.chip.to[0], Math.min(H - chipH / 2 - 150, dy + g.height * 0.72) + f.chip.to[1]];
  const chipX = centre[0] + (land[0] - centre[0]) * chipS, chipY = centre[1] + (land[1] - centre[1]) * chipS;
  return (
    <AbsoluteFill style={{ opacity: 1 - leave * 0.9, filter: leave ? `blur(${leave * 10}px)` : undefined, transform: `translateX(${-leave * 160}px)` }}>
      <Footage src={f.bg} from={f.bgFrom} dim={0.5} zoom={[1.04, 1.0]} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 70%)" }} />
      <Flare seed={f.kicker} opacity={0.2} />
      <div style={{ position: "absolute", left: 130, top: 250, width: 1060 }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: "0.28em", color: TEAL, opacity: interpolate(frame, [4, 12], [0, 1], cl) }}>{f.kicker}</div>
        <Words text={f.title} at={8} size={110} align="left" style={{ marginTop: 22 }} />
        <div style={{ marginTop: 34, width: 700, fontFamily: FONT, fontWeight: 500, fontSize: 38, lineHeight: 1.35, color: "rgba(255,255,255,0.78)", opacity: interpolate(frame, [26, 38], [0, 1], cl), transform: `translateY(${interpolate(frame, [26, 38], [16, 0], cl)}px)` }}>{f.sub}</div>
      </div>
      {/* the device, floating */}
      <div style={{ position: "absolute", left: dx, top: dy, width: dw, height: g.height, transform: `perspective(2200px) translateX(${(1 - enter) * 420}px) rotateY(${ry - (1 - enter) * 25}deg) rotateX(${rx}deg) translateY(${Math.sin(frame / 22) * 8}px)`, opacity: Math.min(1, enter * 1.5) }}>
        <Device kind={kind} src={f.src} width={dw} scroll={scroll} next={f.tap?.next} nextOpacity={after} />
        {f.tap && frame >= f.tap.frame - 30 && frame < f.tap.frame + 18 ? (
          <div style={{ position: "absolute", inset: 0, transform: "scale(1)" }}>
            <Touch keys={[{ at: f.tap.frame - 30, x: tapX + 160, y: tapY + 240 }, { at: f.tap.frame - 6, x: tapX, y: tapY }]} press={[f.tap.frame]} from={f.tap.frame - 30} to={f.tap.frame + 18} />
          </div>
        ) : null}
      </div>
      {/* a piece of the screen comes out of it */}
      {frame >= 34 ? <Chip src={f.chip.src} crop={f.chip.crop} imgW={f.chip.imgW} w={f.chip.w} style={{ left: chipX - f.chip.w / 2, top: chipY - chipH / 2, opacity: Math.min(1, chipS * 1.5), transform: `perspective(1600px) rotateY(${10 * chipS}deg) scale(${0.3 + 0.7 * chipS})` }} /> : null}
      <NextPill label={f.pill} start={FEAT - 52} end={FEAT - 8} />
    </AbsoluteFill>
  );
};

// ---------- 6 · for whoever runs the place ----------
const MANAGE = [
  { word: "Incassi.", sub: "Coperti, incasso medio e piatti più venduti.", src: "shots/andamento_full.jpg", scroll: 700 },
  { word: "Fatture.", sub: "La fattura elettronica si legge da sola.", src: "shots/fattura_full.jpg", scroll: 900 },
  { word: "Magazzino.", sub: "Ti dice cosa sta finendo, prima che finisca.", src: "shots/magazzino_full.jpg", scroll: 800 },
  { word: "Turni.", sub: "Li fai tu, lo staff li vede subito.", src: "shots/turni_full.jpg", scroll: 900 },
];
export const MANAGE_START = 70, MANAGE_STEP = 60;

const Manage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const deckIn = spring({ frame: frame - MANAGE_START + 6, fps, config: { damping: 16 } });
  const finale = interpolate(frame, [MANAGE_START + 4 * MANAGE_STEP, MANAGE_START + 4 * MANAGE_STEP + 20], [0, 1], { ...cl, easing: io });
  const dw = 330;
  const g = screenGeometry("phone", dw);
  return (
    <AbsoluteFill style={{ opacity: interpolate(frame, [345, 360], [1, 0], cl) }}>
      <Footage src="bg-luci.mp4" from={4} dim={0.62} zoom={[1.0, 1.1]} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Words text={"E per chi *gestisce.*"} at={6} out={58} size={140} />
      </AbsoluteFill>
      {frame >= MANAGE_START - 8 ? (
        <AbsoluteFill style={{ opacity: 1 - finale * 0.85, filter: finale ? `blur(${finale * 8}px)` : undefined }}>
          {/* the phones, one behind the other; the one being named steps forward */}
          <div style={{ position: "absolute", inset: 0, perspective: 2400, perspectiveOrigin: "70% 50%" }}>
            {MANAGE.map((m, i) => {
              const a = spring({ frame: frame - MANAGE_START - i * MANAGE_STEP, fps, config: { damping: 15 } }) - spring({ frame: frame - MANAGE_START - (i + 1) * MANAGE_STEP, fps, config: { damping: 15 } });
              const isLast = i === 3 ? spring({ frame: frame - MANAGE_START - 3 * MANAGE_STEP, fps, config: { damping: 15 } }) : 0;
              const on = Math.max(0, Math.min(1, i === 3 ? isLast : a));
              const x = 860 + i * 175;
              const scroll = interpolate(frame, [MANAGE_START + i * MANAGE_STEP, MANAGE_START + (i + 1) * MANAGE_STEP + 20], [0, m.scroll], { ...cl, easing: io });
              return (
                <div key={i} style={{ position: "absolute", left: x, top: (H - g.height) / 2, width: dw, height: g.height, zIndex: on > 0.5 ? 10 : 4 - i, opacity: Math.min(1, deckIn * 1.4), transform: `translateY(${(1 - deckIn) * 300 - on * 20}px) translateZ(${on * 260 - i * 40}px) rotateY(${-32 + on * 22}deg)`, filter: `brightness(${0.45 + 0.55 * on})` }}>
                  <Device src={m.src} width={dw} scroll={scroll} style={{ boxShadow: `0 0 0 2px rgba(148,163,184,0.25), 0 60px 120px -30px rgba(0,0,0,0.85), 0 0 ${90 * on}px ${10 * on}px rgba(45,212,191,${0.5 * on})` }} />
                </div>
              );
            })}
          </div>
          <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0) 55%)" }} />
          {MANAGE.map((m, i) => {
            const t0 = MANAGE_START + i * MANAGE_STEP;
            return (
              <div key={i} style={{ position: "absolute", left: 140, top: 360 }}>
                <Words text={i % 2 ? `*${m.word}*` : m.word} at={t0 + 2} out={t0 + MANAGE_STEP - 10} size={150} align="left" stagger={0} />
                <div style={{ marginTop: 26, fontFamily: FONT, fontWeight: 500, fontSize: 40, color: "rgba(255,255,255,0.8)", opacity: interpolate(frame, [t0 + 8, t0 + 16, t0 + MANAGE_STEP - 10, t0 + MANAGE_STEP], [0, 1, 1, 0], cl) }}>{m.sub}</div>
              </div>
            );
          })}
        </AbsoluteFill>
      ) : null}
      {frame >= MANAGE_START + 4 * MANAGE_STEP ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Words text={"Tutto sotto *controllo.*"} at={MANAGE_START + 4 * MANAGE_STEP + 6} size={150} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- 7 · coming soon ----------
export const CTA_PRESS = 150;
const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chip = spring({ frame: frame - 44, fps, config: { damping: 14 } });
  const cta = spring({ frame: frame - 60, fps, config: { damping: 12 } });
  const pressed = frame >= CTA_PRESS - 2 && frame < CTA_PRESS + 5;
  const glow = interpolate(frame, [CTA_PRESS, CTA_PRESS + 12, CTA_PRESS + 60], [0, 1, 0.5], cl);
  const shine = interpolate(frame, [90, 120], [-40, 140], cl);
  return (
    <AbsoluteFill style={{ opacity: interpolate(frame, [250, 270], [1, 0], cl) }}>
      <Footage src="bg-luci.mp4" from={6} dim={0.55} zoom={[1.1, 1.0]} />
      <Flare seed="end" opacity={0.25} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 46 }}>
          <Logo size={190} at={4} />
          <Wordmark size={170} at={14} />
        </div>
        <div style={{ marginTop: 44, padding: "16px 36px", ...glass(999), fontFamily: FONT, fontWeight: 700, fontSize: 36, color: "#fff", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 14, opacity: Math.min(1, chip * 1.4), transform: `translateY(${(1 - chip) * 20}px)` }}>
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: TEAL, boxShadow: `0 0 16px ${TEAL}` }} />
          PRESTO DISPONIBILE
        </div>
        <div style={{ position: "relative", marginTop: 40, padding: "30px 74px", borderRadius: 999, backgroundImage: GRAD, color: "#042f2e", fontFamily: FONT, fontWeight: 800, fontSize: 54, overflow: "hidden", opacity: Math.min(1, cta * 1.5), transform: `scale(${(0.7 + 0.3 * cta) * (pressed ? 0.95 : 1)})`, boxShadow: `0 24px 70px -15px rgba(45,212,191,${0.6 + 0.4 * glow}), 0 0 ${70 * glow}px rgba(94,234,212,${0.8 * glow})` }}>
          Prenota una visita
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `${shine}%`, width: "28%", background: "linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,0.7), rgba(255,255,255,0))", transform: "skewX(-20deg)" }} />
        </div>
        <div style={{ marginTop: 34, fontFamily: FONT, fontWeight: 700, fontSize: 42, color: "rgba(255,255,255,0.9)", opacity: interpolate(frame, [76, 88], [0, 1], cl) }}>salaflow.com</div>
      </AbsoluteFill>
      <Touch keys={[{ at: 112, x: 1420, y: 980 }, { at: CTA_PRESS - 8, x: W / 2 + 120, y: 735 }]} press={[CTA_PRESS]} from={112} to={CTA_PRESS + 20} />
    </AbsoluteFill>
  );
};

export const Presentazione: React.FC<{ readonly music: string }> = ({ music }) => {
  const { fps } = useVideoConfig();
  const S = SECTIONS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence name="Sabato sera" from={S.open} durationInFrames={S.chaos - S.open} premountFor={fps}>
        <Open />
      </Sequence>
      <Sequence name="Il caos" from={S.chaos} durationInFrames={S.reveal - S.chaos} premountFor={fps}>
        <Chaos />
      </Sequence>
      <Sequence name="SalaFlow" from={S.reveal} durationInFrames={S.tiles - S.reveal} premountFor={fps}>
        <Reveal />
      </Sequence>
      <Sequence name="Tutto il locale" from={S.tiles} durationInFrames={S.features - S.tiles} premountFor={fps}>
        <Tiles />
      </Sequence>
      {FEATS.map((f, i) => (
        <Sequence key={i} name={f.kicker} from={S.features + i * FEAT} durationInFrames={FEAT} premountFor={fps}>
          <Feature f={f} />
        </Sequence>
      ))}
      <Sequence name="Gestione" from={S.manage} durationInFrames={S.close - S.manage} premountFor={fps}>
        <Manage />
      </Sequence>
      <Sequence name="Presto disponibile" from={S.close} durationInFrames={S.end - S.close} premountFor={fps}>
        <Close />
      </Sequence>
      <Audio src={staticFile(music)} premountFor={fps} />
    </AbsoluteFill>
  );
};
