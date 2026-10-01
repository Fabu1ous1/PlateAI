import {Composition} from 'remotion';
import {Promo, TOTAL} from './Promo';

export const RemotionRoot = () => (
  <Composition id="PlateAIPromo" component={Promo} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
