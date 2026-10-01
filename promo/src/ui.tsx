import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {BODY, DISPLAY} from './fonts';

export {BODY, DISPLAY};
export const EMOJI = '"Noto Color Emoji"';

export const C = {
  bg: '#06060B',
  lime: '#B8FF3C',
  cyan: '#3CE4FF',
  pink: '#FF3D8B',
  yellow: '#FFD43C',
  red: '#FF4D4D',
  text: '#F4F6FF',
  dim: '#8A90A8',
  card: '#14161F',
  bubbleMe: '#2B5278',
  bubbleBot: '#1E2230',
};

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const useSpring = (delay = 0, config: Partial<{damping: number; stiffness: number; mass: number}> = {}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 14, stiffness: 160, mass: 0.8, ...config}});
};

export const countUp = (frame: number, from: number, to: number, start: number, dur: number) =>
  Math.round(interpolate(frame, [start, start + dur], [from, to], {...clamp, easing: Easing.out(Easing.cubic)}));

// Фон: тёмный, с плавающими неоновыми пятнами, сеткой и виньеткой
export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const blob = (x: number, y: number, r: number, color: string, sp: number, ph: number) => (
    <div
      style={{
        position: 'absolute',
        left: x + Math.sin(f / sp + ph) * 120,
        top: y + Math.cos(f / (sp * 1.3) + ph) * 160,
        width: r,
        height: r,
        borderRadius: '50%',
        background: color,
        filter: 'blur(160px)',
        opacity: 0.32,
      }}
    />
  );
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      {blob(-200, 100, 900, C.lime, 60, 0)}
      {blob(500, 900, 800, C.pink, 75, 2)}
      {blob(-100, 1300, 700, C.cyan, 55, 4)}
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
          backgroundPosition: `0 ${(f * 1.5) % 90}px`,
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)'}} />
    </AbsoluteFill>
  );
};

// Обёртка сцены: влёт с зумом/блюром и вылет
export const Scene: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [0, 10], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const outP = interpolate(f, [dur - 8, dur], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const scale = interpolate(inP, [0, 1], [1.15, 1]) * interpolate(outP, [0, 1], [1, 0.9]);
  const blur = (1 - inP) * 24 + outP * 20;
  return (
    <AbsoluteFill style={{transform: `scale(${scale})`, filter: `blur(${blur}px)`, opacity: Math.min(inP, 1 - outP)}}>
      {children}
    </AbsoluteFill>
  );
};

// Вспышка на склейке
export const Flash: React.FC<{at: number[]}> = ({at}) => {
  const f = useCurrentFrame();
  const o = Math.max(0, ...at.map((a) => interpolate(f, [a - 1, a, a + 7], [0, 0.55, 0], clamp)));
  return <AbsoluteFill style={{background: '#fff', opacity: o, mixBlendMode: 'overlay', pointerEvents: 'none'}} />;
};

// Заголовок-подпись над сценой
export const Caption: React.FC<{children: React.ReactNode; top?: number; delay?: number; size?: number}> = ({
  children,
  top = 150,
  delay = 4,
  size = 76,
}) => {
  const s = useSpring(delay, {damping: 12});
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 60,
        right: 60,
        textAlign: 'center',
        fontFamily: DISPLAY,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.08,
        color: C.text,
        letterSpacing: -2,
        transform: `translateY(${(1 - s) * 80}px) scale(${0.8 + s * 0.2})`,
        opacity: s,
        textShadow: '0 10px 40px rgba(0,0,0,0.6)',
      }}
    >
      {children}
    </div>
  );
};

export const Hl: React.FC<{c?: string; children: React.ReactNode}> = ({c = C.lime, children}) => (
  <span style={{color: c, textShadow: `0 0 30px ${c}88`}}>{children}</span>
);

export const Emoji: React.FC<{children: string; size?: number; style?: React.CSSProperties}> = ({children, size, style}) => (
  <span style={{fontFamily: EMOJI, fontSize: size, lineHeight: 1, ...style}}>{children}</span>
);
