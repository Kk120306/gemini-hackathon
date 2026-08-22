import { Audio } from "@remotion/media";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  BrandMark,
  Eyebrow,
  Footnote,
  SceneShell,
} from "../components/SceneShell";
import { colors, enter } from "../theme";

const clues = [
  ["01", "Visible signature", "Dark blue reading glasses"],
  ["02", "Verified place", "On the bedside table"],
  ["03", "Image region", "Lower right of the room"],
] as const;

export const ChallengeScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const screenshotScale = interpolate(frame, [0, durationInFrames], [1, 1.08]);

  return (
    <SceneShell
      durationInFrames={durationInFrames}
      background={colors.ink}
      dark
    >
      <Audio src={staticFile("audio/06-challenge.m4a")} volume={0.95} />
      <div style={{ left: 70, position: "absolute", top: 52, zIndex: 3 }}>
        <BrandMark light />
      </div>
      <div
        style={{
          borderRadius: 42,
          bottom: 78,
          boxShadow: "0 34px 90px rgba(0,0,0,0.4)",
          left: 70,
          overflow: "hidden",
          position: "absolute",
          top: 130,
          width: 1180,
        }}
      >
        <Img
          alt="Three-clue identification question"
          src={staticFile("product/product-spatial.png")}
          style={{
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            transform: `scale(${screenshotScale})`,
            width: "100%",
          }}
        />
      </div>
      <div style={{ position: "absolute", right: 70, top: 155, width: 520 }}>
        <div style={enter(frame, 8)}>
          <Eyebrow light>Question 1 of 6</Eyebrow>
        </div>
        <h2
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 63,
            letterSpacing: -2.2,
            lineHeight: 1.04,
            margin: "24px 0 34px",
            ...enter(frame, 18),
          }}
        >
          This is not a one-clue color quiz.
        </h2>
        <div style={{ display: "grid", gap: 14 }}>
          {clues.map(([number, title, value], index) => (
            <div
              key={number}
              style={{
                alignItems: "center",
                background:
                  index === 2 ? colors.forest : "rgba(255,255,255,0.09)",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 22,
                display: "grid",
                gap: 16,
                gridTemplateColumns: "58px 1fr",
                padding: "18px 20px",
                ...enter(frame, 46 + index * 18, 22),
              }}
            >
              <div
                style={{
                  alignItems: "center",
                  background:
                    index === 2 ? colors.gold : "rgba(255,255,255,0.12)",
                  borderRadius: 999,
                  color: index === 2 ? colors.ink : colors.white,
                  display: "flex",
                  fontSize: 18,
                  fontWeight: 700,
                  height: 52,
                  justifyContent: "center",
                  width: 52,
                }}
              >
                {number}
              </div>
              <div>
                <div style={{ fontSize: 21, fontWeight: 700 }}>{title}</div>
                <div style={{ fontSize: 20, marginTop: 4, opacity: 0.7 }}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p
          style={{
            color: "rgba(255,255,255,0.72)",
            fontSize: 25,
            lineHeight: 1.42,
            marginTop: 28,
            ...enter(frame, 112, 18),
          }}
        >
          The answer must satisfy all three caregiver-approved constraints at
          once.
        </p>
      </div>
      <Footnote light>
        Exactly six questions • exactly two cognitive activities
      </Footnote>
    </SceneShell>
  );
};
