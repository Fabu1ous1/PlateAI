import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are bundled locally so rendering works without network access
loadFont({ family: "Unbounded", url: staticFile("fonts/Unbounded-800.ttf"), weight: "800" });
for (const weight of ["400", "600", "800"]) {
  loadFont({ family: "Inter", url: staticFile(`fonts/Inter-${weight}.ttf`), weight });
}

export const FONT_DISPLAY = "Unbounded";
export const FONT_UI = `Inter, "Noto Color Emoji"`;

export const C = {
  bg: "#07100B",
  card: "#0F1A13",
  cardLine: "#1F3326",
  lime: "#C6F432",
  mint: "#3DDC97",
  amber: "#FFC53D",
  coral: "#FF6B4A",
  telegram: "#2AABEE",
  text: "#F4F7F2",
  muted: "#93A398",
};
