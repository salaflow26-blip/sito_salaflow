import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Device } from "../components/Device";
import { Headline, Kicker } from "../components/Headline";
import { clamp } from "../theme";

// Shifts and opening/closing checklists, side by side.
export const StaffScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: frame - 2, fps, config: { damping: 20, stiffness: 95 } });
  const b = spring({ frame: frame - 8, fps, config: { damping: 20, stiffness: 95 } });
  const ease = { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) };
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <Kicker label="Gestione" index="06" />
        <div style={{ marginTop: 44, width: 980 }}>
          <Headline text="Turni e checklist, | *per tutto lo staff*." delay={4} size={86} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ perspective: 2400 }}>
        <Device
          src="shots/turni_full.jpg"
          width={470}
          scroll={interpolate(frame, [10, 60], [3150, 3880], ease)}
          style={{ left: 50, top: 700, translate: `0px ${(1 - a) * 1000}px`, rotate: `y ${10 - frame * 0.04}deg` }}
        />
        <Device
          src="shots/checklist_full.jpg"
          width={470}
          scroll={interpolate(frame, [16, 64], [0, 560], ease)}
          style={{ left: 560, top: 760, translate: `0px ${(1 - b) * 1000}px`, rotate: `y ${-10 + frame * 0.04}deg` }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
