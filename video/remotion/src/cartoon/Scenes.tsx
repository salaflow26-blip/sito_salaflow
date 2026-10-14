import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, Calculator, Counter, KitchenWindow, Lamp, Notebook, NotebookPage, Phone, Plate, PostIt, Poster, Question, Smartphone, Stars, Table } from "./Props";
import { Kitchen, PH, PW, Trattoria } from "./Scenery";
import { INK, Mode, pal } from "./style";
import { Toon } from "./Toon";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// slow push-in so no shot is ever still
const Cam: React.FC<{ readonly children: React.ReactNode; readonly from?: number; readonly to?: number; readonly cx?: number; readonly cy?: number }> = ({ children, from = 1, to = 1.06, cx = PW / 2, cy = PH / 2 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = interpolate(frame, [0, durationInFrames], [from, to], cl);
  return <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>{children}</g>;
};

const Wall: React.FC<{ readonly mode: Mode }> = ({ mode }) => {
  const c = pal(mode);
  return (
    <g>
      <rect width={PW} height={PH} fill={c.wall} />
      {Array.from({ length: 28 }).map((_, i) => (
        <rect key={i} x={i * 40} y={0} width={14} height={PH} fill={mode === "bw" ? "#c2c2c2" : "#eecb92"} />
      ))}
    </g>
  );
};

const NB = (s = 0.42, face: "smile" | "grin" | "sad" = "smile") => <Notebook x={0} y={-40} scale={s} face={face} bounce={false} />;

// ---------- today, in colour ----------
export const C1: React.FC<{ mode: Mode }> = ({ mode }) => (
  <Cam>
    <Trattoria mode={mode} />
    <Lamp x={540} mode={mode} />
    <Table x={160} y={600} w={260} mode={mode} />
    <Toon kind="oste" mode={mode} x={400} y={770} scale={0.95} talking handR={[110, -320]} holdR={NB(0.45)} look={1} />
    <Toon kind="ragazzo" mode={mode} x={790} y={770} scale={0.9} flip expr="smug" handL={[-10, -200]} handR={[30, -215]} offset={7} />
  </Cam>
);

export const C2: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  return (
    <Cam from={1.02} to={1.1} cy={300}>
      <Trattoria mode={mode} floorY={700} />
      <Toon kind="oste" mode={mode} x={470} y={1060} scale={1.55} talking handR={[150, -430 - Math.sin(frame / 5) * 8]} holdR={NB(0.6, "grin")} look={1} />
      <Stars x={725} y={150} />
    </Cam>
  );
};

export const C3: React.FC<{ mode: Mode }> = ({ mode }) => (
  <Cam from={1.02} to={1.08} cy={300}>
    <Trattoria mode={mode} floorY={700} />
    <Toon kind="ragazzo" mode={mode} x={560} y={1060} scale={1.55} flip expr="smug" talking handL={[-10, -200]} handR={[30, -215]} />
  </Cam>
);

export const C4: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const count = Math.min(3, Math.floor(frame / 22));
  return (
    <Cam from={1.02} to={1.08} cy={300}>
      <Trattoria mode={mode} floorY={700} />
      <Toon kind="oste" mode={mode} x={520} y={1060} scale={1.55} talking handL={[-150, -300]} handR={[140, -330]} holdR={NB(0.55)} look={-1} />
      {["PRENOTAZIONI", "TAVOLI", "ALLERGIE"].slice(0, count).map((t, i) => (
        <g key={t} transform={`translate(${130 + i * 20} ${120 + i * 70}) rotate(-4)`}>
          <rect x={-10} y={-40} width={t.length * 24 + 20} height={56} rx={10} fill="#fff" stroke={INK} strokeWidth={5} />
          <text x={0} y={0} fontFamily="PJS, sans-serif" fontWeight={800} fontSize={34} fill={INK}>{t} ✓</text>
        </g>
      ))}
    </Cam>
  );
};

