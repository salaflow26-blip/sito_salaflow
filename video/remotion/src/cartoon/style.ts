// Rubber-hose cartoon look: thick ink outlines, pie-cut eyes, white gloves, everything bouncing on the beat.
// "bw" is the 1930s part of the story (grey scale, the red notebook is the only colour); "color" is today.

export type Mode = "bw" | "color";

export const BEAT = 15; // frames per beat: the swing track runs at 120 BPM, 30 fps

export const INK = "#141414";
export const RED = "#d62828";

export const pal = (mode: Mode) =>
  mode === "bw"
    ? {
        ink: INK,
        skin: "#ffffff",
        nose: "#ffffff",
        cheek: "rgba(0,0,0,0)",
        glove: "#ffffff",
        shoe: INK,
        oste: INK,
        ragazzo: "#3a3a3a",
        cuoco: "#f4f4f4",
        nonno: "#5a5a5a",
        apron: "#f4f4f4",
        mouth: "#2b2b2b",
        tongue: "#8a8a8a",
        hair: INK,
        cap: "#2e2e2e",
        wall: "#cfcfcf",
        wallDark: "#9a9a9a",
        floorA: "#e8e8e8",
        floorB: "#2a2a2a",
        wood: "#7a7a7a",
        cloth: "#ffffff",
        clothCheck: "#bdbdbd",
        paper: "#f2f2f2",
        postit: "#e6e6e6",
        light: "#ffffff",
        sky: "#dcdcdc",
      }
    : {
        ink: "#1c1410",
        skin: "#ffd9b8",
        nose: "#f29c84",
        cheek: "rgba(244,114,114,0.35)",
        glove: "#ffffff",
        shoe: "#3b2416",
        oste: "#8c2f1b",
        ragazzo: "#0f766e",
        cuoco: "#ffffff",
        nonno: "#6b5b4e",
        apron: "#fff7ec",
        mouth: "#5a1a14",
        tongue: "#f0766b",
        hair: "#2b1a12",
        cap: "#134e4a",
        wall: "#f4d9a8",
        wallDark: "#c9773f",
        floorA: "#c58a52",
        floorB: "#9c6436",
        wood: "#7a4524",
        cloth: "#ffffff",
        clothCheck: "#e46d5c",
        paper: "#fffdf6",
        postit: "#ffe066",
        light: "#fff4c2",
        sky: "#9ed8f0",
      };

// beat helpers: 0..1 phase inside the beat, a bob that lands on every beat, a sway over two beats
export const beat = (frame: number, offset = 0) => {
  const f = frame + offset;
  const p = (((f % BEAT) + BEAT) % BEAT) / BEAT;
  return {
    p,
    bob: Math.abs(Math.sin(Math.PI * p)),
    sway: Math.sin((2 * Math.PI * f) / (BEAT * 2)),
    wiggle: Math.sin((2 * Math.PI * f) / BEAT),
  };
};
