import { Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { prog } from "./motion";

// 3D-иконка Fluent Emoji по коду (имя файла в public/e3d)
export const E3D: React.FC<{
  code: string;
  size: number;
  style?: React.CSSProperties;
}> = ({ code, size, style }) => (
  <Img
    src={staticFile(`e3d/${code}.webp`)}
    style={{ width: size, height: size, ...style }}
  />
);

export const ICON = {
  burger: "1f354",
  pizza: "1f355",
  donut: "1f369",
  pancakes: "1f95e",
  spaghetti: "1f35d",
  croissant: "1f950",
  chicken: "1f357",
  potato: "1f954",
  salad: "1f957",
  egg: "1f95a",
  avocado: "1f951",
  sushi: "1f363",
  ramen: "1f35c",
  rice: "1f35a",
  plate: "1f37d-fe0f",
  camera: "1f4f8",
  target: "1f3af",
  chart: "1f4ca",
  drop: "1f4a7",
  scale: "2696-fe0f",
  abacus: "1f9ee",
  clipboard: "1f4cb",
  check: "2705",
  fire: "1f525",
  bolt: "26a1",
  yum: "1f60b",
  thinking: "1f914",
  meat: "1f969",
  bread: "1f35e",
  butter: "1f9c8",
  soda: "1f964",
};

// Строка текста, которая «выезжает» снизу из-под маски
export const MaskLine: React.FC<{
  at: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  dur?: number;
}> = ({ at, children, style, dur = 16 }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, dur);
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.08em", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)` }}>
        {children}
      </div>
    </div>
  );
};

export type SfxName =
  | "pop"
  | "whoosh"
  | "typing"
  | "swipe"
  | "impact"
  | "ding"
  | "shutter"
  | "send";

export const Sfx: React.FC<{ at: number; name: SfxName; volume?: number }> = ({
  at,
  name,
  volume = 0.5,
}) => (
  <Sequence from={at} layout="none" name={`sfx:${name}`}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);