export const C5: React.FC<{ mode: Mode }> = ({ mode }) => (
  <Cam from={1.05} to={1.12} cy={250}>
    <Trattoria mode={mode} floorY={700} />
    <Toon kind="ragazzo" mode={mode} x={560} y={1060} scale={1.55} flip expr="smug" talking lean={-4} handL={[-10, -200]} handR={[30, -215]} />
  </Cam>
);

export const C6: React.FC<{ mode: Mode }> = ({ mode }) => (
  <Cam from={1.05} to={1.16} cy={250}>
    <Trattoria mode={mode} floorY={700} />
    <Toon kind="oste" mode={mode} x={520} y={1060} scale={1.55} expr="worry" sweat bounce={0.3} handR={[90, -200]} holdR={NB(0.5, "sad")} look={-1} />
  </Cam>
);

// ---------- the 1930s, black and white ----------
export const C7: React.FC<{ mode: Mode }> = ({ mode }) => (
  <Cam>
    <Trattoria mode={mode} />
    <Lamp x={430} mode={mode} />
    <Counter x={760} y={430} w={440} mode={mode} />
    <Notebook x={700} y={355} scale={0.42} face="smile" />
    <Table x={170} y={610} w={240} mode={mode} />
    <Toon kind="oste" mode={mode} x={430} y={780} scale={0.85} expr="grin" handL={[-90, -260]} />
  </Cam>
);

export const C8: React.FC<{ mode: Mode }> = ({ mode }) => (
  <Cam from={1} to={1.1}>
    <Wall mode={mode} />
    <Counter x={540} y={520} w={1000} mode={mode} />
    <Phone x={540} y={420} scale={1.35} mode={mode} />
    <Bubble x={830} y={150} text="DRIIIN!" w={320} tail="left" />
  </Cam>
);

export const C9: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const wob = Math.sin(frame / 4) * 8;
  return (
    <Cam>
      <Trattoria mode={mode} />
      <Toon kind="oste" mode={mode} x={540} y={800} scale={1.1} expr="worry" sweat talking
        handL={[-170, -430]} holdL={<g transform={`rotate(${wob})`}><Plate x={0} y={-30} /><Plate x={6} y={-62} /><Plate x={-4} y={-94} /></g>}
        handR={[95, -365]} holdR={<g transform="translate(-10 -10) scale(0.32)"><Phone x={0} y={0} mode={mode} /></g>} />
      <Plate x={820 + wob * 2} y={260 - Math.abs(Math.sin(frame / 7)) * 80} rot={frame * 12} />
    </Cam>
  );
};

export const C10: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const px = interpolate(frame, [8, 30, 40, 62], [290, 820, 290, 640], cl);
  const py = frame < 36 ? 230 : 334;
  return (
    <Cam from={1} to={1.05}>
      <rect width={PW} height={PH} fill={mode === "bw" ? "#6a6a6a" : "#7a4524"} />
      <NotebookPage mode={mode} lines={[{ text: "Rossi — 20:30", at: 8, y: 240 }, { text: "Bianchi ?? 21", at: 40, y: 344 }]} />
      <g transform={`translate(${px} ${py + Math.sin(frame) * 4}) rotate(30)`}>
        <rect x={-10} y={-150} width={20} height={150} fill={mode === "bw" ? "#9a9a9a" : "#fbbf24"} stroke={INK} strokeWidth={4} />
        <path d="M -10 0 L 0 24 L 10 0 Z" fill="#f2f2f2" stroke={INK} strokeWidth={4} />
      </g>
    </Cam>
  );
};

export const C11: React.FC<{ mode: Mode }> = ({ mode }) => (
  <Cam from={1.04} to={1.12} cx={450} cy={300}>
    <rect width={PW} height={PH} fill={mode === "bw" ? "#6a6a6a" : "#7a4524"} />
    <NotebookPage mode={mode} lines={[{ text: "Tav. 4 — Ferri", at: -30, y: 240, strike: 18 }, { text: "Tav. 6 !!! (forse)", at: 32, y: 344 }]} />
  </Cam>
);

