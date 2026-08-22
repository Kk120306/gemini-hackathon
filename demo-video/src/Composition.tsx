import { Composition, Sequence } from "remotion";
import { ChallengeScene } from "./scenes/ChallengeScene";
import { CloseScene } from "./scenes/CloseScene";
import { GroundingScene } from "./scenes/GroundingScene";
import { InputsScene } from "./scenes/InputsScene";
import { OpeningScene } from "./scenes/OpeningScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SpatialScene } from "./scenes/SpatialScene";
import { SupportScene } from "./scenes/SupportScene";

export const FPS = 30;

const scenes = [
  { from: 0, duration: 360, component: OpeningScene },
  { from: 360, duration: 480, component: ProblemScene },
  { from: 840, duration: 630, component: InputsScene },
  { from: 1470, duration: 1410, component: GroundingScene },
  { from: 2880, duration: 510, component: SpatialScene },
  { from: 3390, duration: 510, component: ChallengeScene },
  { from: 3900, duration: 600, component: SupportScene },
  { from: 4500, duration: 540, component: CloseScene },
] as const;

export const DURATION = scenes.reduce((sum, scene) => sum + scene.duration, 0);

const AnchorDemo: React.FC = () => {
  return (
    <>
      {scenes.map((scene, index) => {
        const Scene = scene.component;

        return (
          <Sequence
            durationInFrames={scene.duration}
            from={scene.from}
            key={index}
            premountFor={FPS}
          >
            <Scene durationInFrames={scene.duration} />
          </Sequence>
        );
      })}
    </>
  );
};

export const MyComposition: React.FC = () => {
  return (
    <Composition
      id="AnchorDemo"
      component={AnchorDemo}
      durationInFrames={DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
