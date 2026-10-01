import { AbsoluteFill } from "remotion";
import { E3D, ICON } from "./lib/ui";
import { PlateCard } from "./scenes/PlateCard";
import { C, DISPLAY } from "./theme";

// Обложка для Reels / Shorts
export const Cover: React.FC = () => (
  <AbsoluteFill
    style={{ background: C.cream, alignItems: "center", fontFamily: DISPLAY }}
  >
    <div
      style={{
        marginTop: 170,
        textAlign: "center",
        fontWeight: 900,
        fontSize: 132,
        lineHeight: 1,
        letterSpacing: -5,
      }}
    >
      <div style={{ color: C.ink }}>КАЛОРИИ</div>
      <div style={{ color: C.orange }}>ПО ФОТО</div>
    </div>
    <div
      style={{
        marginTop: 90,
        transform: "rotate(-4deg)",
        boxShadow: "0 50px 100px rgba(14,26,20,0.3)",
        borderRadius: 56,
      }}
    >
      <PlateCard size={780} radius={56} />
    </div>
    <div
      style={{
        position: "absolute",
        top: 1240,
        right: 50,
        transform: "rotate(6deg)",
        background: C.lime,
        color: C.forest,
        fontSize: 84,
        fontWeight: 900,
        padding: "20px 44px",
        borderRadius: 40,
        boxShadow: "0 24px 50px rgba(14,26,20,0.25)",
        letterSpacing: -3,
      }}
    >
      494 ккал
    </div>
    <E3D
      code={ICON.camera}
      size={230}
      style={{
        position: "absolute",
        top: 520,
        left: 20,
        transform: "rotate(-14deg)",
        filter: "drop-shadow(0 24px 30px rgba(14,26,20,0.25))",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 150,
        display: "flex",
        alignItems: "center",
        gap: 20,
        fontSize: 64,
        fontWeight: 900,
        color: C.ink,
        letterSpacing: -2,
      }}
    >
      Plate<span style={{ color: C.orange, marginLeft: -20 }}>AI</span>
      <span
        style={{
          fontSize: 40,
          fontWeight: 700,
          color: C.muted,
          letterSpacing: 0,
        }}
      >
        · Telegram-бот
      </span>
    </div>
  </AbsoluteFill>
);
