import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Шрифт Inter лежит в public/fonts — рендер не зависит от интернета
const CYRILLIC = "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116";
for (const weight of ["500", "700", "800", "900"]) {
  loadFont({ family: "Inter", url: staticFile(`fonts/inter-latin-${weight}-normal.woff2`), weight });
  loadFont({
    family: "Inter",
    url: staticFile(`fonts/inter-cyrillic-${weight}-normal.woff2`),
    weight,
    unicodeRange: CYRILLIC,
  });
}

export const FONT = `Inter, "Noto Color Emoji", "Apple Color Emoji", sans-serif`;

export const C = {
  bg: "#0A0F0D",
  bg2: "#111A16",
  text: "#F4F7F5",
  muted: "#8FA39A",
  green: "#3DDC84",
  greenDark: "#1E9E5A",
  amber: "#FFB547",
  red: "#FF5C5C",
  tgBg: "#0E1621",
  tgBubbleIn: "#182533",
  tgBubbleOut: "#2B5278",
  tgHeader: "#17212B",
};

export const FPS = 30;
