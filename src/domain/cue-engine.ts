import type { CueLevel } from "@/domain/anchor";

export const cueSequence = [
  "none",
  "verbal",
  "focus",
  "simplified",
  "reveal",
] as const satisfies readonly CueLevel[];

export function advanceCue(current: CueLevel): CueLevel {
  const index = cueSequence.indexOf(current);
  return cueSequence[Math.min(index + 1, cueSequence.length - 1)] ?? "none";
}

export function cueIncludes(current: CueLevel, minimum: CueLevel): boolean {
  return cueSequence.indexOf(current) >= cueSequence.indexOf(minimum);
}
