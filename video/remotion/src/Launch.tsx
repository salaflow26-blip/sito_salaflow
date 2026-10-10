import { Audio } from "@remotion/media";
import { linearTiming, springTiming, TransitionSeries } from "@remotion/transitions";
import { blurSlide } from "@remotion/transitions/blur-slide";
import { iris } from "@remotion/transitions/iris";
import { pushCut } from "@remotion/transitions/push-cut";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, Easing, staticFile, useVideoConfig } from "remotion";
import { LightLeakOverlay } from "./components/LightLeakOverlay";
import { F } from "./features";
import { ChapterScene } from "./scenes/ChapterScene";
import { EndScene } from "./scenes/EndScene";
import { FeatureScene } from "./scenes/FeatureScene";
import { HookScene } from "./scenes/HookScene";
import { LogoScene } from "./scenes/LogoScene";
import { StaffScene } from "./scenes/StaffScene";
import { WallScene } from "./scenes/WallScene";

// Every cut lands on the music: the tracks are brought to 120 BPM, so one bar is 2 s = 60 frames.
// Hook and logo get 2 bars, every feature 2 bars (4 s), the chapter card 1, the wall 1.5, the end 2.5: 31 bars, 62 s.
// Transitions last 14 frames and are centred on the bar, so each sequence below is 7 frames longer on each side.
const cut = linearTiming({ durationInFrames: 14, easing: Easing.bezier(0.65, 0, 0.35, 1) });
const soft = springTiming({ config: { damping: 200 }, durationInFrames: 14 });

export const Launch: React.FC<{ readonly music: string }> = ({ music }) => {
  const { fps, width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#020617" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Gancio" durationInFrames={120} premountFor={fps}>
          <HookScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={30} premountFor={fps}>
          <LightLeakOverlay seed={3} hueShift={225} />
        </TransitionSeries.Overlay>
        <TransitionSeries.Sequence name="Logo" durationInFrames={127} premountFor={fps}>
          <LogoScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={soft} />
        <TransitionSeries.Sequence name="Serata" durationInFrames={134} premountFor={fps}>
          <FeatureScene {...F.serata} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={cut} />
        <TransitionSeries.Sequence name="Piantina" durationInFrames={134} premountFor={fps}>
          <FeatureScene {...F.mappa} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={blurSlide({ direction: "from-right" })} timing={cut} />
        <TransitionSeries.Sequence name="Comanda" durationInFrames={134} premountFor={fps}>
          <FeatureScene {...F.comanda} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={cut} />
        <TransitionSeries.Sequence name="Cucina" durationInFrames={134} premountFor={fps}>
          <FeatureScene {...F.cucina} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={blurSlide({ direction: "from-right" })} timing={cut} />
        <TransitionSeries.Sequence name="Cassa" durationInFrames={134} premountFor={fps}>
          <FeatureScene {...F.cassa} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={iris({ width, height })} timing={cut} />
        <TransitionSeries.Sequence name="Capitolo gestione" durationInFrames={74} premountFor={fps}>
          <ChapterScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={soft} />
        <TransitionSeries.Sequence name="Andamento" durationInFrames={134} premountFor={fps}>
          <FeatureScene {...F.andamento} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={cut} />
        <TransitionSeries.Sequence name="Fatture" durationInFrames={134} premountFor={fps}>
          <FeatureScene {...F.fattura} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={blurSlide({ direction: "from-right" })} timing={cut} />
        <TransitionSeries.Sequence name="Magazzino" durationInFrames={134} premountFor={fps}>
          <FeatureScene {...F.magazzino} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={cut} />
        <TransitionSeries.Sequence name="Utile" durationInFrames={134} premountFor={fps}>
          <FeatureScene {...F.utile} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={blurSlide({ direction: "from-right" })} timing={cut} />
        <TransitionSeries.Sequence name="Cameriere in più" durationInFrames={134} premountFor={fps}>
          <FeatureScene {...F.cameriere} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={cut} />
        <TransitionSeries.Sequence name="Staff" durationInFrames={134} premountFor={fps}>
          <StaffScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={soft} />
        <TransitionSeries.Sequence name="Muro" durationInFrames={97} premountFor={fps}>
          <WallScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={30} premountFor={fps}>
          <LightLeakOverlay seed={7} hueShift={225} />
        </TransitionSeries.Overlay>
        <TransitionSeries.Sequence name="Finale" durationInFrames={150} premountFor={fps}>
          <EndScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio src={staticFile(music)} premountFor={fps} />
    </AbsoluteFill>
  );
};
