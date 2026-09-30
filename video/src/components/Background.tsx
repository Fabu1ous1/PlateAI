import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";

// Мягкие «дышащие» пятна света на тёмном фоне — общий фон для всех сцен
export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const x1 = 30 + Math.sin(f / 60) * 10;
  const y1 = 25 + Math.cos(f / 75) * 8;
  const x2 = 70 + Math.cos(f / 55) * 10;
  const y2 = 75 + Math.sin(f / 80) * 8;
  const glow = interpolate(Math.sin(f / 40), [-1, 1], [0.16, 0.26]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x1}% ${y1}%, rgba(61,220,132,${glow}) 0%, transparent 45%),
          radial-gradient(circle at ${x2}% ${y2}%, rgba(255,181,71,0.12) 0%, transparent 45%),
          ${C.bg}`,
      }}
    />
  );
};
