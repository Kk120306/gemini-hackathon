import { Audio } from "@remotion/media";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  BrandMark,
  Eyebrow,
  Footnote,
  SceneShell,
} from "../components/SceneShell";
import { colors, enter } from "../theme";

export const SupportScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const portraitScale = interpolate(frame, [0, durationInFrames], [1.02, 1.09]);

  return (
    <SceneShell
      durationInFrames={durationInFrames}
      background={colors.ink}
      dark
    >
      <Audio src={staticFile("audio/07-support.m4a")} volume={0.95} />
      <div style={{ left: 70, position: "absolute", top: 52, zIndex: 5 }}>
        <BrandMark light />
      </div>
      <div
        style={{
          borderRadius: 42,
          bottom: 90,
          left: 110,
          overflow: "hidden",
          position: "absolute",
          top: 150,
          width: 680,
          ...enter(frame, 12),
        }}
      >
        <Img
          alt="Consented demo guide portrait"
          src={staticFile("assets/pexels-luriko-yamaguchi-36838816.jpg")}
          style={{
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 30%",
            transform: `scale(${portraitScale})`,
            width: "100%",
          }}
        />
        <div
          style={{
            background: colors.gold,
            borderRadius: 999,
            bottom: 28,
            color: colors.ink,
            fontSize: 21,
            fontWeight: 800,
            left: 28,
            padding: "13px 18px",
            position: "absolute",
          }}
        >
          AI-GENERATED GUIDE • NOT LIVE
        </div>
      </div>
      <div style={{ left: 900, position: "absolute", top: 190, width: 850 }}>
        <div style={enter(frame, 8)}>
          <Eyebrow light>Optional family guide for dementia practice</Eyebrow>
        </div>
        <h2
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 78,
            letterSpacing: -2.8,
            lineHeight: 1.02,
            margin: "26px 0 38px",
            ...enter(frame, 20),
          }}
        >
          A family face can ask the simple room question.
        </h2>
        <div style={{ display: "grid", gap: 18 }}>
          {[
            "Explicit caregiver consent before likeness generation",
            "Neutral Gemini synthetic voice, never a cloned family voice",
            "Static guide, spoken prompt, and visible text always remain",
          ].map((detail, index) => (
            <div
              key={detail}
              style={{
                alignItems: "center",
                background: "rgba(255,255,255,0.09)",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 22,
                display: "grid",
                fontSize: 25,
                gap: 18,
                gridTemplateColumns: "44px 1fr",
                lineHeight: 1.35,
                padding: "18px 22px",
                ...enter(frame, 44 + index * 16),
              }}
            >
              <span style={{ color: colors.gold, fontWeight: 800 }}>
                0{index + 1}
              </span>
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </div>
      <Footnote light>
        Presentation portrait from Pexels • generated guide is always labeled
      </Footnote>
    </SceneShell>
  );
};
