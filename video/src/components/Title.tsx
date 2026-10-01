import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_DISPLAY } from "../theme";
import { pop } from "./anim";

// Two-line scene headline; second line is highlighted
export const Title: React.FC<{ top: string; accent: string; y?: number; delay?: number }> = ({
  top,
  accent,
  y = 150,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 80,
        right: 80,
        textAlign: "center",
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: 84,
        lineHeight: 1.12,
        color: C.text,
        letterSpacing: -1,
      }}
    >
      {[top, accent].map((line, i) => {
        const p = pop(frame, fps, delay + i * 5);
        return (
          <div
            key={line}
            style={{
              color: i === 1 ? C.lime : C.text,
              opacity: p,
              translate: `0 ${(1 - p) * 60}px`,
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};
