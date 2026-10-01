import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, pop } from "../components/anim";
import { Logo } from "../components/Logo";
import { C, FONT_DISPLAY, FONT_UI } from "../theme";

export const Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const word = pop(frame, fps, 18, 12);
  const sub = pop(frame, fps, 32);
  const glow = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.lime}55 0%, transparent 65%)`,
          opacity: glow,
          top: 330,
        }}
      />
      <div style={{ scale: String(pop(frame, fps, 0, 10)) }}>
        <Logo size={340} progress={ease(frame, 0, 26)} />
      </div>
      <div
        style={{
          marginTop: 70,
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: 150,
          letterSpacing: -5,
          color: C.text,
          opacity: word,
          translate: `0 ${(1 - word) * 80}px`,
        }}
      >
        Plate<span style={{ color: C.lime }}>AI</span>
      </div>
      <div
        style={{
          marginTop: 24,
          fontFamily: FONT_UI,
          fontWeight: 600,
          fontSize: 50,
          color: C.muted,
          opacity: sub,
          translate: `0 ${(1 - sub) * 40}px`,
        }}
      >
        Калории и БЖУ — за секунды
      </div>
    </AbsoluteFill>
  );
};
