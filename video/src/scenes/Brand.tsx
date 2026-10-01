import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { easeInOut, prog } from "../lib/motion";
import { E3D, ICON, MaskLine, Sfx } from "../lib/ui";
import { C, DISPLAY } from "../theme";

// Раскрытие бренда: кремовый круг «съедает» зелёный экран
export const Brand: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wipe = prog(f, 0, 16, easeInOut);
  const plate = spring({ frame: f - 6, fps, config: { damping: 10 } });
  const letters = "PlateAI".split("");

  return (
    <AbsoluteFill style={{ background: C.forest }}>
      <Sfx at={0} name="whoosh" volume={0.4} />
      <Sfx at={20} name="ding" volume={0.3} />
      <AbsoluteFill
        style={{
          background: C.cream,
          clipPath: `circle(${wipe * 120}% at 50% 50%)`,
          alignItems: "center",
          justifyContent: "center",
          fontFamily: DISPLAY,
        }}
      >
        <E3D
          code={ICON.plate}
          size={330}
          style={{
            transform: `scale(${plate}) rotate(${(1 - plate) * -90}deg)`,
            filter: "drop-shadow(0 30px 40px rgba(14,26,20,0.2))",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 190,
            fontWeight: 900,
            letterSpacing: -8,
            marginTop: 10,
          }}
        >
          {letters.map((l, i) => {
            const s = spring({
              frame: f - 10 - i * 2,
              fps,
              config: { damping: 12 },
            });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  color: i >= 5 ? C.orange : C.ink,
                  transform: `translateY(${(1 - s) * 120}px)`,
                  opacity: s,
                }}
              >
                {l}
              </span>
            );
          })}
        </div>
        <MaskLine at={26}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: C.forest,
              background: C.lime,
              padding: "14px 36px",
              borderRadius: 999,
            }}
          >
            калории по фото — в Telegram
          </div>
        </MaskLine>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
