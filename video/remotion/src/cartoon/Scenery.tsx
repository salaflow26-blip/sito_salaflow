import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { INK, Mode, pal } from "./style";

export const PW = 1080;
export const PH = 830;

// Trattoria: wallpaper, wainscot, a framed picture, a window and a checkered floor in perspective.
export const Trattoria: React.FC<{ readonly mode: Mode; readonly floorY?: number }> = ({ mode, floorY = 600 }) => {
  const c = pal(mode);
  const tiles = [];
  for (let r = 0; r < 6; r++) {
    const y0 = floorY + (r * r * 9 + r * 14), y1 = floorY + ((r + 1) * (r + 1) * 9 + (r + 1) * 14);
    for (let k = -10; k < 10; k++) {
      const sp = (yy: number) => 1 + (yy - floorY) / 120;
      const x0a = 540 + k * 70 * sp(y0), x1a = 540 + (k + 1) * 70 * sp(y0);
      const x0b = 540 + k * 70 * sp(y1), x1b = 540 + (k + 1) * 70 * sp(y1);
      tiles.push(<path key={`${r}_${k}`} d={`M ${x0a} ${y0} L ${x1a} ${y0} L ${x1b} ${y1} L ${x0b} ${y1} Z`} fill={(r + k) % 2 ? c.floorA : c.floorB} />);
    }
  }
  return (
    <g>
      <rect x={0} y={0} width={PW} height={floorY} fill={c.wall} />
      {Array.from({ length: 28 }).map((_, i) => (
        <rect key={i} x={i * 40} y={0} width={14} height={floorY - 150} fill={mode === "bw" ? "#c2c2c2" : "#eecb92"} />
      ))}
      <rect x={0} y={floorY - 150} width={PW} height={150} fill={c.wallDark} stroke={INK} strokeWidth={5} />
      <line x1={0} x2={PW} y1={floorY - 150} y2={floorY - 150} stroke={INK} strokeWidth={8} />
      {/* window */}
      <rect x={760} y={90} width={220} height={250} fill={c.sky} stroke={INK} strokeWidth={8} />
      <line x1={870} x2={870} y1={90} y2={340} stroke={INK} strokeWidth={6} />
      <line x1={760} x2={980} y1={215} y2={215} stroke={INK} strokeWidth={6} />
      <path d="M 780 330 Q 820 300 850 330 Q 880 290 930 330 L 960 330 L 960 340 L 780 340 Z" fill={mode === "bw" ? "#9a9a9a" : "#86c06c"} />
      {/* picture */}
      <rect x={120} y={110} width={200} height={150} fill={c.paper} stroke={INK} strokeWidth={8} />
      <path d="M 140 240 L 190 170 L 230 220 L 260 190 L 300 240 Z" fill={mode === "bw" ? "#7a7a7a" : "#5b8f4e"} stroke={INK} strokeWidth={4} />
      <circle cx={270} cy={150} r={16} fill={mode === "bw" ? "#bdbdbd" : "#fbbf24"} stroke={INK} strokeWidth={4} />
      <rect x={0} y={floorY} width={PW} height={PH - floorY} fill={c.floorA} />
      {tiles}
      <line x1={0} x2={PW} y1={floorY} y2={floorY} stroke={INK} strokeWidth={6} />
    </g>
  );
};

export const Kitchen: React.FC<{ readonly mode: Mode }> = ({ mode }) => {
  const c = pal(mode);
  return (
    <g>
      <rect x={0} y={0} width={PW} height={PH} fill={mode === "bw" ? "#e2e2e2" : "#e0f2f1"} />
      {Array.from({ length: 14 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 80} x2={i * 80} y1={0} y2={560} stroke={mode === "bw" ? "#b0b0b0" : "#99d5cf"} strokeWidth={4} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={`h${i}`} x1={0} x2={PW} y1={i * 80} y2={i * 80} stroke={mode === "bw" ? "#b0b0b0" : "#99d5cf"} strokeWidth={4} />
      ))}
      <rect x={0} y={560} width={PW} height={270} fill={c.wood} stroke={INK} strokeWidth={6} />
      <rect x={-10} y={540} width={PW + 20} height={30} fill={mode === "bw" ? "#8a8a8a" : "#94a3b8"} stroke={INK} strokeWidth={6} />
      {[180, 420, 660, 900].map((x, i) => (
        <g key={x}>
          <path d={`M ${x - 40} 120 L ${x - 30} ${190 + (i % 2) * 20} L ${x + 30} ${190 + (i % 2) * 20} L ${x + 40} 120 Z`} fill={mode === "bw" ? "#6a6a6a" : "#64748b"} stroke={INK} strokeWidth={5} />
          <line x1={x} x2={x} y1={70} y2={120} stroke={INK} strokeWidth={5} />
        </g>
      ))}
    </g>
  );
};

// 1930s film: grain, scratches, dust, vignette, flicker and a little gate weave. Only on the black-and-white part.
export const OldFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const f2 = Math.floor(frame / 2);
  const flick = 0.04 + random(`fl${f2}`) * 0.05;
  const scratches = [0, 1, 2].filter((i) => random(`s${f2}_${i}`) > 0.55);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`} style={{ position: "absolute", inset: 0 }}>
        <filter id={`grain${f2 % 6}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f2 % 6} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={PW} height={PH} filter={`url(#grain${f2 % 6})`} opacity={0.16} style={{ mixBlendMode: "multiply" }} />
        {scratches.map((i) => {
          const x = random(`sx${f2}_${i}`) * PW;
          return <line key={i} x1={x} x2={x + (random(`sd${f2}_${i}`) - 0.5) * 20} y1={0} y2={PH} stroke={random(`sc${f2}_${i}`) > 0.5 ? "#fff" : "#000"} strokeWidth={1.5 + random(`sw${f2}_${i}`) * 2} opacity={0.5} />;
        })}
        {[0, 1, 2, 3, 4].map((i) => (random(`d${f2}_${i}`) > 0.6 ? <circle key={i} cx={random(`dx${f2}_${i}`) * PW} cy={random(`dy${f2}_${i}`) * PH} r={1.5 + random(`dr${f2}_${i}`) * 4} fill="#000" opacity={0.6} /> : null))}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flick }} />
    </AbsoluteFill>
  );
};

export const weave = (frame: number) => {
  const f2 = Math.floor(frame / 2);
  return `${(random(`wx${f2}`) - 0.5) * 3}px ${(random(`wy${f2}`) - 0.5) * 4}px`;
};
