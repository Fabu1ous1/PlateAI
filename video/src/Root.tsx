import "./index.css";
import { Composition, Folder } from "remotion";
import { Cover } from "./Cover";
import {
  FULL_FRAMES,
  PlateAIPromo,
  PlateAIPromoShort,
  promoSchema,
  SHORT_FRAMES,
} from "./PlateAIPromo";
import { FPS } from "./theme";

// Впиши юзернейм бота, например "@PlateAI_bot" — он появится на финальном экране
const defaultProps = { botHandle: "", music: true };

export const RemotionRoot: React.FC = () => (
  <Folder name="PlateAI">
    <Composition
      id="PlateAIPromo"
      component={PlateAIPromo}
      schema={promoSchema}
      defaultProps={defaultProps}
      durationInFrames={FULL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="PlateAIPromoShort"
      component={PlateAIPromoShort}
      schema={promoSchema}
      defaultProps={defaultProps}
      durationInFrames={SHORT_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="PlateAICover"
      component={Cover}
      durationInFrames={1}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </Folder>
);
