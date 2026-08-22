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
  ["01", "Understand", "Gemini 3.6 Flash maps objects and positions"],
  ["02", "Verify", "Caregiver confirms the visible room evidence"],
  ["03", "Generate", "Gemini creates six detailed, grounded questions"],
  ["04", "Visualize", "Gemini Image builds a realistic 2.5D room view"],
] as const;

export const GroundingScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  return (
    <SceneShell durationInFrames={durationInFrames}>
      <Audio src={staticFile("audio/04-grounding.wav")} volume={0.95} />
      <div style={{ left: 70, position: "absolute", top: 52 }}>
        <BrandMark />
      </div>
      <div style={{ left: 110, position: "absolute", top: 150 }}>
        <div style={enter(frame, 6)}>
          <Eyebrow>Gemini-grounded dementia practice</Eyebrow>
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
          One room becomes six strong memory activities.
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
        label="Gemini 3.1 Flash Lite Image • realistic 2.5D view"
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
        Gemini context • deterministic safety • caregiver remains in control
      </Footnote>
    </SceneShell>
  );
};
