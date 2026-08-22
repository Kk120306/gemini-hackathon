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

const steps = [
  ["01", "Detect", "Gemini finds visible objects and positions"],
  ["02", "Approve", "The caregiver confirms every safe detail"],
  ["03", "Generate", "Six activities use this exact approved image"],
  ["04", "Practice", "One large image and one clear action at a time"],
] as const;

export const GroundingScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  return (
    <SceneShell durationInFrames={durationInFrames}>
      <Audio src={staticFile("audio/04-grounding.m4a")} volume={0.95} />
      <div style={{ left: 70, position: "absolute", top: 52 }}>
        <BrandMark />
      </div>
      <div style={{ left: 110, position: "absolute", top: 150 }}>
        <div style={enter(frame, 6)}>
          <Eyebrow>Six dementia-friendly questions</Eyebrow>
        </div>
        <h2
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 72,
            letterSpacing: -2.5,
            margin: "20px 0 0",
            ...enter(frame, 18),
          }}
        >
          Practise recognising objects and remembering where they are.
        </h2>
      </div>
      <div
        style={{
          display: "grid",
          gap: 18,
          gridTemplateColumns: "repeat(4, 1fr)",
          left: 110,
          position: "absolute",
          right: 110,
          top: 340,
        }}
      >
        {steps.map(([number, title, detail], index) => (
          <div
            key={number}
            style={{
              background: index === 2 ? colors.forest : colors.paper,
              border: "1px solid rgba(23,35,31,0.12)",
              borderRadius: 28,
              color: index === 2 ? colors.white : colors.ink,
              minHeight: 240,
              padding: 28,
              ...enter(frame, 34 + index * 14, 32),
            }}
          >
            <div
              style={{
                color: index === 2 ? colors.gold : colors.forest,
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {number}
            </div>
            <div style={{ fontSize: 38, fontWeight: 700, marginTop: 48 }}>
              {title}
            </div>
            <div
              style={{
                fontSize: 23,
                lineHeight: 1.4,
                marginTop: 12,
                opacity: 0.72,
              }}
            >
              {detail}
            </div>
          </div>
        ))}
      </div>
      <MediaCard
        alt="Caregiver-provided familiar office"
        label="Caregiver-approved source"
        src="assets/office-room.jpg"
        style={{
          bottom: 90,
          height: 330,
          left: 110,
          position: "absolute",
          width: 650,
          ...enter(frame, 105),
        }}
      />
      <div
        style={{
          color: colors.forest,
          fontSize: 58,
          fontWeight: 700,
          left: 805,
          position: "absolute",
          top: 750,
          ...enter(frame, 125, 18),
        }}
      >
        →
      </div>
      <MediaCard
        alt="The same caregiver-provided familiar office"
        label="Six activities stay grounded in this room"
        src="assets/office-room.jpg"
        style={{
          bottom: 90,
          height: 330,
          position: "absolute",
          right: 110,
          width: 890,
          ...enter(frame, 145),
        }}
      />
      <Footnote>
        Not generic trivia • no invented memories • caregiver remains in control
      </Footnote>
    </SceneShell>
  );
};
