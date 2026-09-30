import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";

const Word: React.FC<{ text: string; delay: number; color?: string }> = ({ text, delay, color = C.text }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 14, mass: 0.6 } });
  return (
    <span
      style={{
        display: "inline-block",
        margin: "0 14px",
        color,
        opacity: s,
        transform: `translateY(${(1 - s) * 60}px) scale(${0.8 + s * 0.2})`,
      }}
    >
      {text}
    </span>
  );
};

// 0–3 c: крючок — вопрос + тарелка со «сломанным» счётчиком калорий
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const plate = spring({ frame: f - 18, fps, config: { damping: 10 } });
  const wobble = Math.sin(f / 6) * 4;
  // счётчик мельтешит случайными числами, как будто «угадываем»
  const guess = Math.round(200 + random(`g${Math.floor(f / 3)}`) * 900);
  const counterIn = spring({ frame: f - 30, fps });

  return (
    <AbsoluteFill style={{ fontFamily: FONT, alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 104, fontWeight: 900, textAlign: "center", lineHeight: 1.1, width: 960 }}>
        <Word text="Сколько" delay={0} />
        <Word text="калорий" delay={5} color={C.green} />
        <br />
        <Word text="в твоей" delay={10} />
        <Word text="тарелке?" delay={15} />
      </div>
      <div
        style={{
          marginTop: 80,
          fontSize: 340,
          transform: `scale(${plate}) rotate(${wobble}deg)`,
          filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5))",
        }}
      >
        🍝
      </div>
      <div
        style={{
          marginTop: 40,
          fontSize: 88,
          fontWeight: 800,
          color: C.amber,
          opacity: counterIn,
          transform: `scale(${counterIn})`,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {guess}? ккал
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 260,
          fontSize: 44,
          color: C.muted,
          fontWeight: 600,
          opacity: interpolate(f, [45, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Угадывать больше не нужно
      </div>
    </AbsoluteFill>
  );
};
