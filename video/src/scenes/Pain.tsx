import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { easeIn, prog } from "../lib/motion";
import { E3D, ICON, MaskLine, Sfx } from "../lib/ui";
import { C, DISPLAY } from "../theme";

const ITEMS = [
  { c: ICON.scale, t: "Взвешивать" },
  { c: ICON.clipboard, t: "Записывать" },
  { c: ICON.abacus, t: "Считать" },
];

// Тёмно-зелёный экран: рутина → «ХВАТИТ»
export const Pain: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const SLAM = 34;
  const fall = prog(f, SLAM - 6, 10, easeIn); // рутина «проваливается» вниз
  const slam = spring({
    frame: f - SLAM,
    fps,
    config: { damping: 9, stiffness: 180 },
  });
  const shake =
    f >= SLAM && f < SLAM + 10 ? Math.sin(f * 7) * (SLAM + 10 - f) * 2.2 : 0;

  return (
    <AbsoluteFill
      style={{
        background: C.forest,
        fontFamily: DISPLAY,
        transform: `translate(${shake}px, ${shake * 0.6}px)`,
      }}
    >
      <Sfx at={SLAM} name="impact" volume={0.7} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
          transform: `translateY(${fall * 1400}px) rotate(${fall * 8}deg)`,
        }}
      >
        {ITEMS.map((it, i) => {
          const s = spring({ frame: f - i * 5, fps, config: { damping: 13 } });
          return (
            <div
              key={it.t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                width: 820,
                opacity: s,
                transform: `translateX(${(1 - s) * (i % 2 ? 400 : -400)}px)`,
              }}
            >
              <Sfx at={i * 5} name="swipe" volume={0.3} />
              <E3D code={it.c} size={190} />
              <div
                style={{
                  fontSize: 76,
                  fontWeight: 800,
                  color: C.cream,
                  letterSpacing: -2,
                }}
              >
                {it.t}
              </div>
            </div>
          );
        })}
        <div
          style={{
            marginTop: 20,
            fontSize: 44,
            fontWeight: 700,
            color: C.lime,
            opacity: interpolate(f, [14, 22], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          каждый приём пищи?
        </div>
      </AbsoluteFill>
      {f >= SLAM - 2 ? (
        <AbsoluteFill
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <div
            style={{
              fontSize: 210,
              fontWeight: 900,
              color: C.lime,
              letterSpacing: -6,
              transform: `scale(${2.4 - slam * 1.4})`,
              opacity: Math.min(1, slam * 2),
            }}
          >
            ХВАТИТ
          </div>
          <MaskLine at={SLAM + 10} style={{ marginTop: 10 }}>
            <div style={{ fontSize: 56, fontWeight: 700, color: C.cream }}>
              есть способ проще
            </div>
          </MaskLine>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
