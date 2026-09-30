import { Audio, Sequence, staticFile } from "remotion";

export type SfxName =
  | "pop"
  | "whoosh"
  | "typing"
  | "swipe"
  | "impact"
  | "ding"
  | "shutter"
  | "send";

// Звуковой эффект на кадре `at` (относительно текущей сцены)
export const Sfx: React.FC<{ at: number; name: SfxName; volume?: number }> = ({
  at,
  name,
  volume = 0.6,
}) => (
  <Sequence from={at} layout="none" name={`sfx:${name}`}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);