export const C12: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [6, 20], [0, 1], { ...cl });
  return (
    <Cam>
      <Wall mode={mode} />
      <Notebook x={540} y={430} scale={1.6} face="sad" bounce={false} />
      <PostIt x={interpolate(t, [0, 1], [1250, 610])} y={interpolate(t, [0, 1], [-80, 330])} rot={interpolate(t, [0, 1], [180, -8])} mode={mode} scale={1.1} />
    </Cam>
  );
};

export const C13: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const t = frame / 70;
  return (
    <Cam>
      <Trattoria mode={mode} />
      <rect x={880} y={260} width={160} height={340} fill={mode === "bw" ? "#4a4a4a" : "#7a4524"} stroke={INK} strokeWidth={8} />
      <rect x={880} y={260} width={70} height={340} fill="#1a1a1a" />
      <PostIt x={200 + t * 760} y={330 - Math.sin(t * Math.PI * 3) * 120} rot={frame * 20} scale={0.7 * (1 - t * 0.5)} mode={mode} />
      <Toon kind="oste" mode={mode} x={260 + t * 220} y={790} scale={0.85} expr="shock" handR={[150, -380]} lean={14} />
    </Cam>
  );
};

export const C14: React.FC<{ mode: Mode }> = ({ mode }) => (
  <Cam>
    <Wall mode={mode} />
    <rect x={0} y={640} width={PW} height={190} fill={pal(mode).wallDark} stroke={INK} strokeWidth={6} />
    <KitchenWindow x={720} y={330} mode={mode} />
    <Toon kind="oste" mode={mode} x={250} y={820} scale={0.95} talking handL={[-60, -420]} handR={[150, -380]} look={1} />
    <Bubble x={560} y={110} text="DUE TAGLIATELLE! UNA SENZA…" w={700} size={38} tail="left" />
  </Cam>
);

export const C15: React.FC<{ mode: Mode }> = ({ mode }) => (
  <Cam>
    <Kitchen mode={mode} />
    <Toon kind="cuoco" mode={mode} x={540} y={800} scale={1.05} expr="worry" handL={[-110, -420]} handR={[120, -300]} />
    <Question x={760} y={250} scale={0.9} />
    <Bubble x={300} y={150} text="SENZA… CHE?" w={360} size={44} tail="right" />
  </Cam>
);

export const C16: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <Cam>
      <Trattoria mode={mode} />
      <Table x={620} y={560} w={420} mode={mode} />
      <Calculator x={640} y={420} unroll={interpolate(frame, [0, durationInFrames * 0.8], [0, 1], cl)} mode={mode} />
      <Toon kind="oste" mode={mode} x={250} y={800} scale={0.9} expr="sad" sweat bounce={0.4} handR={[120, -260]} lean={8} />
    </Cam>
  );
};

export const C17: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  return (
    <Cam>
      <Trattoria mode={mode} />
      <Toon kind="oste" mode={mode} x={540} y={830} scale={1.05} expr="worry" bounce={0.4} handL={[-80, -270]} handR={[80, -270]} holdR={<Notebook x={-80} y={-30} scale={0.55} face="sad" bounce={false} />} look={-1} />
      <Table x={540} y={640} w={520} mode={mode} />
      {[0, 1, 2].map((i) => (frame > 10 + i * 12 ? <Question key={i} x={300 + i * 240} y={150 + (i % 2) * 40} scale={0.55} offset={i * 5} /> : null))}
    </Cam>
  );
};

export const C18: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  return (
    <Cam>
      <Wall mode={mode} />
      {["INCASSO?", "SPESE?", "TI RESTA?"].map((l, i) => (frame > i * 28 ? <Question key={l} x={200 + i * 340} y={400} scale={1.15} label={l} offset={i * 5} /> : null))}
    </Cam>
  );
};

