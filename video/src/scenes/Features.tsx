import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { E3D, ICON, MaskLine, Sfx } from "../lib/ui";
import { C, DISPLAY } from "../theme";

const CARDS = [
  {
    c: ICON.camera,
    word: "ФОТО",
    sub: "или просто текст",
    bg: C.lime,
    fg: C.forest,
  },
  {
    c: ICON.target,
    word: "НОРМА",
    sub: "КБЖУ под твою цель",
    bg: C.forest,
    fg: C.cream,
  },
  {
    c: ICON.chart,
    word: "ИТОГИ",
    sub: "за день и неделю",
    bg: C.orange,
    fg: C.white,
  },
  {
    c: ICON.drop,
    word: "ВОДА",
    sub: "в одно касание",
    bg: C.sky,
    fg: C.forest,
  },
];
export const FEATURE_LEN = 30;

// Один экран — одна фича: жёсткая склейка, гигантская иконка и слово
const Card: React.FC<(typeof CARDS)[number] & { i: number }> = ({
  c,
  word,
  sub,
  bg,
  fg,
  i,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 10, mass: 0.6 } });
  const drift = f * 1.2;
  return (
    <AbsoluteFill
      style={{
        background: bg,
        alignItems: "center",
        justifyContent: "center",
        fontFamily: DISPLAY,
      }}
    >
      <Sfx at={0} name={i === 0 ? "whoosh" : "swipe"} volume={0.35} />
      {/* номер на фоне */}
      <div
        style={{
          position: "absolute",
          top: 120,
          right: 70,
          fontSize: 60,
          fontWeight: 900,
          color: fg,
          opacity: 0.35,
        }}
      >
        0{i + 1}
      </div>
      <E3D
        code={c}
        size={520}
        style={{
          transform: `scale(${s}) rotate(${(1 - s) * -40 + Math.sin(f / 8) * 4}deg) translateY(${-drift * 0.3}px)`,
          filter: "drop-shadow(0 40px 50px rgba(0,0,0,0.22))",
        }}
      />
      <MaskLine at={2} dur={12}>
        <div
          style={{
            fontSize: 200,
            fontWeight: 900,
            color: fg,
            letterSpacing: -8,
            lineHeight: 1,
          }}
        >
          {word}
        </div>
      </MaskLine>
      <MaskLine at={6} dur={12}>
        <div
          style={{ fontSize: 54, fontWeight: 700, color: fg, opacity: 0.85 }}
        >
          {sub}
        </div>
      </MaskLine>
    </AbsoluteFill>
  );
};

export const Features: React.FC = () => (
  <AbsoluteFill>
    {CARDS.map((card, i) => (
      <Sequence
        key={card.word}
        from={i * FEATURE_LEN}
        durationInFrames={FEATURE_LEN}
      >
        <Card {...card} i={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

export const FEATURES_FRAMES = CARDS.length * FEATURE_LEN;
