import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { count, ease, pop } from "../components/anim";
import { Title } from "../components/Title";
import { C, FONT_UI } from "../theme";

const GOAL = 2000;
const MAX = 2400;
const DAYS = [
  ["Пн", 1720],
  ["Вт", 1950],
  ["Ср", 1680],
  ["Чт", 2240],
  ["Пт", 1790],
  ["Сб", 1860],
  ["Вс", 1640],
] as const;
const CHART_H = 760;

// Same colour logic as the bot: green in norm, yellow close, red over
const colorFor = (v: number) => (v > GOAL ? C.coral : v > GOAL * 0.9 ? C.amber : C.lime);

export const Week: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const avg = Math.round(DAYS.reduce((s, d) => s + d[1], 0) / DAYS.length);
  const goalY = CHART_H * (1 - GOAL / MAX);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_UI }}>
      <Title top="Прогресс" accent="за неделю" y={140} />

      <div style={{ position: "absolute", left: 90, right: 90, top: 520, height: CHART_H }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: goalY,
            borderTop: `4px dashed ${C.muted}`,
            opacity: ease(frame, 5, 15),
          }}
        >
          <div style={{ position: "absolute", right: 0, top: -54, fontSize: 32, fontWeight: 600, color: C.muted }}>
            норма 2 000
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", gap: 26 }}>
          {DAYS.map(([day, v], i) => {
            const p = pop(frame, fps, 8 + i * 4, 15);
            return (
              <div key={day} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 12, opacity: ease(frame, 20 + i * 4, 28 + i * 4) }}>
                  {v.toLocaleString("ru-RU")}
                </div>
                <div
                  style={{
                    width: "100%",
                    height: (v / MAX) * CHART_H * p,
                    borderRadius: "24px 24px 10px 10px",
                    backgroundColor: colorFor(v),
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 1300, display: "flex", gap: 26 }}>
        {DAYS.map(([day]) => (
          <div key={day} style={{ flex: 1, textAlign: "center", fontSize: 36, fontWeight: 800, color: C.muted }}>
            {day}
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 1470,
          padding: "36px 40px",
          borderRadius: 40,
          backgroundColor: C.card,
          border: `3px solid ${C.cardLine}`,
          textAlign: "center",
          fontSize: 48,
          fontWeight: 800,
          color: C.text,
          opacity: pop(frame, fps, 45),
          scale: String(0.9 + 0.1 * pop(frame, fps, 45)),
        }}
      >
        📈 В среднем <span style={{ color: C.lime }}>{count(frame, 48, 78, avg)}</span> ккал/день
      </div>
    </AbsoluteFill>
  );
};
