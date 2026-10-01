import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Background, Flash, Scene} from './ui';
import {Chat, Hook, Outro, Photo, Reveal, Today, Week} from './scenes';

// Длительности сцен в кадрах (30 fps). Склейки попадают в долю бита 120 BPM (15 кадров).
export const SCENES = [
  {C: Hook, d: 60},
  {C: Reveal, d: 60},
  {C: Chat, d: 180},
  {C: Photo, d: 120},
  {C: Today, d: 105},
  {C: Week, d: 75},
  {C: Outro, d: 90},
];

const starts = SCENES.reduce<number[]>((a, s, i) => [...a, i ? a[i - 1] + SCENES[i - 1].d : 0], []);
export const CUTS = starts.slice(1);
export const TOTAL = starts[starts.length - 1] + SCENES[SCENES.length - 1].d;

export const Promo = () => (
  <AbsoluteFill>
    <Background />
    {SCENES.map(({C, d}, i) => (
      <Sequence key={i} from={starts[i]} durationInFrames={d}>
        <Scene dur={d}>
          <C />
        </Scene>
      </Sequence>
    ))}
    <Flash at={CUTS} />
    <Audio src={staticFile('soundtrack.wav')} />
  </AbsoluteFill>
);
