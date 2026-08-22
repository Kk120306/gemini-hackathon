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

export const SpatialScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [1.02, 1.17]);
  const x = interpolate(frame, [0, durationInFrames], [0, -90]);

  return (
    <AbsoluteFill
      style={{
        background: colors.ink,
        color: colors.white,
        opacity: sceneOpacity(frame, durationInFrames),
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile("audio/05-spatial.m4a")} volume={0.95} />
      <Img
        alt="Interactive 2.5D room in ANCHOR"
        src={staticFile("product/product-spatial.png")}
        style={{
          height: "100%",
          objectFit: "cover",
          transform: `translateX(${x}px) scale(${scale})`,
          width: "100%",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(15,28,23,0.94) 0%, rgba(15,28,23,0.76) 34%, rgba(15,28,23,0.05) 70%)",
        }}
      />
      <div style={{ left: 70, position: "absolute", top: 52 }}>
        <BrandMark light />
      </div>
      <div style={{ left: 110, maxWidth: 720, position: "absolute", top: 250 }}>
        <div style={enter(frame, 8)}>
          <Eyebrow light>The room is the interface</Eyebrow>
        </div>
        <h2
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 86,
            letterSpacing: -3,
            lineHeight: 1,
            margin: "28px 0",
            ...enter(frame, 22),
          }}
        >
          Real depth cues. Grounded object anchors.
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.78)",
            fontSize: 31,
            lineHeight: 1.45,
            margin: 0,
            ...enter(frame, 38),
          }}
        >
          Gemini preserves the approved camera view, strengthens visible
          foreground-to-background depth, and keeps every hotspot tied to the
          original image plane.
        </p>
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.24)",
          borderRadius: 999,
          bottom: 70,
          fontSize: 23,
          fontWeight: 600,
          left: 110,
          padding: "14px 22px",
          position: "absolute",
          ...enter(frame, 70, 18),
        }}
      >
        Perspective-responsive 2.5D composition • reduced-motion safe
      </div>
    </AbsoluteFill>
  );
};
