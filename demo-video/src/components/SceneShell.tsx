import type { CSSProperties, PropsWithChildren } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, sceneOpacity } from "../theme";

type SceneShellProps = PropsWithChildren<{
  durationInFrames: number;
  background?: string;
  style?: CSSProperties;
  dark?: boolean;
}>;

export const SceneShell: React.FC<SceneShellProps> = ({
  children,
  durationInFrames,
  background = colors.cream,
  style,
  dark = false,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background,
        color: dark ? colors.white : colors.ink,
        opacity: sceneOpacity(frame, durationInFrames),
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const BrandMark: React.FC<{ light?: boolean }> = ({ light = false }) => (
  <div
    style={{
      alignItems: "center",
      color: light ? colors.white : colors.ink,
      display: "flex",
      fontSize: 25,
      fontWeight: 700,
      gap: 14,
      letterSpacing: 3,
    }}
  >
    <span
      style={{
        background: colors.gold,
        borderRadius: 99,
        display: "block",
        height: 13,
        width: 13,
      }}
    />
    ANCHOR
  </div>
);

export const Eyebrow: React.FC<PropsWithChildren<{ light?: boolean }>> = ({
  children,
  light = false,
}) => (
  <div
    style={{
      color: light ? colors.mint : colors.forest,
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: 3.2,
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

export const Footnote: React.FC<PropsWithChildren<{ light?: boolean }>> = ({
  children,
  light = false,
}) => (
  <div
    style={{
      bottom: 42,
      color: light ? "rgba(255,255,255,0.72)" : "rgba(23,35,31,0.62)",
      fontSize: 20,
      left: 70,
      letterSpacing: 0.5,
      position: "absolute",
    }}
  >
    {children}
  </div>
);
