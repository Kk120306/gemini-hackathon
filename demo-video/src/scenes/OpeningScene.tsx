import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { BrandMark, Eyebrow } from "../components/SceneShell";
import { colors, enter, sceneOpacity } from "../theme";

export const OpeningScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [1.06, 1.14]);

  return (
    <AbsoluteFill
      style={{
        background: colors.ink,
        color: colors.white,
        opacity: sceneOpacity(frame, durationInFrames),
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile("audio/01-opening.m4a")} volume={0.95} />
      <Img
        alt="ANCHOR patient welcome screen"
        src={staticFile("product/product-welcome.png")}
        style={{
          filter: "brightness(0.52) saturate(0.85)",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          width: "100%",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(18,31,26,0.96) 0%, rgba(18,31,26,0.76) 48%, rgba(18,31,26,0.24) 100%)",
        }}
      />
      <div style={{ left: 82, position: "absolute", top: 60 }}>
        <BrandMark light />
      </div>
      <div
        style={{ left: 130, maxWidth: 1120, position: "absolute", top: 260 }}
      >
        <div style={enter(frame, 8)}>
          <Eyebrow light>Gemini-powered spatial learning</Eyebrow>
        </div>
        <h1
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 104,
            letterSpacing: -4,
            lineHeight: 0.96,
            margin: "28px 0",
            maxWidth: 1080,
            ...enter(frame, 20),
          }}
        >
          A familiar room becomes the activity.
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 36,
            lineHeight: 1.35,
            margin: 0,
            maxWidth: 900,
            ...enter(frame, 36),
          }}
        >
          Strong spatial reasoning, grounded in facts a caregiver approved.
        </p>
      </div>
      <div
        style={{
          bottom: 54,
          color: "rgba(255,255,255,0.72)",
          fontSize: 20,
          position: "absolute",
          right: 70,
        }}
      >
        Hackathon demo • 2.5D composition, not metric 3D reconstruction
      </div>
    </AbsoluteFill>
  );
};
