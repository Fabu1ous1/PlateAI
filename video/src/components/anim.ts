import { interpolate, spring } from "remotion";

// Spring from 0 to 1 that starts at `delay` frames
export const pop = (frame: number, fps: number, delay = 0, damping = 13) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness: 170, mass: 0.8 } });

export const ease = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Integer counter with Russian thousands separator
export const count = (frame: number, from: number, to: number, value: number) => {
  const t = ease(frame, from, to);
  const eased = 1 - Math.pow(1 - t, 3);
  return Math.round(eased * value).toLocaleString("ru-RU");
};