export const C19: React.FC<{ mode: Mode }> = ({ mode }) => (
  <Cam from={1} to={1.08}>
    <Wall mode={mode} />
    <Notebook x={540} y={460} scale={1.7} face="none" shrug bounce={false} />
    <g transform="translate(548 500) scale(1.7)">
      <path d="M -26 -16 Q -15 -28 -4 -18 M 26 -16 Q 15 -28 4 -18" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      <ellipse cx={-14} cy={6} rx={8} ry={14} fill={INK} />
      <ellipse cx={14} cy={6} rx={8} ry={14} fill={INK} />
      <path d="M -16 36 Q -8 30 0 36 Q 8 42 16 36" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  </Cam>
);

export const C20: React.FC<{ mode: Mode }> = ({ mode }) => (
  <Cam from={1} to={1.12}>
    <Wall mode={mode} />
    <Poster x={540} y={420} scale={1.2} mode={mode} />
  </Cam>
);

export const C21: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  return (
    <Cam>
      <Trattoria mode={mode} floorY={700} />
      <Toon kind="nonno" mode={mode} x={540} y={1000} scale={1.35} talking handR={[150 + Math.sin(frame * 0.8) * 22, -470]} handL={[-90, -220]} />
    </Cam>
  );
};

export const C22: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  return (
    <Cam>
      <Trattoria mode={mode} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = frame / 9 + (i * Math.PI) / 3;
        return i % 2 ? (
          <Plate key={i} x={540 + Math.cos(a) * 360} y={360 + Math.sin(a) * 200} rot={frame * 15} />
        ) : (
          <PostIt key={i} x={540 + Math.cos(a) * 360} y={360 + Math.sin(a) * 200} rot={-frame * 12} scale={0.5} mode={mode} text="?!" />
        );
      })}
      <Phone x={140} y={180} scale={0.6} mode={mode} />
      <Phone x={940} y={190} scale={0.6} mode={mode} />
      <Toon kind="oste" mode={mode} x={540} y={790} scale={0.95} expr="shock" sweat lean={Math.sin(frame / 3) * 14} handL={[-170, -420]} handR={[170, -420]} />
    </Cam>
  );
};

export const C23: React.FC<{ mode: Mode }> = ({ mode }) => (
  <Cam from={1.04} to={1.14} cy={260}>
    <Trattoria mode={mode} floorY={700} />
    <Toon kind="oste" mode={mode} x={540} y={1060} scale={1.55} expr="hypno" bounce={1.6} handR={[120, -260]} holdR={NB(0.5, "grin")} />
  </Cam>
);

// ---------- back to today, with SalaFlow ----------
export const C24: React.FC<{ mode: Mode }> = ({ mode }) => (
  <Cam>
    <Trattoria mode={mode} />
    <Lamp x={540} mode={mode} />
    <Toon kind="ragazzo" mode={mode} x={640} y={800} scale={1.0} talking handR={[-10, -430]} holdR={<Smartphone x={0} y={-60} scale={0.4} src="shots/serata.jpg" />} look={-1} />
    <Toon kind="oste" mode={mode} x={250} y={800} scale={0.9} expr="shock" handR={[90, -200]} holdR={NB(0.42)} look={1} offset={6} />
  </Cam>
);

