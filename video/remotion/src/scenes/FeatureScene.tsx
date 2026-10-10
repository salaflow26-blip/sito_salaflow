import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Device, DeviceKind, Zoom, screenGeometry } from "../components/Device";
import { Headline, Kicker } from "../components/Headline";
import { clamp } from "../theme";

export type FeatureProps = {
  readonly kicker: string;
  readonly index: string;
  readonly title: string;
  readonly src: string;
  readonly kind?: DeviceKind;
  readonly titleSize?: number;
  // [fromFrame, toFrame, fromPx, toPx] in screenshot pixels
  readonly scroll?: readonly [number, number, number, number];
  // region of the screenshot to lift out of the screen
  readonly zoom?: { readonly crop: readonly [number, number, number, number]; readonly scale?: number; readonly delay?: number; readonly src?: string };
};

const W = 1080;

// One app feature: kicker + headline on top, the device rising from below, then a region lifting out of the screen.
export const FeatureScene: React.FC<FeatureProps> = ({ kicker, index, title, src, kind = "phone", titleSize = 92, scroll, zoom }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const width = kind === "phone" ? 600 : 760;
  const g = screenGeometry(kind, width);
  const left = (W - width) / 2;
  const top = kind === "phone" ? 640 : 700;

  const rise = spring({ frame: frame - 2, fps, config: { damping: 20, stiffness: 95, mass: 1 } });
  const sc = scroll
    ? interpolate(frame, [scroll[0], scroll[1]], [scroll[2], scroll[3]], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) })
    : 0;

  // zoom: from its place on the screen to a bigger card floating in front
  const zd = zoom?.delay ?? 24;
  const lift = zoom ? spring({ frame: frame - zd, fps, config: { damping: 15, stiffness: 120, mass: 0.8 } }) : 0;
  const zs = zoom?.scale ?? 1;
  const [cx, cy, cw, ch] = zoom?.crop ?? [0, 0, 0, 0];
  const regionX = left + g.bezel + (cx + cw / 2) * g.scale;
  const regionY = top + g.bezel + g.status + (cy + ch / 2 - sc) * g.scale;
  const finalY = Math.min(1720 - (ch * zs) / 2, Math.max(620 + (ch * zs) / 2, regionY - 30));
  const finalX = W / 2;
  const k = g.scale / zs;
  const curScale = k + (1 - k) * lift;

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <Kicker label={kicker} index={index} delay={0} />
        <div style={{ marginTop: 44, width: 960 }}>
          <Headline text={title} delay={4} size={titleSize} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ perspective: 2600, perspectiveOrigin: "50% 30%" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            translate: `0px ${(1 - rise) * 1000}px`,
            rotate: `x ${4 + (1 - rise) * 30}deg`,
            scale: String(0.94 + 0.06 * rise + frame * 0.0004),
            transformOrigin: "50% 60%",
            transformStyle: "preserve-3d",
          }}
        >
          <Device kind={kind} src={src} width={width} scroll={sc} style={{ left, top, rotate: `y ${interpolate(frame, [0, durationInFrames], [-7, 5])}deg` }}>
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
          src={zoom.src ?? src}
          crop={zoom.crop}
          scale={zs}
          imgW={kind === "phone" ? 860 : 1536}
          style={{
            left: finalX - (cw * zs) / 2,
            top: finalY - (ch * zs) / 2,
            opacity: interpolate(lift, [0, 0.15], [0, 1], clamp),
            translate: `${(regionX - finalX) * (1 - lift)}px ${(regionY - finalY) * (1 - lift) + (1 - rise) * 1000}px`,
            scale: String(curScale),
            rotate: `${-1.2 * lift}deg`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
