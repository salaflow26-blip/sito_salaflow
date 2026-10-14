import { Img, staticFile, useCurrentFrame } from "remotion";
import { HAND } from "../theme";
import { INK, Mode, RED, beat, pal } from "./style";

// Objects of the story. All drawn around their own centre, in the 1080×830 panel's units.

const PieEyes: React.FC<{ y?: number; gap?: number; size?: number; look?: number }> = ({ y = 0, gap = 22, size = 1, look = 0 }) => (
  <g transform={`translate(${look * 4} ${y}) scale(${size})`}>
    {[-gap, gap].map((x) => (
      <g key={x} transform={`translate(${x} 0)`}>
        <ellipse rx={10} ry={18} fill={INK} />
        <path d="M 2 -6 L 9 -14 L 10 -3 Z" fill="#fff" />
      </g>
    ))}
  </g>
);

export const Notebook: React.FC<{
  readonly x: number; readonly y: number; readonly scale?: number; readonly rot?: number;
  readonly face?: "smile" | "grin" | "sad" | "none"; readonly shrug?: boolean; readonly bounce?: boolean;
}> = ({ x, y, scale = 1, rot = 0, face = "smile", shrug = false, bounce = true }) => {
  const frame = useCurrentFrame();
  const b = beat(frame);
  const up = bounce ? b.bob * 10 : 0;
  const sh = shrug ? Math.max(0, Math.sin((frame / 30) * Math.PI)) : 0;
  return (
    <g transform={`translate(${x} ${y - up}) rotate(${rot + (bounce ? b.sway * 3 : 0)}) scale(${scale})`}>
      {shrug ? (
        <g>
          <path d={`M -70 10 Q -110 ${-10 - sh * 30} -120 ${-50 - sh * 30}`} stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d={`M 70 10 Q 110 ${-10 - sh * 30} 120 ${-50 - sh * 30}`} stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
          <circle cx={-120} cy={-56 - sh * 30} r={16} fill="#fff" stroke={INK} strokeWidth={4} />
          <circle cx={120} cy={-56 - sh * 30} r={16} fill="#fff" stroke={INK} strokeWidth={4} />
        </g>
      ) : null}
      <rect x={-78} y={-100} width={156} height={200} rx={12} fill="#8f1414" stroke={INK} strokeWidth={6} />
      <rect x={-70} y={-100} width={148} height={200} rx={10} fill={RED} stroke={INK} strokeWidth={6} />
      {[-48, -24, 0, 24, 48].map((cx) => (
        <g key={cx}>
          <circle cx={cx + 4} cy={-100} r={9} fill="#fff" stroke={INK} strokeWidth={4} />
        </g>
      ))}
      <rect x={-46} y={-70} width={100} height={30} rx={4} fill="#fff" stroke={INK} strokeWidth={4} />
      <text x={4} y={-49} textAnchor="middle" fontFamily="PJS, sans-serif" fontWeight={800} fontSize={13} fill={INK}>PRENOTAZIONI</text>
      {face !== "none" ? (
        <g transform="translate(4 30)">
          <PieEyes y={-10} gap={20} size={1} />
          {face === "sad" ? (
            <path d="M -20 36 Q 0 18 20 36" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          ) : face === "grin" ? (
            <path d="M -26 18 Q 0 52 26 18 Z" fill="#3a0a0a" stroke={INK} strokeWidth={4} />
          ) : (
            <path d="M -22 20 Q 0 40 22 20" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          )}
        </g>
      ) : null}
    </g>
  );
};

