import { useCurrentFrame } from "remotion";
import { Mode, beat, pal } from "./style";

export type Kind = "oste" | "ragazzo" | "cuoco" | "nonno";
export type Expr = "smile" | "grin" | "worry" | "shock" | "sad" | "hypno" | "smug";
type P = readonly [number, number];

export type ToonProps = {
  readonly kind: Kind;
  readonly mode: Mode;
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly flip?: boolean;
  readonly expr?: Expr;
  readonly talking?: boolean;
  // hand positions relative to the feet (y up is negative); defaults hang by the hips
  readonly handL?: P;
  readonly handR?: P;
  readonly holdL?: React.ReactNode;
  readonly holdR?: React.ReactNode;
  readonly look?: number; // -1 left … 1 right
  readonly bounce?: number;
  readonly lean?: number;
  readonly sweat?: boolean;
  readonly blink?: boolean;
  readonly offset?: number; // beat offset, so two characters do not move in lockstep
};

const hose = (a: P, b: P, bend: number) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return `M ${a[0]} ${a[1]} Q ${mx - (dy / len) * bend} ${my + (dx / len) * bend} ${b[0]} ${b[1]}`;
};

const Glove: React.FC<{ at: P; ink: string; fill: string; angle?: number }> = ({ at, ink, fill, angle = 0 }) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${angle})`}>
    <rect x={-17} y={-30} width={34} height={14} rx={6} fill={fill} stroke={ink} strokeWidth={5} />
    <circle r={25} fill={fill} stroke={ink} strokeWidth={5} />
    <path d="M -9 -4 L -9 12 M 0 -6 L 0 13 M 9 -4 L 9 12" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
  </g>
);

const PieEye: React.FC<{ cx: number; cy: number; ink: string; blink: number; look: number }> = ({ cx, cy, ink, blink, look }) => (
  <g transform={`translate(${cx + look * 5} ${cy}) scale(1 ${blink})`}>
    <ellipse rx={12} ry={22} fill={ink} />
    <path d="M 2 -8 L 11 -18 L 12 -4 Z" fill="#fff" />
  </g>
);

const Spiral: React.FC<{ cx: number; cy: number; rot: number; ink: string }> = ({ cx, cy, rot, ink }) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
    <circle r={20} fill="#fff" stroke={ink} strokeWidth={4} />
    <path d="M 0 0 C 4 -4 9 0 7 6 C 4 13 -8 12 -11 4 C -15 -7 -4 -17 8 -15 C 17 -13 21 -4 19 4" fill="none" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
  </g>
);

export const Toon: React.FC<ToonProps> = ({
  kind, mode, x, y, scale = 1, flip = false, expr = "smile", talking = false, handL, handR, holdL, holdR,
  look = 0, bounce = 1, lean = 0, sweat = false, blink = true, offset = 0,
}) => {
  const frame = useCurrentFrame();
  const c = pal(mode);
  const ink = c.ink;
  const b = beat(frame, offset);
  const bob = b.bob * 14 * bounce;
  const squash = 1 - (1 - b.bob) * 0.04 * bounce;
  const fat = kind === "oste" ? 1 : kind === "cuoco" ? 0.92 : kind === "nonno" ? 0.85 : 0.72;
  const bodyCol = c[kind];
  const hipY = -125, shY = -238, headY = -340;
  const shX = 56 * fat + 6;
  const hL: P = handL ?? [-shX - 14 + b.sway * 6 * bounce, -150];
  const hR: P = handR ?? [shX + 14 - b.sway * 6 * bounce, -150];
  const ft = (frame + offset) % 90;
  const blinkK = blink && ft > 84 ? 0.12 : 1;
  const mouthOpen = talking ? 0.35 + 0.65 * Math.abs(Math.sin((frame + offset) * 0.55)) : 0;
  const shoeY = -16, legBend = 10 + b.bob * 8 * bounce;

  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * scale} ${scale})`}>
      {/* shadow */}
      <ellipse cx={0} cy={4} rx={90 * fat + 20} ry={14} fill="rgba(0,0,0,0.18)" />
      <g transform={`translate(0 ${-bob}) rotate(${lean + b.sway * 2.5 * bounce}) scale(${2 - squash} ${squash})`}>
        {/* legs */}
        <path d={hose([-22 * fat - 6, hipY], [-34, shoeY - 10], -legBend)} stroke={ink} strokeWidth={17} fill="none" strokeLinecap="round" />
        <path d={hose([22 * fat + 6, hipY], [34, shoeY - 10], legBend)} stroke={ink} strokeWidth={17} fill="none" strokeLinecap="round" />
        <ellipse cx={-46} cy={shoeY + bob} rx={40} ry={19} fill={c.shoe} stroke={ink} strokeWidth={5} />
        <ellipse cx={46} cy={shoeY + bob} rx={40} ry={19} fill={c.shoe} stroke={ink} strokeWidth={5} />
        <ellipse cx={-56} cy={shoeY - 6 + bob} rx={10} ry={5} fill="rgba(255,255,255,0.35)" />
        <ellipse cx={36} cy={shoeY - 6 + bob} rx={10} ry={5} fill="rgba(255,255,255,0.35)" />
        {/* arms behind body */}
        <path d={hose([-shX, shY], hL, 22)} stroke={ink} strokeWidth={15} fill="none" strokeLinecap="round" />
        <path d={hose([shX, shY], hR, -22)} stroke={ink} strokeWidth={15} fill="none" strokeLinecap="round" />
        {/* body */}
        <ellipse cx={0} cy={-185} rx={80 * fat + 8} ry={98} fill={bodyCol} stroke={ink} strokeWidth={6} />
        {kind === "oste" ? (
          <>
            <path d="M -48 -238 Q 0 -252 48 -238 L 62 -118 Q 0 -96 -62 -118 Z" fill={c.apron} stroke={ink} strokeWidth={5} />
            <path d="M -40 -150 Q 0 -140 40 -150" stroke={ink} strokeWidth={4} fill="none" />
            <path d="M -30 -268 L -2 -256 L -30 -244 Z M 30 -268 L 2 -256 L 30 -244 Z" fill={mode === "bw" ? ink : "#b91c1c"} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
          </>
        ) : null}
        {kind === "ragazzo" ? (
          <>
            <path d="M -18 -270 L 0 -238 L 18 -270" fill="#fff" stroke={ink} strokeWidth={5} strokeLinejoin="round" />
            <circle cx={0} cy={-205} r={5} fill={ink} />
            <circle cx={0} cy={-175} r={5} fill={ink} />
          </>
        ) : null}
        {kind === "cuoco" ? (
          <>
            <circle cx={-18} cy={-215} r={6} fill={ink} />
            <circle cx={18} cy={-215} r={6} fill={ink} />
            <circle cx={-18} cy={-180} r={6} fill={ink} />
            <circle cx={18} cy={-180} r={6} fill={ink} />
            <path d="M -40 -268 Q 0 -250 40 -268 L 34 -252 Q 0 -238 -34 -252 Z" fill={mode === "bw" ? "#9a9a9a" : "#ef4444"} stroke={ink} strokeWidth={4} />
          </>
        ) : null}
        {kind === "nonno" ? <path d="M -6 -275 L -6 -110 M 6 -275 L 6 -110" stroke={mode === "bw" ? "#8a8a8a" : "#a8988b"} strokeWidth={6} /> : null}
        {/* gloves and what they hold */}
        <Glove at={hL} ink={ink} fill={c.glove} angle={-20} />
        <Glove at={hR} ink={ink} fill={c.glove} angle={20} />
        {holdL ? <g transform={`translate(${hL[0]} ${hL[1]})`}>{holdL}</g> : null}
        {holdR ? <g transform={`translate(${hR[0]} ${hR[1]})`}>{holdR}</g> : null}
        {/* head */}
        <g transform={`translate(0 ${headY}) rotate(${b.wiggle * 2 * bounce})`}>
          <circle cx={-68} cy={8} r={15} fill={c.skin} stroke={ink} strokeWidth={5} />
          <circle cx={68} cy={8} r={15} fill={c.skin} stroke={ink} strokeWidth={5} />
          <ellipse cx={0} cy={0} rx={70} ry={68} fill={c.skin} stroke={ink} strokeWidth={6} />
          {kind === "oste" ? <path d="M -66 -10 Q -72 -40 -50 -46 Q -58 -26 -52 -12 Z M 66 -10 Q 72 -40 50 -46 Q 58 -26 52 -12 Z" fill={c.hair} stroke={ink} strokeWidth={3} /> : null}
          {kind === "ragazzo" ? (
            <path d="M -68 -38 Q -62 -96 0 -98 Q 62 -96 68 -38 Q 104 -36 116 -24 Q 60 -30 -68 -38 Z" fill={c.cap} stroke={ink} strokeWidth={5} strokeLinejoin="round" />
          ) : null}
          {kind === "cuoco" ? (
            <path d="M -50 -48 Q -96 -86 -58 -118 Q -44 -160 0 -142 Q 44 -160 58 -118 Q 96 -86 50 -48 Z" fill="#fff" stroke={ink} strokeWidth={5} strokeLinejoin="round" />
          ) : null}
          {kind === "nonno" ? <path d="M -66 -6 Q -80 -32 -54 -38 Q -62 -18 -56 -4 Z M 66 -6 Q 80 -32 54 -38 Q 62 -18 56 -4 Z" fill="#fff" stroke={ink} strokeWidth={3} /> : null}
          {/* eyes and brows */}
          {expr === "hypno" ? (
            <>
              <Spiral cx={-24} cy={-14} rot={frame * 18} ink={ink} />
              <Spiral cx={24} cy={-14} rot={frame * 18} ink={ink} />
            </>
          ) : (
            <>
              <PieEye cx={-24} cy={-14} ink={ink} blink={expr === "smug" ? 0.55 : blinkK} look={look} />
              <PieEye cx={24} cy={-14} ink={ink} blink={expr === "smug" ? 0.55 : blinkK} look={look} />
            </>
          )}
          {expr === "worry" || expr === "sad" ? <path d="M -40 -38 L -12 -48 M 40 -38 L 12 -48" stroke={ink} strokeWidth={5} strokeLinecap="round" /> : null}
          {expr === "smug" ? <path d="M -40 -38 L -10 -40 M 40 -46 L 10 -40" stroke={ink} strokeWidth={5} strokeLinecap="round" /> : null}
          {expr === "shock" ? <path d="M -40 -50 Q -24 -60 -8 -50 M 40 -50 Q 24 -60 8 -50" stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
          {/* nose, cheeks, mustache */}
          <ellipse cx={-38} cy={22} rx={11} ry={7} fill={c.cheek} />
          <ellipse cx={38} cy={22} rx={11} ry={7} fill={c.cheek} />
          <ellipse cx={0} cy={12} rx={kind === "oste" ? 17 : 11} ry={kind === "oste" ? 13 : 9} fill={mode === "bw" ? ink : c.nose} stroke={ink} strokeWidth={4} />
          {/* mouth */}
          {talking ? (
            <g transform="translate(0 40)">
              <ellipse rx={20} ry={4 + 13 * mouthOpen} fill={c.mouth} stroke={ink} strokeWidth={5} />
              <ellipse cy={6 * mouthOpen} rx={10} ry={5 * mouthOpen} fill={c.tongue} />
            </g>
          ) : expr === "shock" ? (
            <ellipse cx={0} cy={42} rx={13} ry={17} fill={c.mouth} stroke={ink} strokeWidth={5} />
          ) : expr === "worry" ? (
            <path d="M -26 44 Q -16 34 -6 44 Q 4 54 14 44 Q 22 36 28 42" stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          ) : expr === "sad" ? (
            <path d="M -24 50 Q 0 30 24 50" stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          ) : expr === "grin" || expr === "hypno" ? (
            <g>
              <path d="M -34 30 Q 0 76 34 30 Z" fill={c.mouth} stroke={ink} strokeWidth={5} strokeLinejoin="round" />
              <path d="M -26 34 L 26 34 L 22 42 L -22 42 Z" fill="#fff" />
              <ellipse cx={0} cy={54} rx={12} ry={6} fill={c.tongue} />
            </g>
          ) : expr === "smug" ? (
            <path d="M -22 40 Q 6 50 28 32" stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          ) : (
            <g>
              <path d="M -28 34 Q 0 62 28 34 Q 0 46 -28 34 Z" fill={c.mouth} stroke={ink} strokeWidth={5} strokeLinejoin="round" />
              <ellipse cx={0} cy={46} rx={9} ry={4} fill={c.tongue} />
            </g>
          )}
          {kind === "oste" || kind === "nonno" ? (
            <path
              d="M -2 26 Q -20 18 -38 26 Q -52 32 -50 20 Q -40 30 -30 22 Q -14 12 -2 22 Z M 2 26 Q 20 18 38 26 Q 52 32 50 20 Q 40 30 30 22 Q 14 12 2 22 Z"
              fill={kind === "nonno" ? "#fff" : ink}
              stroke={ink}
              strokeWidth={3}
              strokeLinejoin="round"
            />
          ) : null}
          {sweat ? (
            <g>
              {[0, 1].map((i) => {
                const t = ((frame + i * 20) % 40) / 40;
                return <path key={i} transform={`translate(${62 + i * 14} ${-30 + t * 60})`} d="M 0 -12 Q 9 2 0 8 Q -9 2 0 -12 Z" fill="#bfe6ff" stroke={ink} strokeWidth={3} opacity={1 - t} />;
              })}
            </g>
          ) : null}
        </g>
      </g>
    </g>
  );
};
