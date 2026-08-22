import { interpolate } from "remotion";

export const colors = {
  ink: "#17231f",
  forest: "#285f50",
  sage: "#a8c2b3",
  mint: "#dbe9df",
  cream: "#f5f0e6",
  paper: "#fffdf8",
  gold: "#d8b45f",
  coral: "#c56f5f",
  white: "#ffffff",
};

export const sceneOpacity = (frame: number, duration: number) =>
  interpolate(frame, [0, 18, duration - 18, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const enter = (frame: number, start = 0, distance = 42) => {
  const progress = interpolate(frame, [start, start + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return {
    opacity: progress,
    transform: `translateY(${(1 - progress) * distance}px)`,
  };
};
