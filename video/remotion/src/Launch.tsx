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

// Every cut lands on the music: bars 2, 4, 5.25, 6.5 … at 64.24 frames per bar (30 fps, 112 BPM).
// Transitions last 14 frames and are centred on the bar, so each sequence below is 7 frames longer on each side.
const cut = linearTiming({ durationInFrames: 14, easing: Easing.bezier(0.65, 0, 0.35, 1) });
const soft = springTiming({ config: { damping: 200 }, durationInFrames: 14 });

export const Launch: React.FC = () => {
  const { fps, width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#020617" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Gancio" durationInFrames={128} premountFor={fps}>
          <HookScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={30} premountFor={fps}>
          <LightLeakOverlay seed={3} hueShift={225} />
        </TransitionSeries.Overlay>
        <TransitionSeries.Sequence name="Logo" durationInFrames={136} premountFor={fps}>
          <LogoScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={soft} />
        <TransitionSeries.Sequence name="Serata" durationInFrames={94} premountFor={fps}>
          <FeatureScene {...F.serata} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={cut} />
        <TransitionSeries.Sequence name="Piantina" durationInFrames={95} premountFor={fps}>
          <FeatureScene {...F.mappa} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={blurSlide({ direction: "from-right" })} timing={cut} />
        <TransitionSeries.Sequence name="Comanda" durationInFrames={94} premountFor={fps}>
          <FeatureScene {...F.comanda} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={cut} />
        <TransitionSeries.Sequence name="Cucina" durationInFrames={94} premountFor={fps}>
          <FeatureScene {...F.cucina} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={blurSlide({ direction: "from-right" })} timing={cut} />
        <TransitionSeries.Sequence name="Cassa" durationInFrames={94} premountFor={fps}>
          <FeatureScene {...F.cassa} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={iris({ width, height })} timing={cut} />
        <TransitionSeries.Sequence name="Capitolo gestione" durationInFrames={63} premountFor={fps}>
          <ChapterScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={soft} />
        <TransitionSeries.Sequence name="Andamento" durationInFrames={78} premountFor={fps}>
          <FeatureScene {...F.andamento} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={cut} />
        <TransitionSeries.Sequence name="Fatture" durationInFrames={78} premountFor={fps}>
          <FeatureScene {...F.fattura} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={blurSlide({ direction: "from-right" })} timing={cut} />
        <TransitionSeries.Sequence name="Magazzino" durationInFrames={78} premountFor={fps}>
          <FeatureScene {...F.magazzino} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={cut} />
        <TransitionSeries.Sequence name="Utile" durationInFrames={79} premountFor={fps}>
          <FeatureScene {...F.utile} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={blurSlide({ direction: "from-right" })} timing={cut} />
        <TransitionSeries.Sequence name="Cameriere in più" durationInFrames={78} premountFor={fps}>
          <FeatureScene {...F.cameriere} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={cut} />
        <TransitionSeries.Sequence name="Staff" durationInFrames={78} premountFor={fps}>
          <StaffScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={soft} />
        <TransitionSeries.Sequence name="Muro" durationInFrames={87} premountFor={fps}>
          <WallScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={30} premountFor={fps}>
          <LightLeakOverlay seed={7} hueShift={225} />
        </TransitionSeries.Overlay>
        <TransitionSeries.Sequence name="Finale" durationInFrames={161} premountFor={fps}>
          <EndScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio src={staticFile("music.mp3")} premountFor={fps} />
    </AbsoluteFill>
  );
};
