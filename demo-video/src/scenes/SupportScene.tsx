import { Audio } from "@remotion/media";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  BrandMark,
  Eyebrow,
  Footnote,
  SceneShell,
} from "../components/SceneShell";
import { colors, enter } from "../theme";

const states = [
  {
    start: 0,
    end: 210,
    src: "product/product-verbal.png",
    number: "01",
    title: "Neutral verbal cue",
    detail: "Restate the evidence path without revealing the answer.",
  },
  {
    start: 195,
    end: 420,
    src: "product/product-focus.png",
    number: "02",
    title: "Visual focus",
    detail: "Highlight only the caregiver-verified target region.",
  },
  {
    start: 405,
    end: 630,
    src: "product/product-simplified.png",
    number: "03",
    title: "Simplified scene",
    detail: "Reduce visual competition while preserving the room context.",
  },
  {
    start: 615,
    end: 840,
    src: "product/product-correct.png",
    number: "04",
    title: "Grounded reveal",
    detail: "Explain why the verified clues agree, with no score or shame.",
  },
] as const;

export const SupportScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  return (
    <SceneShell durationInFrames={durationInFrames}>
      <Audio src={staticFile("audio/07-support.m4a")} volume={0.95} />
      <div style={{ left: 70, position: "absolute", top: 52, zIndex: 5 }}>
        <BrandMark />
      </div>
      <div
        style={{
          left: 100,
          position: "absolute",
          top: 150,
          width: 560,
          zIndex: 5,
        }}
      >
        <div style={enter(frame, 6)}>
          <Eyebrow>Progressive support</Eyebrow>
        </div>
        <h2
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 70,
            letterSpacing: -2.6,
            lineHeight: 1.02,
            margin: "22px 0 0",
            ...enter(frame, 18),
          }}
        >
          Help gets stronger. The tone stays gentle.
        </h2>
      </div>
      <div
        style={{
          borderRadius: 38,
          boxShadow: "0 34px 90px rgba(23,35,31,0.25)",
          height: 720,
          overflow: "hidden",
          position: "absolute",
          right: 70,
          top: 150,
          width: 1180,
        }}
      >
        {states.map((state) => {
          const opacity = interpolate(
            frame,
            [state.start, state.start + 18, state.end - 18, state.end],
            [0, 1, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const scale = interpolate(
            frame,
            [state.start, state.end],
            [1, 1.045],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );

          return (
            <Img
              alt={state.title}
              key={state.src}
              src={staticFile(state.src)}
              style={{
                height: "100%",
                left: 0,
                objectFit: "cover",
                opacity,
                position: "absolute",
                top: 0,
                transform: `scale(${scale})`,
                width: "100%",
              }}
            />
          );
        })}
      </div>
      <div style={{ bottom: 150, left: 100, position: "absolute", width: 560 }}>
        {states.map((state) => {
          const opacity = interpolate(
            frame,
            [state.start, state.start + 18, state.end - 18, state.end],
            [0, 1, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          return (
            <div
              key={state.number}
              style={{
                opacity,
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              <div
                style={{ color: colors.forest, fontSize: 22, fontWeight: 700 }}
              >
                {state.number} / 04
              </div>
              <div style={{ fontSize: 39, fontWeight: 700, marginTop: 10 }}>
                {state.title}
              </div>
              <div
                style={{
                  fontSize: 25,
                  lineHeight: 1.42,
                  marginTop: 10,
                  opacity: 0.68,
                }}
              >
                {state.detail}
              </div>
            </div>
          );
        })}
      </div>
      <Footnote>
        Incorrect answers never trigger shame, urgency, arguing, or clinical
        scoring
      </Footnote>
    </SceneShell>
  );
};
