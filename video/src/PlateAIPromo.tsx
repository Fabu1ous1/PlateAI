import {
  linearTiming,
  TransitionPresentation,
  TransitionSeries,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Fragment } from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
} from "remotion";
import { z } from "zod";
import { Background } from "./components/Background";
import { Sfx } from "./components/Sfx";
import { ChatDemo, CHAT_DEMO_FRAMES } from "./scenes/ChatDemo";
import { Cta } from "./scenes/Cta";
import { Features } from "./scenes/Features";
import { Hook } from "./scenes/Hook";
import { Intro } from "./scenes/Intro";
import { Problem } from "./scenes/Problem";
import { C, FPS } from "./theme";

export const promoSchema = z.object({
  botHandle: z.string(),
  music: z.boolean(),
});
type Props = z.infer<typeof promoSchema>;

type Scene = {
  frames: number;
  el: (p: Props) => React.ReactNode;
  // переход ПЕРЕД этой сценой
  enter?: TransitionPresentation<Record<string, unknown>>;
};

const TR = 12;
const timing = linearTiming({ durationInFrames: TR });
const fadeT = fade() as TransitionPresentation<Record<string, unknown>>;
const up = slide({ direction: "from-bottom" }) as TransitionPresentation<
  Record<string, unknown>
>;
const left = slide({ direction: "from-right" }) as TransitionPresentation<
  Record<string, unknown>
>;

// Полная версия ~27 c
const FULL: Scene[] = [
  { frames: 90, el: () => <Hook /> },
  { frames: 90, el: () => <Problem />, enter: up },
  { frames: 80, el: () => <Intro />, enter: fadeT },
  { frames: CHAT_DEMO_FRAMES, el: () => <ChatDemo />, enter: fadeT },
  { frames: 150, el: () => <Features />, enter: left },
  { frames: 120, el: (p) => <Cta botHandle={p.botHandle} />, enter: fadeT },
];

// Короткая версия ~16 c: крючок → демо → призыв
const SHORT: Scene[] = [
  { frames: 75, el: () => <Hook /> },
  { frames: CHAT_DEMO_FRAMES, el: () => <ChatDemo />, enter: up },
  { frames: 100, el: (p) => <Cta botHandle={p.botHandle} />, enter: fadeT },
];

const total = (s: Scene[]) =>
  s.reduce((a, x) => a + x.frames, 0) - TR * (s.length - 1);
export const FULL_FRAMES = total(FULL);
export const SHORT_FRAMES = total(SHORT);

// Кадр начала каждой сцены — для «вжухов» на переходах
const starts = (s: Scene[]) =>
  s.map((_, i) => s.slice(0, i).reduce((a, x) => a + x.frames - TR, 0));

// Музыка написана так, что бит вступает на 5.2 c (вместе с логотипом).
// В короткой версии сдвигаем трек, чтобы бит совпал с началом демо.
const DROP = 5.2 * FPS;

const Promo: React.FC<Props & { scenes: Scene[] }> = ({ scenes, ...p }) => {
  const len = total(scenes);
  const dropScene = scenes === FULL ? 2 : 1;
  const musicStart = Math.max(0, Math.round(DROP - starts(scenes)[dropScene]));
  return (
    <AbsoluteFill style={{ background: C.bg, color: C.text }}>
      <Background />
      <TransitionSeries>
        {scenes.map((s, i) => (
          <Fragment key={i}>
            {s.enter ? (
              <TransitionSeries.Transition
                presentation={s.enter}
                timing={timing}
              />
            ) : null}
            <TransitionSeries.Sequence durationInFrames={s.frames}>
              {s.el(p)}
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>
      {starts(scenes)
        .slice(1)
        .map((f) => (
          <Sfx key={f} at={f - 4} name="whoosh" volume={0.35} />
        ))}
      {p.music ? (
        <Sequence layout="none" name="music">
          <Audio
            src={staticFile("sfx/music.wav")}
            trimBefore={musicStart}
            volume={(f) =>
              interpolate(f, [0, 10, len - 20, len], [0, 0.45, 0.45, 0], {
                extrapolateRight: "clamp",
              })
            }
          />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

export const PlateAIPromo: React.FC<Props> = (p) => (
  <Promo {...p} scenes={FULL} />
);
export const PlateAIPromoShort: React.FC<Props> = (p) => (
  <Promo {...p} scenes={SHORT} />
);
