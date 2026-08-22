import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { BrandMark, Eyebrow } from "../components/SceneShell";
import { colors, enter, sceneOpacity } from "../theme";

export const CloseScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: colors.ink,
        color: colors.white,
        opacity: sceneOpacity(frame, durationInFrames),
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile("audio/08-close.wav")} volume={0.95} />
      <Img
        alt="ANCHOR patient welcome screen"
        src={staticFile("product/patient-complete.png")}
        style={{
          filter: "brightness(0.42)",
          height: "100%",
          objectFit: "cover",
          width: "100%",
        }}
      />
      <AbsoluteFill style={{ background: "rgba(17,31,25,0.64)" }} />
      <div style={{ left: 82, position: "absolute", top: 60 }}>
        <BrandMark light />
      </div>
      <div style={{ left: 160, position: "absolute", top: 225, width: 1160 }}>
        <div style={enter(frame, 8)}>
          <Eyebrow light>Four Gemini capabilities • one safe experience</Eyebrow>
        </div>
        <h2
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 100,
            letterSpacing: -4,
            lineHeight: 0.98,
            margin: "28px 0 32px",
            ...enter(frame, 20),
          }}
        >
          Familiar-room practice
          <br />
          for people with dementia.
        </h2>
        <div
          style={{
            color: "rgba(255,255,255,0.78)",
            fontSize: 31,
            lineHeight: 1.5,
            ...enter(frame, 38),
          }}
        >
          Vision • structured questions • spatial image • video + voice
        </div>
      </div>
      <div
        style={{
          background: colors.gold,
          borderRadius: 24,
          bottom: 92,
          color: colors.ink,
          fontSize: 30,
          fontWeight: 700,
          padding: "20px 30px",
          position: "absolute",
          right: 90,
          ...enter(frame, 70, 18),
        }}
      >
        ANCHOR • GEMINI FOR DEMENTIA-FRIENDLY ROOM PRACTICE
      </div>
      <div
        style={{
          bottom: 48,
          color: "rgba(255,255,255,0.58)",
          fontSize: 19,
          left: 70,
          position: "absolute",
        }}
      >
        No diagnosis • no score • no treatment or prevention claim
      </div>
    </AbsoluteFill>
  );
};
