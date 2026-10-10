import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// 112 BPM: one bar of the music track, in seconds. Every cut sits on a bar.
export const BAR = 2.1413;

export const C = {
  bg: "#020617",
  surface: "#0b1220",
  ink: "#f8fafc",
  muted: "#94a3b8",
  cyan: "#22d3ee",
  teal: "#2dd4bf",
  green: "#34d399",
};
export const GRAD = "linear-gradient(110deg, #22d3ee, #2dd4bf 50%, #34d399)";
export const FONT = "PJS, sans-serif";
export const HAND = "Caveat, cursive";

for (const w of ["500", "600", "700", "800"]) {
  loadFont({ family: "PJS", url: staticFile(`font/PJS-${w}.ttf`), weight: w });
}
loadFont({ family: "Caveat", url: staticFile("font/Caveat.ttf"), weight: "400" });

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
