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
  const ring = pop(frame, fps, 0, 16);
  const fill = ease(frame, 4, 36);
  const filled = 1 - Math.pow(1 - fill, 3);
  const r = 230;
  const len = 2 * Math.PI * r;

  return (
    <AbsoluteFill style={{ fontFamily: FONT_UI }}>
      <Title top="Худеешь" accent="или качаешься?" />

      <div
        style={{
          position: "absolute",
          left: (1080 - RING) / 2,
          top: 470,
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
            {count(frame, 4, 36, EATEN)}
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, color: C.muted }}>из 2 000 ккал</div>
          <div style={{ marginTop: 10, fontSize: 38, fontWeight: 800, color: C.lime, opacity: ease(frame, 36, 44) }}>
            осталось 360
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", left: 100, right: 100, top: 1060, display: "flex", flexDirection: "column", gap: 40 }}>
        <Bar label="💪 Белки" value={92} target={120} color={C.mint} t={ease(frame, 14, 44)} delay={10} />
        <Bar label="🧈 Жиры" value={58} target={67} color={C.amber} t={ease(frame, 18, 48)} delay={14} />
        <Bar label="🍞 Углеводы" value={190} target={250} color={C.coral} t={ease(frame, 22, 52)} delay={18} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 100,
          right: 100,
          top: 1440,
          padding: "28px 36px",
          borderRadius: 36,
          backgroundColor: `${C.lime}18`,
          border: `3px solid ${C.lime}55`,
          textAlign: "center",
          fontSize: 40,
          fontWeight: 800,
          color: C.text,
          opacity: pop(frame, fps, 50),
          translate: `0 ${(1 - pop(frame, fps, 50)) * 80}px`,
        }}
      >
        🎯 Норма считается <span style={{ color: C.lime }}>под твою цель</span>
      </div>
    </AbsoluteFill>
  );
};
