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
      <Audio src={staticFile("audio/05-spatial.wav")} volume={0.95} />
      <Img
        alt="Caregiver-provided office with a monitor and keyboard"
        src={staticFile("assets/office-room.jpg")}
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
          <Eyebrow light>Gemini landmark reasoning</Eyebrow>
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
          Where is the keyboard? Start at the monitor.
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
          Look directly below the monitor. Both objects came from this approved
          room photo.
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
        Gemini-grounded cue • large image • hear it again • no timer
      </div>
    </AbsoluteFill>
  );
};
