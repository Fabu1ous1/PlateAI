import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";

// Тарелка (два кольца), дуга прогресса и искра «AI»
export const Logo: React.FC<{ size: number; delay?: number }> = ({ size, delay = 0 }) => {
  const f = useCurrentFrame() - delay;
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 12 } });
  const arc = interpolate(f, [8, 40], [0, 0.72], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const spark = spring({ frame: f - 30, fps, config: { damping: 8 } });
  const r = 40;
  const len = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: `scale(${s})` }}>
      <circle cx="60" cy="60" r="54" fill={C.bg2} stroke={C.green} strokeWidth="4" />
      <circle cx="60" cy="60" r={r} fill="none" stroke="#1F2E27" strokeWidth="10" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={C.green}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - arc)}
        transform="rotate(-90 60 60)"
      />
      <g transform={`translate(60 60) scale(${spark}) rotate(${spark * 45})`}>
        <path d="M0 -16 L4 -4 L16 0 L4 4 L0 16 L-4 4 L-16 0 L-4 -4 Z" fill={C.amber} />
      </g>
    </svg>
  );
};
