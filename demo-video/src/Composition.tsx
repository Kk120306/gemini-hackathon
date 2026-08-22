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
  { from: 0, duration: 270, component: OpeningScene },
  { from: 270, duration: 360, component: ProblemScene },
  { from: 630, duration: 510, component: InputsScene },
  { from: 1140, duration: 810, component: GroundingScene },
  { from: 1950, duration: 660, component: SpatialScene },
  { from: 2610, duration: 750, component: ChallengeScene },
  { from: 3360, duration: 840, component: SupportScene },
  { from: 4200, duration: 480, component: CloseScene },
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