const PhoneMontage: React.FC<{ mode: Mode; shots: readonly string[]; labels: readonly string[] }> = ({ mode, shots, labels }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const per = durationInFrames / shots.length;
  const i = Math.min(shots.length - 1, Math.floor(frame / per));
  const local = frame - i * per;
  const pop = interpolate(local, [0, 8], [0.92, 1], cl);
  return (
    <g>
      <rect width={PW} height={PH} fill={mode === "bw" ? "#cfcfcf" : "#0f766e"} />
      {Array.from({ length: 12 }).map((_, k) => (
        <circle key={k} cx={(k * 97 + frame * 2) % PW} cy={(k * 173) % PH} r={6 + (k % 3) * 4} fill="rgba(255,255,255,0.18)" />
      ))}
      <Smartphone x={330} y={420} scale={1.28 * pop} src={shots[i]} rot={-3} />
      {labels.map((l, k) => (
        <g key={l} transform={`translate(640 ${150 + k * 120})`} opacity={k <= i ? 1 : 0.35}>
          <rect x={0} y={-48} width={380} height={84} rx={42} fill={k === i ? "#fff" : "rgba(255,255,255,0.15)"} stroke={INK} strokeWidth={k === i ? 5 : 0} />
          <text x={36} y={8} fontFamily="PJS, sans-serif" fontWeight={800} fontSize={38} fill={k === i ? INK : "#fff"}>{k < i ? "✓ " : ""}{l}</text>
        </g>
      ))}
    </g>
  );
};

export const C25: React.FC<{ mode: Mode }> = ({ mode }) => (
  <PhoneMontage mode={mode} shots={["shots/serata.jpg", "shots/mappa.jpg", "shots/comanda.jpg", "shots/cassa.jpg"]} labels={["Prenotazioni", "Sala", "Comande", "Conto"]} />
);

export const C26: React.FC<{ mode: Mode }> = ({ mode }) => (
  <PhoneMontage mode={mode} shots={["shots/andamento.jpg", "shots/fatture.jpg", "shots/magazzino.jpg", "shots/turni.jpg"]} labels={["Incassi", "Fatture", "Magazzino", "Turni"]} />
);

export const C27: React.FC<{ mode: Mode }> = ({ mode }) => (
  <Cam from={1.02} to={1.1} cy={260}>
    <Trattoria mode={mode} floorY={700} />
    <Toon kind="oste" mode={mode} x={520} y={1060} scale={1.55} talking expr="worry" handR={[150, -330]} holdR={NB(0.55, "sad")} look={1} />
  </Cam>
);

export const C28: React.FC<{ mode: Mode }> = ({ mode }) => (
  <Cam from={1.02} to={1.1} cy={260}>
    <Trattoria mode={mode} floorY={700} />
    <Toon kind="ragazzo" mode={mode} x={560} y={1060} scale={1.55} flip talking expr="grin" handL={[-130, -300]} handR={[90, -330]} holdR={<Smartphone x={0} y={-60} scale={0.45} src="shots/andamento.jpg" />} />
  </Cam>
);

export const C29: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  return (
    <Cam>
      <Trattoria mode={mode} />
      <Lamp x={540} mode={mode} />
      <Table x={540} y={560} w={460} mode={mode} />
      <Toon kind="oste" mode={mode} x={330} y={800} scale={0.9} expr="grin" handR={[160, -250 + Math.sin(frame / 2) * 6]} holdR={NB(0.45, "grin")} />
      <Toon kind="ragazzo" mode={mode} x={790} y={800} scale={0.88} flip expr="smile" handR={[-20, -330]} holdR={<Smartphone x={0} y={-50} scale={0.33} src="shots/cassa.jpg" />} offset={7} />
      <Bubble x={420} y={120} text="RAGÙ DELLA NONNA" w={480} size={36} tail="left" />
    </Cam>
  );
};

export const SCENES: Record<string, React.FC<{ mode: Mode }>> = {
  c1: C1, c2: C2, c3: C3, c4: C4, c5: C5, c6: C6, c7: C7, c8: C8, c9: C9, c10: C10, c11: C11, c12: C12, c13: C13, c14: C14, c15: C15,
  c16: C16, c17: C17, c18: C18, c19: C19, c20: C20, c21: C21, c22: C22, c23: C23, c24: C24, c25: C25, c26: C26, c27: C27, c28: C28, c29: C29,
};
