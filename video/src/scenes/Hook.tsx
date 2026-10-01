import {
  AbsoluteFill,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { prog } from "../lib/motion";
import { E3D, ICON, MaskLine, Sfx } from "../lib/ui";
import { C, DISPLAY } from "../theme";

// Еда «высыпается» вокруг заголовка
const FOOD = [
  { c: ICON.burger, x: 90, y: 230, s: 300, r: -14, d: 2 },
  { c: ICON.pizza, x: 700, y: 170, s: 280, r: 18, d: 6 },
  { c: ICON.donut, x: 760, y: 1330, s: 260, r: -10, d: 10 },
  { c: ICON.spaghetti, x: 60, y: 1380, s: 300, r: 8, d: 14 },
  { c: ICON.croissant, x: 420, y: 1560, s: 220, r: -20, d: 18 },
];

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // число мелькает, пытаясь «угадать»
  const guess = Math.round(150 + random(`n${Math.floor(f / 2)}`) * 1100);
  const num = prog(f, 24, 14);
  const zoom = 1 + f * 0.0015; // медленный наезд камеры

  return (
    <AbsoluteFill style={{ background: C.cream, transform: `scale(${zoom})` }}>
      {FOOD.map((it, i) => {
        const s = spring({
          frame: f - it.d,
          fps,
          config: { damping: 11, mass: 0.7 },
        });
        const bob = Math.sin((f + i * 20) / 14) * 10;
        return (
          <div key={i}>
            <Sfx at={it.d} name="pop" volume={0.25} />
            <E3D
              code={it.c}
              size={it.s}
              style={{
                position: "absolute",
                left: it.x,
                top: it.y + bob,
                transform: `scale(${s}) rotate(${it.r + (1 - s) * 60}deg)`,
                filter: "drop-shadow(0 30px 40px rgba(14,26,20,0.18))",
              }}
            />
          </div>
        );
      })}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          fontFamily: DISPLAY,
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontWeight: 900,
            fontSize: 100,
            lineHeight: 1.02,
            letterSpacing: -3,
          }}
        >
          <MaskLine at={0}>
            <span style={{ color: C.ink }}>СКОЛЬКО</span>
          </MaskLine>
          <MaskLine at={4}>
            <span style={{ color: C.orange }}>КАЛОРИЙ</span>
          </MaskLine>
          <MaskLine at={8}>
            <span style={{ color: C.ink }}>НА ТАРЕЛКЕ?</span>
          </MaskLine>
        </div>
        <div
          style={{
            marginTop: 50,
            fontSize: 150,
            fontWeight: 900,
            color: C.ink,
            opacity: num,
            transform: `scale(${0.6 + num * 0.4})`,
            fontVariantNumeric: "tabular-nums",
            background: C.lime,
            padding: "10px 50px",
            borderRadius: 40,
          }}
        >
          {guess}?
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
