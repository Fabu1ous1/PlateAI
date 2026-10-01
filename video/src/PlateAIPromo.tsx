import { linearTiming, springTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Background } from "./components/Background";
import { ChatDemo } from "./scenes/ChatDemo";
import { Cta } from "./scenes/Cta";
import { DayProgress } from "./scenes/DayProgress";
import { Pain } from "./scenes/Pain";
import { PhotoDemo } from "./scenes/PhotoDemo";

// Reels cut: product in the first second, CTA with the bot handle at the end.
// Key content stays between y=200 and y=1560 so Instagram UI does not cover it.
export const PlateAIPromo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence name="Photo hook" durationInFrames={105} premountFor={fps}>
          <PhotoDemo />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
        <TransitionSeries.Sequence name="Pain" durationInFrames={62} premountFor={fps}>
          <Pain />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence name="Chat demo" durationInFrames={130} premountFor={fps}>
          <ChatDemo />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence name="Day progress" durationInFrames={105} premountFor={fps}>
          <DayProgress />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence name="CTA" durationInFrames={150} premountFor={fps}>
          <Cta />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
