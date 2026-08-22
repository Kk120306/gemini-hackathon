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
  ["01", "Observe", "Only visible room objects and positions"],
  ["02", "Confirm", "Caregiver approves every grounded fact"],
  ["03", "Compose", "Gemini builds a perspective-preserving 2.5D scene"],
  ["04", "Validate", "A second pass rejects drift or invented content"],
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
          <Eyebrow>The grounding contract</Eyebrow>
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
          Generation is useful only when it stays true.
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
        alt="Synthetic approved source room used for the product run"
        label="Synthetic approved source"
        src="product/source-room.png"
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
        alt="Validated ANCHOR spatial room"
        label="Validated 2.5D activity surface"
        src="product/product-spatial.png"
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
        Deterministic fallback replaces any rejected or delayed model output
      </Footnote>
    </SceneShell>
  );
};
