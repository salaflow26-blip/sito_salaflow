import { Composition, Folder } from "remotion";
import { F } from "./features";
import { Launch } from "./Launch";
import { ChapterScene } from "./scenes/ChapterScene";
import { EndScene } from "./scenes/EndScene";
import { FeatureScene } from "./scenes/FeatureScene";
import { HookScene } from "./scenes/HookScene";
import { LogoScene } from "./scenes/LogoScene";
import { StaffScene } from "./scenes/StaffScene";
import { WallScene } from "./scenes/WallScene";
import "./theme";
import { Cartoon, timeline } from "./cartoon/Cartoon";
import { CartoonAI } from "./cartoon/CartoonAI";

const V = { width: 1080, height: 1920, fps: 30 } as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Lancio" component={Launch} durationInFrames={1860} {...V} defaultProps={{ music: "music/1-funk.mp3" }} />
      <Folder name="Scene">
        <Composition id="Gancio" component={HookScene} durationInFrames={120} {...V} />
        <Composition id="Logo" component={LogoScene} durationInFrames={127} {...V} />
        <Composition id="Serata" component={FeatureScene} durationInFrames={134} {...V} defaultProps={F.serata} />
        <Composition id="Piantina" component={FeatureScene} durationInFrames={134} {...V} defaultProps={F.mappa} />
        <Composition id="Comanda" component={FeatureScene} durationInFrames={134} {...V} defaultProps={F.comanda} />
        <Composition id="Cucina" component={FeatureScene} durationInFrames={134} {...V} defaultProps={F.cucina} />
        <Composition id="Cassa" component={FeatureScene} durationInFrames={134} {...V} defaultProps={F.cassa} />
        <Composition id="Capitolo" component={ChapterScene} durationInFrames={74} {...V} />
        <Composition id="Andamento" component={FeatureScene} durationInFrames={134} {...V} defaultProps={F.andamento} />
        <Composition id="Fatture" component={FeatureScene} durationInFrames={134} {...V} defaultProps={F.fattura} />
        <Composition id="Magazzino" component={FeatureScene} durationInFrames={134} {...V} defaultProps={F.magazzino} />
        <Composition id="Utile" component={FeatureScene} durationInFrames={134} {...V} defaultProps={F.utile} />
        <Composition id="Cameriere" component={FeatureScene} durationInFrames={134} {...V} defaultProps={F.cameriere} />
        <Composition id="Staff" component={StaffScene} durationInFrames={134} {...V} />
        <Composition id="Muro" component={WallScene} durationInFrames={97} {...V} />
        <Composition id="Finale" component={EndScene} durationInFrames={150} {...V} />
      </Folder>
      <Composition id="CartoneAI" component={CartoonAI} durationInFrames={timeline(30).total} {...V} defaultProps={{ music: "music/swing.mp3" }} />
      <Composition id="Cartone" component={Cartoon} durationInFrames={timeline(30).total} {...V} defaultProps={{ music: "music/swing.mp3" }} />
    </>
  );
};
