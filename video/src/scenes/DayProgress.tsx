import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { count, ease, pop } from "../components/anim";
import { Title } from "../components/Title";
import { C, FONT_DISPLAY, FONT_UI } from "../theme";

const EATEN = 1640;
const GOAL = 2000;
const RING = 520;

const Bar: React.FC<{ label: string; value: number; target: number; color: string; t: number; delay: number }> = ({
  label,
  value,
  target,
  color,
  t,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, delay, 18);
  return (
    <div style={{ opacity: p, translate: `${(1 - p) * -80}px 0` }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 42, fontWeight: 800, color: C.text }}>
        <span>{label}</span>
        <span style={{ color }}>
          {Math.round(value * t)} <span style={{ color: C.muted, fontWeight: 600 }}>/ {target} г</span>
        </span>
      </div>
      <div style={{ marginTop: 16, height: 26, borderRadius: 13, backgroundColor: "#1A2A1F", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(value / target) * 100 * t}%`, borderRadius: 13, backgroundColor: color }} />
      </div>
    </div>
  );
};

export const DayProgress: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ring = pop(frame, fps, 6, 16);
  const fill = ease(frame, 10, 55);
  const filled = 1 - Math.pow(1 - fill, 3);
  const r = 230;
  const len = 2 * Math.PI * r;
  const water = Math.round(ease(frame, 70, 100) * 6);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_UI }}>
      <Title top="Весь день —" accent="как на ладони" y={140} />

      <div
        style={{
          position: "absolute",
          left: (1080 - RING) / 2,
          top: 410,
          width: RING,
          height: RING,
          scale: String(ring),
        }}
      >
        <svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`}>
          <circle cx={RING / 2} cy={RING / 2} r={r} fill="none" stroke="#1A2A1F" strokeWidth={36} />
          <circle
            cx={RING / 2}
            cy={RING / 2}
            r={r}
            fill="none"
            stroke={C.lime}
            strokeWidth={36}
            strokeLinecap="round"
            strokeDasharray={len}
            strokeDashoffset={len * (1 - (EATEN / GOAL) * filled)}
            transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
            style={{ filter: `drop-shadow(0 0 18px ${C.lime}88)` }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 104, color: C.text, letterSpacing: -3 }}>
            {count(frame, 10, 55, EATEN)}
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, color: C.muted }}>из 2 000 ккал</div>
          <div style={{ marginTop: 10, fontSize: 38, fontWeight: 800, color: C.lime, opacity: ease(frame, 55, 65) }}>
            осталось 360
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", left: 100, right: 100, top: 1030, display: "flex", flexDirection: "column", gap: 40 }}>
        <Bar label="🥩 Белки" value={92} target={120} color={C.mint} t={ease(frame, 30, 65)} delay={26} />
        <Bar label="🧈 Жиры" value={58} target={67} color={C.amber} t={ease(frame, 36, 71)} delay={32} />
        <Bar label="🍞 Углеводы" value={190} target={250} color={C.coral} t={ease(frame, 42, 77)} delay={38} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 100,
          right: 100,
          top: 1560,
          padding: "30px 36px",
          borderRadius: 36,
          backgroundColor: "#0E2230",
          border: "3px solid #17384C",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: pop(frame, fps, 62),
          translate: `0 ${(1 - pop(frame, fps, 62)) * 80}px`,
        }}
      >
        <div style={{ fontSize: 42, fontWeight: 800, color: C.text }}>
          💧 Вода <span style={{ color: C.telegram }}>{String(water * 0.25).replace(".", ",")} / 2 л</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              style={{
                width: 22,
                height: 48,
                borderRadius: 11,
                backgroundColor: i < water ? C.telegram : "#17384C",
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
