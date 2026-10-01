import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, pop } from "../components/anim";
import { Logo } from "../components/Logo";
import { C, FONT_DISPLAY, FONT_UI } from "../theme";

const Plane: React.FC = () => (
  <svg width={60} height={60} viewBox="0 0 24 24">
    <path d="M21.5 3.5 2.8 10.7c-1 .4-1 1.8.1 2.1l4.7 1.5 1.8 5.6c.3.9 1.4 1.1 2 .4l2.6-2.6 4.9 3.6c.8.6 1.9.1 2.1-.9L23.6 5c.2-1.1-1-2-2.1-1.5Zm-3.2 4.3-8.5 7.6-.3 3.3-1.5-4.7 10.3-6.2Z" fill="white" />
  </svg>
);

export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const btn = pop(frame, fps, 36, 10);
  const pulse = 1 + 0.04 * Math.sin(Math.max(0, frame - 50) / 5);

  const line = (text: string, delay: number, color: string, size: number) => {
    const p = pop(frame, fps, delay, 12);
    return (
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1.1,
          letterSpacing: -3,
          color,
          opacity: p,
          translate: `0 ${(1 - p) * 70}px`,
        }}
      >
        {text}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", paddingBottom: 160 }}>
      <div style={{ marginBottom: 50, scale: String(pop(frame, fps, 0, 12)) }}>
        <Logo size={140} progress={ease(frame, 0, 22)} />
      </div>
      {line("Попробуй", 4, C.text, 104)}
      {line("прямо сейчас", 9, C.text, 104)}
      <div
        style={{
          marginTop: 50,
          padding: "14px 44px",
          borderRadius: 999,
          backgroundColor: C.lime,
          color: "#0A1408",
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: 64,
          letterSpacing: -1,
          rotate: "-3deg",
          scale: String(interpolate(pop(frame, fps, 18, 9), [0, 1], [2.5, 1])),
          opacity: Math.min(1, pop(frame, fps, 18, 9) * 2),
        }}
      >
        БЕСПЛАТНО
      </div>
      <div style={{ height: 50 }} />
      {line("@PlateHelper_bot", 26, C.lime, 66)}
      <div
        style={{
          marginTop: 70,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "34px 64px",
          borderRadius: 999,
          backgroundColor: C.telegram,
          color: "white",
          fontFamily: FONT_UI,
          fontSize: 50,
          fontWeight: 800,
          boxShadow: `0 20px 70px ${C.telegram}88`,
          scale: String(btn * pulse),
        }}
      >
        <Plane />
        Открыть в Telegram
      </div>
      <div
        style={{
          marginTop: 60,
          fontFamily: FONT_UI,
          fontSize: 38,
          fontWeight: 600,
          color: C.muted,
          opacity: interpolate(frame, [50, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Калории · БЖУ · Вода · Статистика
      </div>
    </AbsoluteFill>
  );
};
