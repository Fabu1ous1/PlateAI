import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "../components/Logo";
import { Sfx } from "../components/Sfx";
import { C, FONT } from "../theme";

export const Cta: React.FC<{ botHandle: string }> = ({ botHandle }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: f - 10, fps, config: { damping: 14 } });
  const btn = spring({ frame: f - 24, fps, config: { damping: 10 } });
  const pulse =
    1 + Math.max(0, Math.sin((f - 40) / 7)) * 0.04 * (f > 40 ? 1 : 0);
  const handle = interpolate(f, [34, 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Sfx at={24} name="pop" volume={0.5} />
      <Sfx at={40} name="ding" volume={0.4} />
      <Logo size={260} />
      <div
        style={{
          marginTop: 50,
          fontSize: 96,
          fontWeight: 900,
          textAlign: "center",
          lineHeight: 1.1,
          opacity: t,
          transform: `translateY(${(1 - t) * 40}px)`,
        }}
      >
        Просто сфоткай
        <br />
        <span style={{ color: C.green }}>свою тарелку</span>
      </div>
      <div
        style={{
          marginTop: 80,
          padding: "40px 90px",
          borderRadius: 999,
          background: "linear-gradient(135deg, #5AB3F0, #2A8BD8)",
          color: "#fff",
          fontSize: 60,
          fontWeight: 800,
          boxShadow: "0 20px 60px rgba(42,139,216,0.5)",
          transform: `scale(${btn * pulse})`,
        }}
      >
        ✈️ Открыть в Telegram
      </div>
      {botHandle ? (
        <div
          style={{
            marginTop: 44,
            fontSize: 56,
            fontWeight: 700,
            color: C.text,
            opacity: handle,
          }}
        >
          {botHandle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
