import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, pop } from "../components/anim";
import { C, FONT_DISPLAY, FONT_UI } from "../theme";

const LINES = ["📒 Таблицы калорий", "⚖️ Весы на кухне", "🔍 Поиск продуктов"];

export const Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enough = pop(frame, fps, 58, 9);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 44 }}>
      <div style={{ fontFamily: FONT_UI, fontSize: 48, fontWeight: 600, color: C.muted, opacity: ease(frame, 0, 8) }}>
        Считать калории — это:
      </div>
      {LINES.map((line, i) => {
        const start = 6 + i * 12;
        const p = pop(frame, fps, start);
        const strike = ease(frame, start + 10, start + 18);
        return (
          <div
            key={line}
            style={{
              position: "relative",
              fontFamily: FONT_UI,
              fontWeight: 800,
              fontSize: 76,
              color: C.text,
              opacity: p * interpolate(strike, [0, 1], [1, 0.38]),
              translate: `${(1 - p) * -120}px 0`,
            }}
          >
            {line}
            <div
              style={{
                position: "absolute",
                left: -16,
                top: "52%",
                height: 10,
                borderRadius: 5,
                backgroundColor: C.coral,
                width: `calc(${strike * 100}% + 32px)`,
                opacity: strike > 0 ? 1 : 0,
                rotate: "-2deg",
              }}
            />
          </div>
        );
      })}
      <div
        style={{
          marginTop: 40,
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: 150,
          letterSpacing: -4,
          color: C.lime,
          scale: String(interpolate(enough, [0, 1], [3, 1])),
          opacity: Math.min(1, enough * 2),
        }}
      >
        Хватит.
      </div>
    </AbsoluteFill>
  );
};