// An open notebook page in close-up, with handwriting that writes itself.
export const NotebookPage: React.FC<{
  readonly lines: readonly { text: string; at: number; strike?: number; y: number }[];
  readonly mode: Mode;
}> = ({ lines, mode }) => {
  const frame = useCurrentFrame();
  const c = pal(mode);
  return (
    <g>
      <rect x={140} y={40} width={800} height={760} rx={18} fill={RED} stroke={INK} strokeWidth={8} />
      <rect x={170} y={70} width={740} height={700} rx={8} fill={c.paper} stroke={INK} strokeWidth={5} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={190} x2={890} y1={150 + i * 52} y2={150 + i * 52} stroke={mode === "bw" ? "#b5b5b5" : "#9cc3e6"} strokeWidth={3} />
      ))}
      <line x1={260} x2={260} y1={80} y2={760} stroke={mode === "bw" ? "#8a8a8a" : "#e9a0a0"} strokeWidth={3} />
      {lines.map((l, i) => {
        const p = Math.max(0, Math.min(1, (frame - l.at) / 22));
        const s = l.strike !== undefined ? Math.max(0, Math.min(1, (frame - l.strike) / 8)) : 0;
        return (
          <g key={i}>
            <clipPath id={`w${i}`}>
              <rect x={270} y={l.y - 60} width={620 * p} height={90} />
            </clipPath>
            <text x={280} y={l.y} fontFamily={HAND} fontSize={64} fill="#1f2a44" clipPath={`url(#w${i})`}>{l.text}</text>
            {s > 0 ? <path d={`M 270 ${l.y - 18} L ${270 + 600 * s} ${l.y - 26}`} stroke="#1f2a44" strokeWidth={7} strokeLinecap="round" /> : null}
          </g>
        );
      })}
    </g>
  );
};

export const Phone: React.FC<{ readonly x: number; readonly y: number; readonly scale?: number; readonly ringing?: boolean; readonly mode: Mode }> = ({ x, y, scale = 1, ringing = true, mode }) => {
  const frame = useCurrentFrame();
  const shake = ringing ? Math.sin(frame * 2.2) * 9 : 0;
  const hop = ringing ? Math.abs(Math.sin(frame * 0.55)) * 26 : 0;
  const body = mode === "bw" ? "#1d1d1d" : "#1d1d1d";
  return (
    <g transform={`translate(${x} ${y - hop}) scale(${scale})`}>
      <ellipse cx={0} cy={hop + 70} rx={110} ry={14} fill="rgba(0,0,0,0.2)" />
      {ringing
        ? [0, 1, 2].map((i) => (
            <g key={i} opacity={((frame + i * 4) % 12) / 12 > 0.5 ? 1 : 0.35}>
              <path d={`M ${-130 - i * 22} ${-40 - i * 8} Q ${-150 - i * 22} 0 ${-130 - i * 22} ${40 + i * 8}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
              <path d={`M ${130 + i * 22} ${-40 - i * 8} Q ${150 + i * 22} 0 ${130 + i * 22} ${40 + i * 8}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
            </g>
          ))
        : null}
      <g transform={`rotate(${shake})`}>
        <path d="M -100 60 L -76 -30 Q 0 -46 76 -30 L 100 60 Q 0 74 -100 60 Z" fill={body} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <g transform={`translate(0 ${ringing ? -Math.abs(Math.sin(frame * 0.9)) * 18 : 0})`}>
          <path d="M -110 -46 Q -116 -86 -84 -88 L 84 -88 Q 116 -86 110 -46 L 76 -46 Q 70 -66 50 -64 L -50 -64 Q -70 -66 -76 -46 Z" fill={body} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        </g>
        <circle cx={0} cy={14} r={40} fill="#f2f2f2" stroke={INK} strokeWidth={5} />
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx={Math.cos((i / 8) * Math.PI * 2) * 26} cy={14 + Math.sin((i / 8) * Math.PI * 2) * 26} r={6} fill={INK} />
        ))}
        <g transform="translate(0 6)">
          <PieEyes y={-2} gap={13} size={0.6} />
        </g>
        <ellipse cx={0} cy={34} rx={10} ry={ringing ? 9 : 3} fill={INK} />
      </g>
    </g>
  );
};

