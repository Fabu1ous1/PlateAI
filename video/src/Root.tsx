import { Composition } from "remotion";
import { PlateAIPromo } from "./PlateAIPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PlateAIPromo"
      component={PlateAIPromo}
      durationInFrames={875}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
