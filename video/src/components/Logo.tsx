import { interpolate } from "remotion";
import { C } from "../theme";

// Plate ring + AI sparkle. `progress` 0..1 draws the ring.
export const Logo: React.FC<{ size: number; progress?: number }> = ({ size, progress = 1 }) => {
  const r = 42;
  const len = 2 * Math.PI * r;
  const sparkle = interpolate(progress, [0.6, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
      <circle
        cx={50}
        cy={50}
        r={r}
        fill="none"
        stroke={C.lime}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - progress)}
        transform="rotate(-90 50 50)"
      />
      <circle cx={50} cy={50} r={26} fill="none" stroke={C.lime} strokeOpacity={0.45 * progress} strokeWidth={3} />
      <path
        d="M78 8 C80 18 82 20 92 22 C82 24 80 26 78 36 C76 26 74 24 64 22 C74 20 76 18 78 8 Z"
        fill={C.text}
        style={{ scale: String(sparkle), transformOrigin: "78px 22px" }}
      />
    </svg>
  );
};
