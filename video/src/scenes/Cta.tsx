import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { prog } from "../lib/motion";
import { E3D, ICON, MaskLine, Sfx } from "../lib/ui";
import { C, DISPLAY, UI } from "../theme";

const ORBIT = [
  ICON.burger,
  ICON.avocado,
  ICON.sushi,
  ICON.pancakes,
  ICON.ramen,
  ICON.egg,
  ICON.pizza,
  ICON.croissant,
];

// Финал: еда вращается по орбите вокруг тарелки, призыв и кнопка
export const Cta: React.FC<{ botHandle: string }> = ({ botHandle }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const plate = spring({ frame: f, fps, config: { damping: 12 } });
  const btn = spring({ frame: f - 22, fps, config: { damping: 10 } });
  const pulse = f > 40 ? 1 + Math.max(0, Math.sin((f - 40) / 6)) * 0.035 : 1;

  return (
    <AbsoluteFill
      style={{ background: C.cream, alignItems: "center", fontFamily: DISPLAY }}
    >
      <Sfx at={22} name="pop" volume={0.45} />
      {/* орбита */}
      <AbsoluteFill>
        {ORBIT.map((c, i) => {
          const a = (i / ORBIT.length) * Math.PI * 2 + f / 45;
          const r = 380 * prog(f, i * 2, 24);
          return (
            <E3D
              key={c}
              code={c}
              size={150}
              style={{
                position: "absolute",
                left: 540 + Math.cos(a) * r - 75,
                top: 700 + Math.sin(a) * r * 0.55 - 75,
                filter: "drop-shadow(0 16px 20px rgba(14,26,20,0.18))",
              }}
            />
          );
        })}
        <E3D
          code={ICON.plate}
          size={300}
          style={{
            position: "absolute",
            left: 390,
            top: 550,
            transform: `scale(${plate})`,
          }}
        />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          top: 1110,
          width: "100%",
          textAlign: "center",
          fontWeight: 900,
          letterSpacing: -3,
          lineHeight: 1.02,
        }}
      >
        <MaskLine at={6}>
          <div style={{ fontSize: 112, color: C.ink }}>Просто</div>
        </MaskLine>
        <MaskLine at={10}>
          <div style={{ fontSize: 112, color: C.orange }}>сфоткай.</div>
        </MaskLine>
      </div>

      <div
        style={{
          position: "absolute",
          top: 1470,
          padding: "40px 80px",
          borderRadius: 999,
          background: C.forest,
          color: C.lime,
          fontSize: 54,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          gap: 24,
          boxShadow: "0 30px 60px rgba(11,59,44,0.35)",
          transform: `scale(${btn * pulse})`,
        }}
      >
        <svg width={56} height={56} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="12" fill={C.tgBlue} />
          <path
            d="M5.5 11.7l11-4.3c.5-.2 1 .1.8.9l-1.9 8.8c-.1.6-.5.8-1 .5l-2.9-2.1-1.4 1.3c-.2.2-.3.3-.6.3l.2-2.9 5.3-4.8c.2-.2 0-.3-.3-.1l-6.6 4.1-2.8-.9c-.6-.2-.6-.6.1-.9z"
            fill="#fff"
          />
        </svg>
        Открыть в Telegram
      </div>
      {botHandle ? (
        <div
          style={{
            position: "absolute",
            top: 1660,
            fontFamily: UI,
            fontSize: 50,
            fontWeight: 800,
            color: C.ink,
            opacity: prog(f, 34, 10),
          }}
        >
          {botHandle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
