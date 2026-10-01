import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_UI } from "../theme";
import { pop } from "./anim";
import { Logo } from "./Logo";

// Telegram-style chat window with the PlateAI bot header
export const Phone: React.FC<{ top: number; height: number; children: React.ReactNode }> = ({
  top,
  height,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, 4, 15);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 90,
        right: 90,
        height,
        borderRadius: 64,
        backgroundColor: C.card,
        border: `3px solid ${C.cardLine}`,
        boxShadow: `0 40px 120px #000a, 0 0 0 12px #0B140E`,
        overflow: "hidden",
        translate: `0 ${(1 - p) * 500}px`,
        opacity: p,
        fontFamily: FONT_UI,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "36px 44px",
          borderBottom: `2px solid ${C.cardLine}`,
          backgroundColor: "#0C150F",
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            backgroundColor: "#16261B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Logo size={56} />
        </div>
        <div>
          <div style={{ fontSize: 42, fontWeight: 800, color: C.text }}>PlateAI</div>
          <div style={{ fontSize: 30, color: C.mint }}>бот · онлайн</div>
        </div>
      </div>
      <div style={{ padding: "40px 36px", display: "flex", flexDirection: "column", gap: 28 }}>{children}</div>
    </div>
  );
};

export const TypingDots: React.FC<{ frame: number }> = ({ frame }) => (
  <div
    style={{
      alignSelf: "flex-start",
      display: "flex",
      gap: 12,
      padding: "28px 34px",
      borderRadius: 36,
      backgroundColor: "#1A2A1F",
    }}
  >
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          backgroundColor: C.muted,
          translate: `0 ${Math.sin((frame - i * 4) / 3) * -8}px`,
        }}
      />
    ))}
  </div>
);

export const UserBubble: React.FC<{ children: React.ReactNode; scale: number }> = ({ children, scale }) => (
  <div
    style={{
      alignSelf: "flex-end",
      maxWidth: "88%",
      padding: "28px 36px",
      borderRadius: "40px 40px 12px 40px",
      backgroundColor: C.lime,
      color: "#0A1408",
      fontSize: 46,
      fontWeight: 600,
      scale: String(scale),
      transformOrigin: "100% 100%",
    }}
  >
    {children}
  </div>
);

// One food row of the bot answer
export const FoodRow: React.FC<{ emoji: string; name: string; amount: string; kcal: number; p: number }> = ({
  emoji,
  name,
  amount,
  kcal,
  p,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 22,
      opacity: p,
      translate: `${(1 - p) * 60}px 0`,
    }}
  >
    <div style={{ fontSize: 60 }}>{emoji}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 40, fontWeight: 800, color: C.text }}>{name}</div>
      <div style={{ fontSize: 30, color: C.muted }}>{amount}</div>
    </div>
    <div style={{ fontSize: 40, fontWeight: 800, color: C.text }}>
      {kcal} <span style={{ fontSize: 28, color: C.muted, fontWeight: 600 }}>ккал</span>
    </div>
  </div>
);

export const Macros: React.FC<{ p: number; f: number; c: number; opacity: number }> = ({ p, f, c, opacity }) => (
  <div style={{ display: "flex", gap: 18, opacity }}>
    {[
      ["🥩", "Б", p, C.mint],
      ["🧈", "Ж", f, C.amber],
      ["🍞", "У", c, C.coral],
    ].map(([e, l, v, col]) => (
      <div
        key={String(l)}
        style={{
          flex: 1,
          textAlign: "center",
          padding: "16px 0",
          borderRadius: 22,
          backgroundColor: `${col}22`,
          color: String(col),
          fontSize: 34,
          fontWeight: 800,
        }}
      >
        {e} {l} {v}
      </div>
    ))}
  </div>
);
