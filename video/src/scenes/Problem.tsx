import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Sfx } from "../components/Sfx";
import { C, FONT } from "../theme";

const PAINS = [
  { emoji: "⚖️", text: "Взвешивать каждый кусок" },
  { emoji: "📋", text: "Искать в таблицах" },
  { emoji: "🧮", text: "Считать на калькуляторе" },
];

// Боль: три пункта появляются и зачёркиваются
export const Problem: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stopIn = spring({ frame: f - 52, fps, config: { damping: 9 } });

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT,
        alignItems: "center",
        justifyContent: "center",
        gap: 50,
      }}
    >
      {PAINS.map((p, i) => (
        <Sfx key={p.text} at={i * 8 + 18} name="swipe" volume={0.5} />
      ))}
      <Sfx at={52} name="impact" volume={0.8} />
      {PAINS.map((p, i) => {
        const d = i * 8;
        const s = spring({ frame: f - d, fps, config: { damping: 16 } });
        const strike = interpolate(f, [d + 18, d + 30], [0, 100], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={p.text}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 30,
              fontSize: 54,
              fontWeight: 700,
              color: strike > 50 ? C.muted : C.text,
              opacity: s,
              transform: `translateX(${(1 - s) * -200}px)`,
              position: "relative",
            }}
          >
            <span style={{ fontSize: 70 }}>{p.emoji}</span>
            <span style={{ position: "relative" }}>
              {p.text}
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: "52%",
                  height: 8,
                  borderRadius: 4,
                  width: `${strike}%`,
                  background: C.red,
                }}
              />
            </span>
          </div>
        );
      })}
      <div
        style={{
          marginTop: 60,
          fontSize: 130,
          fontWeight: 900,
          color: C.green,
          transform: `scale(${stopIn})`,
          opacity: stopIn,
        }}
      >
        Хватит.
      </div>
    </AbsoluteFill>
  );
};
