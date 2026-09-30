import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { Background } from "./components/Background";
import { ChatDemo, CHAT_DEMO_FRAMES } from "./scenes/ChatDemo";
import { Cta } from "./scenes/Cta";
import { Features } from "./scenes/Features";
import { Hook } from "./scenes/Hook";
import { Intro } from "./scenes/Intro";
import { Problem } from "./scenes/Problem";
import { C } from "./theme";

export const promoSchema = z.object({
  botHandle: z.string(),
});

// Длительности сцен (кадры при 30 fps) и переходов между ними
const SCENES = { hook: 90, problem: 90, intro: 80, chat: CHAT_DEMO_FRAMES, features: 150, cta: 120 };
const TR = 12;
export const PROMO_FRAMES = Object.values(SCENES).reduce((a, b) => a + b, 0) - TR * 5;

const t = linearTiming({ durationInFrames: TR });

export const PlateAIPromo: React.FC<z.infer<typeof promoSchema>> = ({ botHandle }) => (
  <AbsoluteFill style={{ background: C.bg, color: C.text }}>
    <Background />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SCENES.hook}>
        <Hook />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={t} />
      <TransitionSeries.Sequence durationInFrames={SCENES.problem}>
        <Problem />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={t} />
      <TransitionSeries.Sequence durationInFrames={SCENES.intro}>
        <Intro />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={t} />
      <TransitionSeries.Sequence durationInFrames={SCENES.chat}>
        <ChatDemo />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={t} />
      <TransitionSeries.Sequence durationInFrames={SCENES.features}>
        <Features />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={t} />
      <TransitionSeries.Sequence durationInFrames={SCENES.cta}>
        <Cta botHandle={botHandle} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