export const PostIt: React.FC<{ readonly x: number; readonly y: number; readonly rot?: number; readonly scale?: number; readonly mode: Mode; readonly text?: string }> = ({ x, y, rot = 0, scale = 1, mode, text = "CELIACO!" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <rect x={-74} y={-70} width={148} height={140} fill="rgba(0,0,0,0.18)" transform="translate(6 8)" />
    <path d="M -74 -70 L 74 -70 L 74 52 Q 60 70 40 70 L -74 70 Z" fill={pal(mode).postit} stroke={INK} strokeWidth={5} />
    <text x={0} y={14} textAnchor="middle" fontFamily={HAND} fontSize={44} fill="#1f2a44">{text}</text>
  </g>
);

export const Plate: React.FC<{ readonly x: number; readonly y: number; readonly rot?: number; readonly scale?: number }> = ({ x, y, rot = 0, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <ellipse rx={62} ry={22} fill="#fff" stroke={INK} strokeWidth={5} />
    <ellipse rx={40} ry={13} fill="#eee" stroke={INK} strokeWidth={3} />
    <path d="M -26 -6 Q -14 -26 0 -10 Q 12 -28 24 -8 Q 10 0 -26 -6 Z" fill="#9a9a9a" stroke={INK} strokeWidth={4} />
  </g>
);

export const Question: React.FC<{ readonly x: number; readonly y: number; readonly scale?: number; readonly label?: string; readonly offset?: number }> = ({ x, y, scale = 1, label, offset = 0 }) => {
  const frame = useCurrentFrame();
  const b = beat(frame, offset);
  return (
    <g transform={`translate(${x} ${y - b.bob * 18}) rotate(${b.sway * 8}) scale(${scale})`}>
      <path d="M -40 -60 Q -40 -110 0 -110 Q 46 -110 46 -66 Q 46 -36 14 -22 Q 4 -16 4 0 L -18 0 Q -20 -26 0 -40 Q 22 -52 22 -66 Q 22 -86 0 -86 Q -18 -86 -18 -60 Z" fill={INK} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <circle cx={-7} cy={26} r={15} fill={INK} />
      <path d="M -26 -64 Q -26 -96 0 -98" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
      {label ? (
        <text x={0} y={92} textAnchor="middle" fontFamily="PJS, sans-serif" fontWeight={800} fontSize={34} fill={INK}>{label}</text>
      ) : null}
    </g>
  );
};

export const Calculator: React.FC<{ readonly x: number; readonly y: number; readonly unroll: number; readonly mode: Mode }> = ({ x, y, unroll, mode }) => {
  const c = pal(mode);
  const len = 40 + unroll * 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M -40 -120 L 40 -120 L 40 ${-120 + len * 0.5} Q 60 ${-120 + len * 0.7} 120 ${-120 + len * 0.62} L 160 ${-120 + len}`} stroke={INK} strokeWidth={6} fill="none" opacity={0} />
      <path d={`M -42 -110 L 42 -110 L 42 ${-110 + len} L -42 ${-110 + len} Z`} transform={`rotate(${-18 * unroll} 0 -110)`} fill={c.paper} stroke={INK} strokeWidth={5} />
      {Array.from({ length: Math.floor(len / 34) }).map((_, i) => (
        <line key={i} x1={-28} x2={18 + ((i * 7) % 12)} y1={-90 + i * 34} y2={-90 + i * 34} transform={`rotate(${-18 * unroll} 0 -110)`} stroke="#8a8a8a" strokeWidth={4} />
      ))}
      <rect x={-90} y={-130} width={180} height={230} rx={18} fill={mode === "bw" ? "#6a6a6a" : "#475569"} stroke={INK} strokeWidth={6} />
      <rect x={-68} y={-108} width={136} height={50} rx={6} fill={mode === "bw" ? "#dcdcdc" : "#bbf7d0"} stroke={INK} strokeWidth={4} />
      <text x={58} y={-72} textAnchor="end" fontFamily="PJS, sans-serif" fontWeight={800} fontSize={30} fill={INK}>€ ???</text>
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={-66 + (i % 4) * 34} y={-40 + Math.floor(i / 4) * 40} width={28} height={30} rx={6} fill="#f2f2f2" stroke={INK} strokeWidth={3} />
      ))}
    </g>
  );
};

export const Poster: React.FC<{ readonly x: number; readonly y: number; readonly scale?: number; readonly mode: Mode }> = ({ x, y, scale = 1, mode }) => {
  const c = pal(mode);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-230} y={-300} width={460} height={600} fill={c.paper} stroke={INK} strokeWidth={8} />
      <rect x={-210} y={-280} width={420} height={560} fill="none" stroke={INK} strokeWidth={4} />
      <text x={0} y={-215} textAnchor="middle" fontFamily="PJS, sans-serif" fontWeight={800} fontSize={44} fill={INK} letterSpacing={2}>È SEMPRE</text>
      <text x={0} y={-165} textAnchor="middle" fontFamily="PJS, sans-serif" fontWeight={800} fontSize={44} fill={RED} letterSpacing={2}>STATO COSÌ!</text>
      <g transform="translate(0 40)">
        <Notebook x={0} y={0} scale={0.95} face="grin" />
        <path d="M 80 -10 Q 120 -40 120 -80" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
        <circle cx={120} cy={-90} r={18} fill="#fff" stroke={INK} strokeWidth={4} />
        <path d="M 120 -108 L 120 -128" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      </g>
      <text x={0} y={250} textAnchor="middle" fontFamily="PJS, sans-serif" fontWeight={700} fontSize={26} fill={INK} letterSpacing={3}>IL QUADERNO NON SBAGLIA</text>
    </g>
  );
};

export const Lamp: React.FC<{ readonly x: number; readonly mode: Mode }> = ({ x, mode }) => {
  const frame = useCurrentFrame();
  const a = Math.sin(frame / 18) * 7;
  return (
    <g transform={`translate(${x} 0) rotate(${a})`}>
      <path d={`M 0 0 L 0 120`} stroke={INK} strokeWidth={5} />
      <path d="M -260 420 L -40 150 L 40 150 L 260 420 Z" fill={pal(mode).light} opacity={0.22} />
      <path d="M -60 160 Q 0 100 60 160 Z" fill={mode === "bw" ? "#3a3a3a" : "#14532d"} stroke={INK} strokeWidth={5} />
      <ellipse cx={0} cy={162} rx={18} ry={9} fill={pal(mode).light} stroke={INK} strokeWidth={3} />
    </g>
  );
};

export const Table: React.FC<{ readonly x: number; readonly y: number; readonly w?: number; readonly mode: Mode }> = ({ x, y, w = 300, mode }) => {
  const c = pal(mode);
  const n = 8;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 + 20} y={20} width={14} height={120} fill={INK} />
      <rect x={w / 2 - 34} y={20} width={14} height={120} fill={INK} />
      <path d={`M ${-w / 2} 0 L ${w / 2} 0 L ${w / 2 + 10} 60 L ${-w / 2 - 10} 60 Z`} fill={c.cloth} stroke={INK} strokeWidth={5} />
      {Array.from({ length: n }).map((_, i) =>
        i % 2 ? <rect key={i} x={-w / 2 + (i * w) / n} y={2} width={w / n} height={28} fill={c.clothCheck} /> : <rect key={i} x={-w / 2 + (i * w) / n} y={30} width={w / n} height={28} fill={c.clothCheck} />,
      )}
      <path d={`M ${-w / 2} 0 L ${w / 2} 0 L ${w / 2 + 10} 60 L ${-w / 2 - 10} 60 Z`} fill="none" stroke={INK} strokeWidth={5} />
    </g>
  );
};

export const Counter: React.FC<{ readonly x: number; readonly y: number; readonly w?: number; readonly mode: Mode }> = ({ x, y, w = 520, mode }) => {
  const c = pal(mode);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={0} width={w} height={240} fill={c.wood} stroke={INK} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-w / 2 + 20 + (i * (w - 40)) / 4} y={40} width={(w - 40) / 4 - 16} height={160} rx={6} fill="none" stroke={INK} strokeWidth={4} opacity={0.6} />
      ))}
      <rect x={-w / 2 - 20} y={-22} width={w + 40} height={26} rx={6} fill={mode === "bw" ? "#4a4a4a" : "#5b3417"} stroke={INK} strokeWidth={6} />
    </g>
  );
};

export const KitchenWindow: React.FC<{ readonly x: number; readonly y: number; readonly mode: Mode }> = ({ x, y, mode }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-200} y={-170} width={400} height={300} fill={mode === "bw" ? "#3a3a3a" : "#7c2d12"} stroke={INK} strokeWidth={8} />
      <rect x={-170} y={-140} width={340} height={230} fill={mode === "bw" ? "#1c1c1c" : "#3b1d0e"} />
      <rect x={-230} y={120} width={460} height={28} fill={mode === "bw" ? "#8a8a8a" : "#a16207"} stroke={INK} strokeWidth={6} />
      <rect x={-110} y={-230} width={220} height={52} rx={8} fill={pal(mode).paper} stroke={INK} strokeWidth={6} />
      <text x={0} y={-193} textAnchor="middle" fontFamily="PJS, sans-serif" fontWeight={800} fontSize={34} fill={INK} letterSpacing={4}>CUCINA</text>
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${-60 + i * 60} 60 q -18 -30 0 -60 q 18 -30 0 -60`} stroke="#d9d9d9" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.5 + 0.3 * Math.sin(frame / 6 + i)} transform={`translate(${Math.sin(frame / 8 + i) * 8} 0)`} />
      ))}
    </g>
  );
};

