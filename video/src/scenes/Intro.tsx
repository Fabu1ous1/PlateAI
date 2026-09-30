import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "../components/Logo";
import { Sfx } from "../components/Sfx";
import { C, FONT } from "../theme";

// Появление бренда
export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = spring({ frame: f - 14, fps, config: { damping: 14 } });
  const sub = spring({ frame: f - 30, fps, config: { damping: 18 } });
  const letters = "PlateAI".split("");

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Sfx at={0} name="pop" volume={0.5} />
      <Sfx at={30} name="ding" volume={0.35} />
      <Logo size={360} />
      <div
        style={{
          marginTop: 60,
          fontSize: 170,
          fontWeight: 900,
          letterSpacing: -4,
          display: "flex",
        }}
      >
        {letters.map((l, i) => {
          const s = spring({
            frame: f - 14 - i * 2,
            fps,
            config: { damping: 12 },
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: i >= 5 ? C.green : C.text,
                opacity: s,
                transform: `translateY(${(1 - s) * 80}px)`,
              }}
            >
              {l}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 20,
          fontSize: 58,
          fontWeight: 600,
          color: C.muted,
          textAlign: "center",
          lineHeight: 1.3,
          opacity: sub * title,
          transform: `translateY(${(1 - sub) * 30}px)`,
        }}
      >
        Калории и БЖУ за секунды
        <br />
        прямо в{" "}
        <span style={{ color: "#5AB3F0", fontWeight: 800 }}>Telegram</span>
      </div>
    </AbsoluteFill>
  );
};
