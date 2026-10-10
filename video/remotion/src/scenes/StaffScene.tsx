import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Device } from "../components/Device";
import { Headline, Kicker } from "../components/Headline";
import { C, FONT, clamp } from "../theme";

// Shifts and opening/closing checklists, side by side.
export const StaffScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: frame - 2, fps, config: { damping: 20, stiffness: 95 } });
  const b = spring({ frame: frame - 8, fps, config: { damping: 20, stiffness: 95 } });
  const ease = { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) };
  const subIn = spring({ frame: frame - 14, fps, config: { damping: 20 } });
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 140 }}>
        <Kicker label="Gestione" index="06" />
        <div style={{ marginTop: 36, width: 980 }}>
          <Headline text="Turni e checklist, | *per tutto lo staff*." delay={4} size={86} />
        </div>
        <div style={{ marginTop: 24, width: 900, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 44, lineHeight: 1.25, color: C.muted, opacity: subIn, translate: `0px ${(1 - subIn) * 24}px` }}>
          Turni che tutti vedono, liste di apertura e chiusura.
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ perspective: 2400 }}>
        <Device
          src="shots/turni_full.jpg"
          width={470}
          scroll={interpolate(frame, [14, 90], [3150, 3880], ease)}
          style={{ left: 50, top: 740, translate: `0px ${(1 - a) * 1000}px`, rotate: `y ${10 - frame * 0.03}deg` }}
        />
        <Device
          src="shots/checklist_full.jpg"
          width={470}
          scroll={interpolate(frame, [24, 100], [0, 560], ease)}
          style={{ left: 560, top: 800, translate: `0px ${(1 - b) * 1000}px`, rotate: `y ${-10 + frame * 0.03}deg` }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
