import "./index.css";
import { Composition } from "remotion";
import { PlateAIPromo, promoSchema, PROMO_FRAMES } from "./PlateAIPromo";
import { FPS } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="PlateAIPromo"
    component={PlateAIPromo}
    schema={promoSchema}
    // Впиши сюда юзернейм бота, например "@PlateAI_bot" — он появится на финальном экране
    defaultProps={{ botHandle: "" }}
    durationInFrames={PROMO_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
