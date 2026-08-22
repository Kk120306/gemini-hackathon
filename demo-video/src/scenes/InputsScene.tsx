import { Audio } from "@remotion/media";
import { staticFile, useCurrentFrame } from "remotion";
import { MediaCard } from "../components/MediaCard";
import {
  BrandMark,
  Eyebrow,
  Footnote,
  SceneShell,
} from "../components/SceneShell";
import { colors, enter } from "../theme";

export const InputsScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  return (
    <SceneShell
      durationInFrames={durationInFrames}
      background={colors.ink}
      dark
    >
      <Audio src={staticFile("audio/03-inputs.m4a")} volume={0.95} />
      <div style={{ left: 70, position: "absolute", top: 52 }}>
        <BrandMark light />
      </div>
      <div style={{ left: 110, position: "absolute", top: 155 }}>
        <div style={enter(frame, 6)}>
          <Eyebrow light>Demo inputs</Eyebrow>
        </div>
        <h2
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 76,
            letterSpacing: -2.5,
            margin: "20px 0 0",
            ...enter(frame, 18),
          }}
        >
          Familiar context starts with evidence.
        </h2>
      </div>
      <MediaCard
        alt="Licensed stock bedroom reference"
        imageStyle={{ objectPosition: "center 55%" }}
        label="Licensed stock room reference"
        src="assets/pexels-curtis-adams-6035359.jpg"
        style={{
          height: 580,
          left: 110,
          position: "absolute",
          top: 365,
          width: 1120,
          ...enter(frame, 32),
        }}
      />
      <MediaCard
        alt="Licensed stock portrait reference"
        imageStyle={{ objectPosition: "center 30%" }}
        label="Licensed stock portrait"
        src="assets/pexels-luriko-yamaguchi-36838816.jpg"
        style={{
          height: 580,
          position: "absolute",
          right: 110,
          top: 365,
          width: 470,
          ...enter(frame, 48),
        }}
      />
      <div
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 24,
          bottom: 76,
          color: colors.white,
          fontSize: 25,
          fontWeight: 500,
          left: 420,
          padding: "16px 24px",
          position: "absolute",
        }}
      >
        Caregiver confirmation required for facts • consent required before
        likeness generation
      </div>
      <Footnote light>Pexels photo credits included with the project</Footnote>
    </SceneShell>
  );
};
