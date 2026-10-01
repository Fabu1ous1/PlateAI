import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Шрифты лежат в public/fonts — рендер не зависит от интернета
const CYRILLIC = "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116";
const load = (family: string, file: string, weights: string[]) => {
  for (const weight of weights) {
    loadFont({
      family,
      url: staticFile(`fonts/${file}-latin-${weight}-normal.woff2`),
      weight,
    });
    loadFont({
      family,
      url: staticFile(`fonts/${file}-cyrillic-${weight}-normal.woff2`),
      weight,
      unicodeRange: CYRILLIC,
    });
  }
};
load("Unbounded", "unbounded", ["700", "800", "900"]);
load("Inter", "inter", ["500", "700", "800", "900"]);

const EMOJI = `"Noto Color Emoji", "Apple Color Emoji"`;
export const DISPLAY = `Unbounded, ${EMOJI}, sans-serif`; // заголовки
export const UI = `Inter, ${EMOJI}, sans-serif`; // интерфейс телефона и мелкий текст

export const C = {
  cream: "#F3F1EA",
  ink: "#0E1A14",
  forest: "#0B3B2C",
  lime: "#C8F169",
  orange: "#FF6B1A",
  sky: "#BFE3FF",
  muted: "#6B7A72",
  white: "#FFFFFF",
  // Telegram (тёмная тема) внутри телефона
  tgBg: "#0E1621",
  tgHeader: "#17212B",
  tgIn: "#182533",
  tgOut: "#2B5278",
  tgBlue: "#5AB3F0",
};

export const FPS = 30;
