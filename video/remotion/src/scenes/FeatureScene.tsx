import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Device, DeviceKind, Zoom, screenGeometry } from "../components/Device";
import { Headline, Kicker } from "../components/Headline";
import { C, FONT, clamp } from "../theme";

export type FeatureProps = {
  readonly kicker: string;
  readonly index: string;
  readonly title: string;
  // one plain line under the title: what the viewer is looking at
  readonly sub?: string;
  readonly src: string;
  readonly kind?: DeviceKind;
  readonly titleSize?: number;
  // [fromFrame, toFrame, fromPx, toPx] in screenshot pixels
  readonly scroll?: readonly [number, number, number, number];
  // region of the screenshot to lift out of the screen
  readonly zoom?: { readonly crop: readonly [number, number, number, number]; readonly scale?: number; readonly delay?: number; readonly src?: string };
  // a finger tap on the screen (screenshot pixels), optionally switching to the next screen
  readonly tap?: { readonly at: readonly [number, number]; readonly frame: number; readonly next?: string };
};

const W = 1080;

// One app feature: kicker, headline and a plain explanation on top; the device rises from below,
// a tap shows the action, then the important region lifts out of the screen and stays there.
export const FeatureScene: React.FC<FeatureProps> = ({ kicker, index, title, sub, src, kind = "phone", titleSize = 92, scroll, zoom, tap }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const width = kind === "phone" ? 600 : 760;
  const g = screenGeometry(kind, width);
  const left = (W - width) / 2;
  const top = kind === "phone" ? 680 : 740;

  const rise = spring({ frame: frame - 2, fps, config: { damping: 20, stiffness: 80, mass: 1 } });
  const sc = scroll
    ? interpolate(frame, [scroll[0], scroll[1]], [scroll[2], scroll[3]], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) })
    : 0;

  // tap: a fingertip presses, a ring spreads out
  const tf = tap ? frame - tap.frame : -1;
  const press = tap ? interpolate(tf, [-8, 0, 6, 14], [0, 1, 1, 0], clamp) : 0;
  const ring = tap ? interpolate(tf, [0, 16], [0, 1], clamp) : 0;
  const nextOpacity = tap && tap.next ? interpolate(tf, [2, 8], [0, 1], clamp) : 0;

  // zoom: from its place on the screen to a bigger card floating in front
  const zd = zoom?.delay ?? 44;
  const lift = zoom ? spring({ frame: frame - zd, fps, config: { damping: 16, stiffness: 100, mass: 0.9 } }) : 0;
  const zs = zoom?.scale ?? 1;
  const [cx, cy, cw, ch] = zoom?.crop ?? [0, 0, 0, 0];
  const regionX = left + g.bezel + (cx + cw / 2) * g.scale;
  const regionY = top + g.bezel + g.status + (cy + ch / 2 - sc) * g.scale;
  const finalY = Math.min(1730 - (ch * zs) / 2, Math.max(700 + (ch * zs) / 2, regionY - 30));
  const finalX = W / 2;
  const k = g.scale / zs;
  const curScale = k + (1 - k) * lift;
  const subIn = spring({ frame: frame - 14, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 140 }}>
        <Kicker label={kicker} index={index} delay={0} />
        <div style={{ marginTop: 36, width: 960 }}>
          <Headline text={title} delay={4} size={titleSize} />
        </div>
        {sub ? (
          <div
            style={{
              marginTop: 24,
              width: 900,
              textAlign: "center",
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 44,
              lineHeight: 1.25,
              color: C.muted,
              opacity: subIn,
              translate: `0px ${(1 - subIn) * 24}px`,
            }}
          >
            {sub}
          </div>
        ) : null}
      </AbsoluteFill>
      <AbsoluteFill style={{ perspective: 2600, perspectiveOrigin: "50% 30%" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            translate: `0px ${(1 - rise) * 1100}px`,
            rotate: `x ${4 + (1 - rise) * 30}deg`,
            scale: String(0.94 + 0.06 * rise + frame * 0.0003),
            transformOrigin: "50% 60%",
            transformStyle: "preserve-3d",
          }}
        >
          <Device
            kind={kind}
            src={src}
            next={tap?.next}
            nextOpacity={nextOpacity}
            width={width}
            scroll={sc}
            style={{ left, top, rotate: `y ${interpolate(frame, [0, durationInFrames], [-6, 4])}deg` }}
          >
            {tap ? (
              <div style={{ position: "absolute", left: tap.at[0] * g.scale, top: g.status + (tap.at[1] - sc) * g.scale }}>
                <div style={{ position: "absolute", left: -60, top: -60, width: 120, height: 120, borderRadius: "50%", border: "5px solid rgba(255,255,255,0.9)", opacity: (1 - ring) * (tf >= 0 ? 1 : 0), scale: String(0.4 + ring * 1.2) }} />
                <div style={{ position: "absolute", left: -34, top: -34, width: 68, height: 68, borderRadius: "50%", background: "rgba(255,255,255,0.85)", boxShadow: "0 6px 20px rgba(0,0,0,0.4)", opacity: press, scale: String(1.25 - 0.25 * press) }} />
              </div>
            ) : null}
            {zoom ? (
              <div
                style={{
                  position: "absolute",
                  left: cx * g.scale - 6,
                  top: g.status + (cy - sc) * g.scale - 6,
                  width: cw * g.scale + 12,
                  height: ch * g.scale + 12,
                  borderRadius: 18,
                  boxShadow: `0 0 0 2000px rgba(2,6,23,${0.55 * lift}), 0 0 0 3px rgba(45,212,191,${0.9 * lift})`,
                }}
              />
            ) : null}
          </Device>
        </div>
      </AbsoluteFill>
      {zoom ? (
        <Zoom
          src={zoom.src ?? tap?.next ?? src}
          crop={zoom.crop}
          scale={zs}
          imgW={kind === "phone" ? 860 : 1536}
          style={{
            left: finalX - (cw * zs) / 2,
            top: finalY - (ch * zs) / 2,
            opacity: interpolate(lift, [0, 0.15], [0, 1], clamp),
            translate: `${(regionX - finalX) * (1 - lift)}px ${(regionY - finalY) * (1 - lift) + (1 - rise) * 1100}px`,
            scale: String(curScale),
            rotate: `${-1.2 * lift}deg`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
