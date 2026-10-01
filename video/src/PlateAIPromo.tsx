import { linearTiming, springTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Background } from "./components/Background";
import { Brand } from "./scenes/Brand";
import { ChatDemo } from "./scenes/ChatDemo";
import { Cta } from "./scenes/Cta";
import { DayProgress } from "./scenes/DayProgress";
import { Hook } from "./scenes/Hook";
import { Pain } from "./scenes/Pain";
import { PhotoDemo } from "./scenes/PhotoDemo";
import { Week } from "./scenes/Week";

export const PlateAIPromo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence name="Hook" durationInFrames={75} premountFor={fps}>
          <Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence name="Pain" durationInFrames={95} premountFor={fps}>
          <Pain />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence name="Brand" durationInFrames={75} premountFor={fps}>
          <Brand />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 18 })}
        />
        <TransitionSeries.Sequence name="Chat demo" durationInFrames={200} premountFor={fps}>
          <ChatDemo />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 18 })}
        />
        <TransitionSeries.Sequence name="Photo demo" durationInFrames={160} premountFor={fps}>
          <PhotoDemo />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 18 })}
        />
        <TransitionSeries.Sequence name="Day progress" durationInFrames={130} premountFor={fps}>
          <DayProgress />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence name="Week" durationInFrames={110} premountFor={fps}>
          <Week />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence name="CTA" durationInFrames={130} premountFor={fps}>
          <Cta />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