export const Bubble: React.FC<{ readonly x: number; readonly y: number; readonly text: string; readonly w?: number; readonly tail?: "left" | "right"; readonly size?: number }> = ({ x, y, text, w = 420, tail = "left", size = 46 }) => (
  <g transform={`translate(${x} ${y})`}>
    <path
      d={`M ${-w / 2} -60 Q ${-w / 2} -90 ${-w / 2 + 30} -90 L ${w / 2 - 30} -90 Q ${w / 2} -90 ${w / 2} -60 L ${w / 2} 30 Q ${w / 2} 60 ${w / 2 - 30} 60 L ${tail === "left" ? -w / 2 + 110 : w / 2 - 50} 60 L ${tail === "left" ? -w / 2 + 40 : w / 2 - 20} 120 L ${tail === "left" ? -w / 2 + 70 : w / 2 - 110} 60 L ${-w / 2 + 30} 60 Q ${-w / 2} 60 ${-w / 2} 30 Z`}
      fill="#fff"
      stroke={INK}
      strokeWidth={6}
      strokeLinejoin="round"
    />
    <text x={0} y={-2} textAnchor="middle" dominantBaseline="middle" fontFamily="PJS, sans-serif" fontWeight={800} fontSize={size} fill={INK}>{text}</text>
  </g>
);

// Today's smartphone with a real SalaFlow screenshot (colour scenes only).
export const Smartphone: React.FC<{ readonly x: number; readonly y: number; readonly scale?: number; readonly src: string; readonly rot?: number }> = ({ x, y, scale = 1, src, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <rect x={-150} y={-300} width={300} height={600} rx={44} fill="#0b1220" stroke={INK} strokeWidth={8} />
    <foreignObject x={-136} y={-286} width={272} height={572}>
      <div style={{ width: 272, height: 572, borderRadius: 34, overflow: "hidden", background: "#020617" }}>
        <Img src={staticFile(src)} style={{ width: 272, display: "block" }} />
      </div>
    </foreignObject>
    <rect x={-40} y={-276} width={80} height={18} rx={9} fill="#000" />
  </g>
);

export const Stars: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) rotate(${frame * 6})`}>
      {[0, 1, 2, 3].map((i) => (
        <path key={i} transform={`rotate(${i * 90}) translate(70 0) rotate(${-frame * 6})`} d="M 0 -18 L 5 -5 L 18 0 L 5 5 L 0 18 L -5 5 L -18 0 L -5 -5 Z" fill="#fff" stroke={INK} strokeWidth={3} />
      ))}
    </g>
  );
};
