import { Audio } from "@remotion/media";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  BrandMark,
  Eyebrow,
  Footnote,
  SceneShell,
} from "../components/SceneShell";
import { colors, enter } from "../theme";

export const ProblemScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const screenshotX = interpolate(frame, [50, 110], [180, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell durationInFrames={durationInFrames}>
      <Audio src={staticFile("audio/02-problem.m4a")} volume={0.95} />
      <div style={{ left: 70, position: "absolute", top: 52 }}>
        <BrandMark />
      </div>
      <div style={{ left: 110, position: "absolute", top: 196, width: 650 }}>
        <div style={enter(frame, 8)}>
          <Eyebrow>The problem</Eyebrow>
        </div>
        <h2
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 82,
            letterSpacing: -3.1,
            lineHeight: 1.03,
            margin: "26px 0 34px",
            ...enter(frame, 18),
          }}
        >
          Generic questions throw away the richest context.
        </h2>
        <div
          style={{
            borderLeft: `5px solid ${colors.coral}`,
            color: "rgba(23,35,31,0.72)",
            fontSize: 32,
            lineHeight: 1.45,
            paddingLeft: 26,
            ...enter(frame, 34),
          }}
        >
          “What color is the cup?” is easy to generate, but it does not prove
          grounded understanding of a real space.
        </div>
      </div>
      <div
        style={{
          background: colors.ink,
          borderRadius: 42,
          boxShadow: "0 36px 100px rgba(23,35,31,0.28)",
          height: 720,
          overflow: "hidden",
          position: "absolute",
          right: 70,
          top: 170,
          transform: `translateX(${screenshotX}px) rotate(-1.5deg)`,
          width: 1030,
        }}
      >
        <Img
          alt="Detailed spatial question in ANCHOR"
          src={staticFile("product/product-spatial.png")}
          style={{ height: "100%", objectFit: "cover", width: "100%" }}
        />
      </div>
      <div
        style={{
          background: colors.forest,
          borderRadius: 20,
          bottom: 120,
          color: colors.white,
          fontSize: 28,
          fontWeight: 700,
          left: 690,
          padding: "18px 28px",
          position: "absolute",
          ...enter(frame, 80, 24),
        }}
      >
        ANCHOR keeps the room in the question.
      </div>
      <Footnote>Core product proof • no dashboard detour</Footnote>
    </SceneShell>
  );
};
