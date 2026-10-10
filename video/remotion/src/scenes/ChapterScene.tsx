import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Headline } from "../components/Headline";
import { C, FONT } from "../theme";

const CHIPS = ["Andamento", "Fatture", "Magazzino", "Utile", "Personale", "Turni", "Checklist"];

// Second act: the management side of the app.
export const ChapterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: 960, marginTop: -120 }}>
          <Headline text="E per chi | *gestisce*." delay={2} size={140} stagger={4} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, width: 900, marginTop: 70 }}>
          {CHIPS.map((c, i) => {
            const s = spring({ frame: frame - 14 - i * 2, fps, config: { damping: 14, stiffness: 160 } });
            return (
              <div key={c} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.ink, padding: "14px 30px", borderRadius: 999, background: "rgba(148,163,184,0.12)", border: "2px solid rgba(148,163,184,0.25)", opacity: s, scale: String(0.6 + 0.4 * s) }}>
                {c}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
