import { AbsoluteFill } from "remotion";
import { Background } from "./components/Background";
import { Logo } from "./components/Logo";
import { PlatePhoto } from "./scenes/ChatDemo";
import { C, FONT } from "./theme";

const Chip: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      padding: "22px 34px",
      borderRadius: 30,
      background: "rgba(10,15,13,0.88)",
      border: `3px solid ${C.green}`,
      fontSize: 50,
      fontWeight: 800,
      color: C.text,
      boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

// Обложка для Reels / Shorts (статичный кадр)
export const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, color: C.text, fontFamily: FONT }}>
    <Background />
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          marginTop: 150,
          display: "flex",
          alignItems: "center",
          gap: 28,
        }}
      >
        <Logo size={120} delay={-90} />
        <div style={{ fontSize: 80, fontWeight: 900 }}>
          Plate<span style={{ color: C.green }}>AI</span>
        </div>
      </div>
      <div
        style={{
          marginTop: 70,
          fontSize: 118,
          fontWeight: 900,
          lineHeight: 1.05,
          textAlign: "center",
        }}
      >
        Калории
        <br />
        <span style={{ color: C.green }}>по фото</span>
      </div>
      <div
        style={{
          position: "relative",
          marginTop: 200,
          transform: "scale(1.5) rotate(-4deg)",
        }}
      >
        <PlatePhoto />
      </div>
      <Chip
        style={{
          top: 1110,
          right: 60,
          transform: "rotate(5deg)",
          fontSize: 64,
          color: C.amber,
        }}
      >
        494 ккал
      </Chip>
      <Chip style={{ top: 1500, left: 60, transform: "rotate(-4deg)" }}>
        🥩 Б 53 · 🧈 Ж 9 · 🍞 У 48
      </Chip>
      <div
        style={{
          position: "absolute",
          bottom: 150,
          fontSize: 60,
          fontWeight: 700,
          color: C.muted,
        }}
      >
        прямо в{" "}
        <span style={{ color: "#5AB3F0", fontWeight: 900 }}>Telegram</span>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
