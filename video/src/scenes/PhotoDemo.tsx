import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { count, ease, pop } from "../components/anim";
import { Macros } from "../components/Phone";
import { Title } from "../components/Title";
import { C, FONT_UI } from "../theme";

const PLATE = 640;
const PLATE_TOP = 500;

const Chip: React.FC<{ label: string; kcal: number; x: number; y: number; p: number }> = ({ label, kcal, x, y, p }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "18px 30px",
      borderRadius: 999,
      backgroundColor: "#0B140EEE",
      border: `3px solid ${C.lime}`,
      fontFamily: FONT_UI,
      fontSize: 40,
      fontWeight: 800,
      color: C.text,
      whiteSpace: "nowrap",
      scale: String(p),
      boxShadow: "0 20px 50px #0008",
    }}
  >
    {label} <span style={{ color: C.lime }}>{kcal} ккал</span>
  </div>
);

export const PhotoDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const plate = pop(frame, fps, -8, 14);
  const scan = ease(frame, 8, 30);
  const flash = interpolate(frame, [4, 6, 12], [0, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const card = pop(frame, fps, 40, 14);
  const corner = (rot: number, l: number, t: number) => (
    <div
      style={{
        position: "absolute",
        left: l,
        top: t,
        width: 110,
        height: 110,
        borderTop: `10px solid ${C.lime}`,
        borderLeft: `10px solid ${C.lime}`,
        borderTopLeftRadius: 30,
        rotate: `${rot}deg`,
      }}
    />
  );
  const frameP = pop(frame, fps, 2, 12);
  const pad = interpolate(frameP, [0, 1], [140, 40]);

  return (
    <AbsoluteFill>
      <Title top="Сфоткал еду —" accent="калории готовы" delay={-10} />

      <div
        style={{
          position: "absolute",
          left: (1080 - PLATE) / 2,
          top: PLATE_TOP,
          width: PLATE,
          height: PLATE,
          borderRadius: "50%",
          background: "radial-gradient(circle at 45% 40%, #FFFFFF 0%, #ECEDE6 55%, #C9CCC2 100%)",
          boxShadow: "0 50px 120px #000c, inset 0 0 0 26px #F7F8F3, inset 0 0 0 30px #D6D9CF",
          scale: String(plate),
          rotate: `${(1 - plate) * -40}deg`,
        }}
      >
        <div style={{ position: "absolute", left: 90, top: 150, fontSize: 290, fontFamily: FONT_UI }}>🍔</div>
        <div style={{ position: "absolute", left: 340, top: 300, fontSize: 210, fontFamily: FONT_UI, rotate: "14deg" }}>
          🍟
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: (1080 - PLATE) / 2 - pad,
          top: PLATE_TOP - pad,
          width: PLATE + pad * 2,
          height: PLATE + pad * 2,
          opacity: frameP,
        }}
      >
        {corner(0, 0, 0)}
        {corner(90, PLATE + pad * 2 - 110, 0)}
        {corner(180, PLATE + pad * 2 - 110, PLATE + pad * 2 - 110)}
        {corner(270, 0, PLATE + pad * 2 - 110)}
        {scan > 0 && scan < 1 && (
          <div
            style={{
              position: "absolute",
              left: 20,
              right: 20,
              top: 20 + scan * (PLATE + pad * 2 - 40),
              height: 8,
              borderRadius: 4,
              backgroundColor: C.lime,
              boxShadow: `0 0 40px 14px ${C.lime}99`,
            }}
          />
        )}
      </div>

      <Chip label="🍔 Бургер" kcal={540} x={60} y={PLATE_TOP + 30} p={pop(frame, fps, 30)} />
      <Chip label="🍟 Картофель фри" kcal={320} x={360} y={PLATE_TOP + 520} p={pop(frame, fps, 36)} />

      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 1300,
          padding: "40px 44px",
          borderRadius: 48,
          backgroundColor: C.card,
          border: `3px solid ${C.cardLine}`,
          display: "flex",
          flexDirection: "column",
          gap: 26,
          fontFamily: FONT_UI,
          opacity: card,
          translate: `0 ${(1 - card) * 200}px`,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: C.text }}>✅ Записал</div>
          <div style={{ fontSize: 84, fontWeight: 800, color: C.lime }}>
            {count(frame, 42, 66, 860)} <span style={{ fontSize: 40 }}>ккал</span>
          </div>
        </div>
        <Macros p={28} f={44} c={92} opacity={ease(frame, 54, 62)} />
      </div>

      <AbsoluteFill style={{ backgroundColor: "white", opacity: flash }} />
    </AbsoluteFill>
  );
};
