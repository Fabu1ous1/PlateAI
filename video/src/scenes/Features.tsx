import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";

const FEATURES = [
  { e: "📸", t: "Фото или текст", d: "Узнаёт блюдо и граммовку" },
  { e: "🎯", t: "Норма под тебя", d: "Калории и БЖУ по твоей цели" },
  { e: "📊", t: "Итоги дня и недели", d: "Видно, где перебор" },
  { e: "💧", t: "Трекер воды", d: "В одно нажатие" },
];

export const Features: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = spring({ frame: f, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ fontFamily: FONT, alignItems: "center", justifyContent: "center", gap: 36 }}>
      <div
        style={{
          fontSize: 88,
          fontWeight: 900,
          textAlign: "center",
          lineHeight: 1.1,
          marginBottom: 30,
          opacity: head,
          transform: `translateY(${(1 - head) * -40}px)`,
        }}
      >
        Всё в одном <span style={{ color: C.green }}>чате</span>
      </div>
      {FEATURES.map((x, i) => {
        const s = spring({ frame: f - 10 - i * 7, fps, config: { damping: 14 } });
        return (
          <div
            key={x.t}
            style={{
              width: 900,
              display: "flex",
              alignItems: "center",
              gap: 36,
              padding: "36px 44px",
              borderRadius: 40,
              background: "rgba(255,255,255,0.05)",
              border: "2px solid rgba(61,220,132,0.25)",
              opacity: s,
              transform: `translateX(${(1 - s) * (i % 2 ? 300 : -300)}px)`,
            }}
          >
            <div
              style={{
                width: 130,
                height: 130,
                borderRadius: 34,
                background: "rgba(61,220,132,0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 76,
                flexShrink: 0,
              }}
            >
              {x.e}
            </div>
            <div>
              <div style={{ fontSize: 56, fontWeight: 800, color: C.text }}>{x.t}</div>
              <div style={{ fontSize: 38, fontWeight: 500, color: C.muted, marginTop: 6 }}>{x.d}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
