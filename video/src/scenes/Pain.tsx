import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { pop } from "../components/anim";
import { C, FONT_DISPLAY } from "../theme";

const LINES = ["Без таблиц.", "Без весов.", "Без мучений."];

export const Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 30, paddingBottom: 120 }}>
      {LINES.map((line, i) => {
        const p = pop(frame, fps, 2 + i * 10, 11);
        return (
          <div
            key={line}
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 100,
              letterSpacing: -3,
              color: i === LINES.length - 1 ? C.lime : C.text,
              opacity: Math.min(1, p * 1.5),
              scale: String(interpolate(p, [0, 1], [2.2, 1])),
              filter: `blur(${(1 - Math.min(p, 1)) * 12}px)`,
            }}
          >
            {line}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
