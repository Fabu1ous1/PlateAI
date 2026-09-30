import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";

// Появление сообщения: вырастает по высоте (лента плавно едет вверх) и «выпрыгивает»
export const Appear: React.FC<{ at: number; h: number; side: "in" | "out"; children: React.ReactNode }> = ({
  at,
  h,
  side,
  children,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at) return null;
  const s = spring({ frame: f - at, fps, config: { damping: 15, mass: 0.7 } });
  return (
    <div
      style={{
        maxHeight: s < 0.999 ? s * h : undefined,
        overflow: s < 0.999 ? "hidden" : "visible",
        display: "flex",
        justifyContent: side === "out" ? "flex-end" : "flex-start",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          transform: `scale(${0.85 + 0.15 * s})`,
          transformOrigin: side === "out" ? "bottom right" : "bottom left",
          opacity: s,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Bubble: React.FC<{ side: "in" | "out"; children: React.ReactNode; time?: string }> = ({
  side,
  children,
  time,
}) => (
  <div
    style={{
      background: side === "out" ? C.tgBubbleOut : C.tgBubbleIn,
      color: C.text,
      borderRadius: 30,
      borderBottomRightRadius: side === "out" ? 8 : 30,
      borderBottomLeftRadius: side === "in" ? 8 : 30,
      padding: "20px 28px 14px",
      fontSize: 33,
      lineHeight: 1.42,
      maxWidth: 740,
      fontWeight: 500,
    }}
  >
    {children}
    {time ? (
      <div style={{ textAlign: "right", fontSize: 22, color: side === "out" ? "#8FB8DB" : "#6D8196", marginTop: 2 }}>
        {time}
        {side === "out" ? " ✓✓" : ""}
      </div>
    ) : null}
  </div>
);

export const Typing: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          background: C.tgBubbleIn,
          borderRadius: 30,
          borderBottomLeftRadius: 8,
          padding: "26px 32px",
          display: "flex",
          gap: 12,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              background: "#8FA3B6",
              opacity: 0.35 + 0.65 * Math.max(0, Math.sin((f - from) / 3 - i * 0.9)),
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const InlineButtons: React.FC = () => (
  <div style={{ display: "flex", gap: 8, marginTop: 8, width: 740 }}>
    {["↩️ Отменить", "📊 Итоги дня"].map((t) => (
      <div
        key={t}
        style={{
          flex: 1,
          background: "rgba(24,37,51,0.85)",
          color: C.text,
          fontSize: 28,
          fontWeight: 600,
          textAlign: "center",
          padding: "16px 0",
          borderRadius: 18,
        }}
      >
        {t}
      </div>
    ))}
  </div>
);
