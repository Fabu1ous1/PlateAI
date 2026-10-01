import { AbsoluteFill, Series } from "remotion";
import { z } from "zod";
import { Brand } from "./scenes/Brand";
import { Cta } from "./scenes/Cta";
import { Demo, DEMO_FRAMES } from "./scenes/Demo";
import { Features, FEATURES_FRAMES } from "./scenes/Features";
import { Hook } from "./scenes/Hook";
import { Pain } from "./scenes/Pain";
import { C } from "./theme";

export const promoSchema = z.object({ botHandle: z.string() });
type Props = z.infer<typeof promoSchema>;

// Жёсткие склейки в ритме ~120 BPM: сцены кратны полубиту (15 кадров)
const FULL = [
  { frames: 75, el: () => <Hook /> },
  { frames: 75, el: () => <Pain /> },
  { frames: 60, el: () => <Brand /> },
  { frames: DEMO_FRAMES, el: () => <Demo /> },
  { frames: FEATURES_FRAMES, el: () => <Features /> },
  { frames: 105, el: (p: Props) => <Cta botHandle={p.botHandle} /> },
];
const SHORT = [
  { frames: 60, el: () => <Hook /> },
  { frames: DEMO_FRAMES, el: () => <Demo /> },
  { frames: 90, el: (p: Props) => <Cta botHandle={p.botHandle} /> },
];
type Scene = (typeof FULL)[number];

const sum = (s: Scene[]) => s.reduce((a, x) => a + x.frames, 0);
export const FULL_FRAMES = sum(FULL);
export const SHORT_FRAMES = sum(SHORT);

const Promo: React.FC<Props & { scenes: Scene[] }> = ({ scenes, ...p }) => (
  <AbsoluteFill style={{ background: C.cream }}>
    <Series>
      {scenes.map((s, i) => (
        <Series.Sequence key={i} durationInFrames={s.frames}>
          {s.el(p)}
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);

export const PlateAIPromo: React.FC<Props> = (p) => (
  <Promo {...p} scenes={FULL} />
);
export const PlateAIPromoShort: React.FC<Props> = (p) => (
  <Promo {...p} scenes={SHORT} />
);
