import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { pop } from "../components/anim";
import { C, FONT_DISPLAY, FONT_UI } from "../theme";

const WORDS = ["Сколько", "калорий", "в твоей", "тарелке?"];

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const plate = pop(frame, fps, 0, 9);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 230,
          marginBottom: 40,
          scale: String(plate),
          rotate: `${interpolate(plate, [0, 1], [-160, 0])}deg`,
        }}
      >
        🍽️
      </div>
      {WORDS.map((w, i) => {
        const p = pop(frame, fps, 8 + i * 6, 11);
        return (
          <div
            key={w}
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 128,
              lineHeight: 1.08,
              letterSpacing: -3,
              color: i === 1 ? C.lime : C.text,
              opacity: Math.min(1, p * 1.5),
              scale: String(interpolate(p, [0, 1], [2.2, 1])),
              filter: `blur(${(1 - Math.min(p, 1)) * 14}px)`,
            }}
          >
            {w}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
