import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing, random} from 'remotion';
import {BODY, C, Caption, DISPLAY, EMOJI, Emoji, Hl, clamp, countUp, useSpring} from './ui';

const TXT = `${BODY}, ${EMOJI}`;

/* ============================== 1. Хук ============================== */

const HOOK = [
  {t: 'СКОЛЬКО', c: C.text},
  {t: 'КАЛОРИЙ', c: C.lime},
  {t: 'В ТВОЕЙ', c: C.text},
  {t: 'ТАРЕЛКЕ?', c: C.pink},
];

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const shake = f > 34 && f < 44 ? (random(`s${f}`) - 0.5) * 30 : 0;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `translateX(${shake}px)`}}>
      {['🍔', '🍕', '🍣', '🥗', '🍩', '🍜'].map((e, i) => {
        const p = useSpring(36 + i * 2, {damping: 9});
        const ang = (i / 6) * Math.PI * 2 + f / 40;
        const r = 700 + Math.sin(f / 10 + i) * 20;
        return (
          <Emoji
            key={e}
            size={140}
            style={{
              position: 'absolute',
              left: 540 + Math.cos(ang) * r * 0.75 - 70,
              top: 960 + Math.sin(ang) * r - 70,
              transform: `scale(${p}) rotate(${Math.sin(f / 8 + i) * 15}deg)`,
              filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))',
            }}
          >
            {e}
          </Emoji>
        );
      })}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
        {HOOK.map((w, i) => {
          const d = i * 8;
          const p = interpolate(f, [d, d + 6], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
          return (
            <div
              key={w.t}
              style={{
                fontFamily: DISPLAY,
                fontWeight: 900,
                fontSize: 132,
                letterSpacing: -5,
                lineHeight: 1,
                color: w.c,
                textShadow: w.c !== C.text ? `0 0 60px ${w.c}` : 'none',
                transform: `scale(${interpolate(p, [0, 1], [3, 1])})`,
                opacity: p,
              }}
            >
              {w.t}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ============================== 2. Решение ============================== */

export const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const a = useSpring(0, {damping: 11});
  const b = useSpring(14, {damping: 9, stiffness: 200});
  const glitch = f > 14 && f < 22 ? (random(`g${f}`) - 0.5) * 40 : 0;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 64,
          color: C.dim,
          opacity: a,
          transform: `translateY(${(1 - a) * 60 - 260}px)`,
          position: 'absolute',
          textAlign: 'center',
          lineHeight: 1.25,
        }}
      >
        Не гадай.
        <br />
        <span style={{textDecoration: 'line-through', textDecorationColor: C.pink}}>Не взвешивай.</span>
      </div>
      <div
        style={{
          position: 'absolute',
          transform: `scale(${b}) translateX(${glitch}px)`,
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 190,
          letterSpacing: -8,
          color: C.text,
          textShadow: `${glitch / 3}px 0 0 ${C.pink}, ${-glitch / 3}px 0 0 ${C.cyan}, 0 0 80px ${C.lime}66`,
        }}
      >
        Plate<span style={{color: C.lime}}>AI</span>
      </div>
      <div
        style={{
          position: 'absolute',
          transform: `translateY(${170 + (1 - useSpring(22)) * 50}px)`,
          opacity: useSpring(22),
          fontFamily: TXT,
          fontWeight: 800,
          fontSize: 54,
          color: C.text,
        }}
      >
        считает за тебя ⚡
      </div>
    </AbsoluteFill>
  );
};

/* ============================== Телефон с Telegram ============================== */

const Phone: React.FC<{children: React.ReactNode; inputText?: string; caret?: boolean}> = ({children, inputText, caret}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: 150,
        top: 420,
        width: 780,
        height: 1380,
        borderRadius: 90,
        background: '#0E1016',
        border: '10px solid #2A2E3A',
        boxShadow: `0 60px 140px rgba(0,0,0,0.7), 0 0 120px ${C.lime}22, inset 0 0 0 2px #3A3F4F`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: TXT,
      }}
    >
      <div style={{height: 70}} />
      <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '18px 36px', background: '#171A23', borderBottom: '1px solid #23273A'}}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            background: `linear-gradient(135deg, ${C.lime}, ${C.cyan})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Emoji size={46}>🍽</Emoji>
        </div>
        <div>
          <div style={{color: C.text, fontWeight: 800, fontSize: 38}}>PlateAI</div>
          <div style={{color: C.cyan, fontWeight: 500, fontSize: 28}}>бот · онлайн</div>
        </div>
      </div>
      <div style={{flex: 1, padding: '30px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 22}}>
        {children}
      </div>
      <div style={{padding: '22px 30px 50px', background: '#171A23', display: 'flex', alignItems: 'center', gap: 18}}>
        <div
          style={{
            flex: 1,
            background: '#0E1016',
            borderRadius: 40,
            padding: '24px 32px',
            fontSize: 34,
            color: inputText ? C.text : C.dim,
            minHeight: 44,
          }}
        >
          {inputText || 'Что съел?'}
          {caret && <span style={{opacity: Math.floor(f / 8) % 2 ? 0 : 1, color: C.lime}}>|</span>}
        </div>
        <div style={{width: 84, height: 84, borderRadius: 42, background: C.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Emoji size={40}>{inputText ? '➤' : '📸'}</Emoji>
        </div>
      </div>
    </div>
  );
};

const Bubble: React.FC<{me?: boolean; delay: number; children: React.ReactNode}> = ({me, delay, children}) => {
  const s = useSpring(delay, {damping: 13, stiffness: 220});
  return (
    <div
      style={{
        alignSelf: me ? 'flex-end' : 'flex-start',
        maxWidth: '94%',
        background: me ? C.bubbleMe : C.bubbleBot,
        color: C.text,
        borderRadius: 34,
        borderBottomRightRadius: me ? 8 : 34,
        borderBottomLeftRadius: me ? 34 : 8,
        padding: '22px 30px',
        fontSize: 33,
        lineHeight: 1.4,
        transformOrigin: me ? 'bottom right' : 'bottom left',
        transform: `scale(${s})`,
        opacity: s,
      }}
    >
      {children}
    </div>
  );
};

const Dots: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', gap: 10, padding: '6px 4px'}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{width: 16, height: 16, borderRadius: 8, background: C.dim, transform: `translateY(${Math.sin(f / 3 - i) * 6}px)`}} />
      ))}
    </div>
  );
};

const MSG = '2 яйца и 150 г гречки';

export const Chat: React.FC = () => {
  const f = useCurrentFrame();
  const phone = useSpring(0, {damping: 16});
  const typed = MSG.slice(0, Math.max(0, Math.floor((f - 18) / 1.6)));
  const sent = f >= 56;
  const botAt = 86;
  const line = (i: number) => {
    const p = interpolate(f, [botAt + 8 + i * 7, botAt + 16 + i * 7], [0, 1], clamp);
    return {opacity: p, transform: `translateX(${(1 - p) * -30}px)`};
  };
  const zoom = interpolate(f, [130, 175], [1, 1.12], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill>
      <Caption>
        Просто <Hl>напиши</Hl>,<br />что съел
      </Caption>
      <AbsoluteFill style={{transform: `translateY(${(1 - phone) * 900}px) scale(${zoom})`, transformOrigin: '50% 70%'}}>
        <Phone inputText={sent ? '' : typed} caret={!sent && f > 14}>
          {sent && <Bubble me delay={56}>{MSG}</Bubble>}
          {f >= 62 && f < botAt && (
            <Bubble delay={62}>
              <Dots />
            </Bubble>
          )}
          {f >= botAt && (
            <Bubble delay={botAt}>
              <div style={{fontWeight: 800, ...line(0)}}>✅ Записал</div>
              <div style={{height: 14}} />
              <div style={line(1)}>
                🥚 Яйцо варёное, 2 шт — <b>157 ккал</b>
              </div>
              <div style={line(2)}>
                🍚 Гречка варёная, 150 г — <b>165 ккал</b>
              </div>
              <div style={{height: 14}} />
              <div style={{fontWeight: 800, fontSize: 40, color: C.lime, ...line(3)}}>
                Итого: {countUp(f, 0, 322, botAt + 28, 22)} ккал
              </div>
              <div style={line(4)}>🥩 Б 19 · 🧈 Ж 12 · 🍞 У 33</div>
            </Bubble>
          )}
        </Phone>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ============================== 4. Фото ============================== */

const FOODS = [
  {e: '🥩', name: 'Стейк', amt: '~200 г', kcal: 540, x: 330, y: 820, s: 230, below: false},
  {e: '🥔', name: 'Картофель', amt: '~150 г', kcal: 140, x: 720, y: 860, s: 180, below: false},
  {e: '🥗', name: 'Салат', amt: '~120 г', kcal: 130, x: 520, y: 1170, s: 200, below: true},
];

export const Photo: React.FC = () => {
  const f = useCurrentFrame();
  const plate = useSpring(0, {damping: 12});
  const scanY = interpolate(f, [14, 50], [620, 1400], {...clamp, easing: Easing.inOut(Easing.quad)});
  const scanOn = f > 12 && f < 54;
  const total = countUp(f, 0, 810, 60, 30);
  const totalS = useSpring(58, {damping: 10});
  return (
    <AbsoluteFill>
      <Caption>
        Или скинь <Hl c={C.cyan}>фото</Hl> 📸
      </Caption>
      {/* тарелка */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 400,
          top: 1010 - 400,
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 45%, #FAFAFF 0%, #DCDFEA 55%, #B9BDCB 62%, #EEF0F6 66%, #C9CCD8 100%)',
          boxShadow: '0 50px 120px rgba(0,0,0,0.7)',
          transform: `scale(${plate}) rotate(${(1 - plate) * -40}deg)`,
        }}
      />
      {FOODS.map((it, i) => {
        const p = useSpring(4 + i * 3, {damping: 10});
        return (
          <Emoji
            key={it.e}
            size={it.s}
            style={{
              position: 'absolute',
              left: it.x - it.s / 2,
              top: it.y - it.s / 2,
              transform: `scale(${p * plate})`,
              filter: 'drop-shadow(0 16px 20px rgba(0,0,0,0.35))',
            }}
          >
            {it.e}
          </Emoji>
        );
      })}
      {/* сканер */}
      {scanOn && (
        <div
          style={{
            position: 'absolute',
            left: 80,
            right: 80,
            top: scanY,
            height: 8,
            background: C.lime,
            boxShadow: `0 0 40px 12px ${C.lime}, 0 -120px 120px ${C.lime}33`,
            borderRadius: 4,
          }}
        />
      )}
      {/* рамки распознавания */}
      {FOODS.map((it, i) => {
        const at = 22 + i * 9;
        const p = useSpring(at, {damping: 12, stiffness: 240});
        const half = it.s / 2 + 22;
        const labelLeft = it.x > 600;
        return (
          <React.Fragment key={it.name}>
            <div
              style={{
                position: 'absolute',
                left: it.x - half,
                top: it.y - half,
                width: half * 2,
                height: half * 2,
                border: `5px solid ${C.lime}`,
                borderRadius: 26,
                boxShadow: `0 0 30px ${C.lime}99`,
                opacity: p,
                transform: `scale(${2 - p})`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: it.below ? it.y + half + 18 : it.y - half - 82 - (it.x > 600 ? 0 : 70),
                ...(labelLeft ? {right: 1080 - (it.x + half)} : {left: it.x - half}),
                background: C.lime,
                color: '#0A0C10',
                fontFamily: TXT,
                fontWeight: 800,
                fontSize: 36,
                padding: '12px 24px',
                borderRadius: 18,
                whiteSpace: 'nowrap',
                opacity: p,
                transform: `translateY(${(1 - p) * 30}px)`,
              }}
            >
              {it.name} {it.amt} · {it.kcal} ккал
            </div>
          </React.Fragment>
        );
      })}
      {/* итог */}
      <div
        style={{
          position: 'absolute',
          bottom: 150,
          left: 0,
          right: 0,
          textAlign: 'center',
          transform: `scale(${totalS})`,
          opacity: totalS,
        }}
      >
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 150, color: C.text, letterSpacing: -6, textShadow: `0 0 60px ${C.cyan}`}}>
          {total} <span style={{fontSize: 70, color: C.cyan}}>ккал</span>
        </div>
        <div style={{fontFamily: TXT, fontWeight: 700, fontSize: 40, color: C.dim}}>🥩 Б 54 · 🧈 Ж 50 · 🍞 У 36 — за 3 секунды</div>
      </div>
    </AbsoluteFill>
  );
};

/* ============================== 5. Итоги дня ============================== */

const MacroBar: React.FC<{label: string; v: number; goal: number; color: string; delay: number}> = ({label, v, goal, color, delay}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 26], [0, v / goal], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{fontFamily: TXT}}>
      <div style={{display: 'flex', justifyContent: 'space-between', color: C.text, fontSize: 40, fontWeight: 700, marginBottom: 12}}>
        <span>{label}</span>
        <span>
          <b style={{color}}>{Math.round(p * goal)}</b>
          <span style={{color: C.dim}}> / {goal} г</span>
        </span>
      </div>
      <div style={{height: 26, borderRadius: 13, background: '#1E2130', overflow: 'hidden'}}>
        <div style={{width: `${p * 100}%`, height: '100%', borderRadius: 13, background: color, boxShadow: `0 0 24px ${color}`}} />
      </div>
    </div>
  );
};

export const Today: React.FC = () => {
  const f = useCurrentFrame();
  const goal = 2000;
  const eaten = countUp(f, 0, 1640, 8, 40);
  const R = 250;
  const L = 2 * Math.PI * R;
  const p = eaten / goal;
  const card = useSpring(4, {damping: 15});
  const water = interpolate(f, [40, 80], [0, 6], clamp);
  return (
    <AbsoluteFill>
      <Caption>
        Весь день —<br />
        <Hl c={C.yellow}>на одном экране</Hl>
      </Caption>
      <div style={{position: 'absolute', left: 540 - 300, top: 470, width: 600, height: 600, transform: `scale(${card})`}}>
        <svg width={600} height={600} style={{transform: 'rotate(-90deg)'}}>
          <circle cx={300} cy={300} r={R} stroke="#1E2130" strokeWidth={46} fill="none" />
          <circle
            cx={300}
            cy={300}
            r={R}
            stroke="url(#g)"
            strokeWidth={46}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={L}
            strokeDashoffset={L * (1 - p)}
            style={{filter: `drop-shadow(0 0 20px ${C.lime})`}}
          />
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={C.cyan} />
              <stop offset="100%" stopColor={C.lime} />
            </linearGradient>
          </defs>
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 130, color: C.text, letterSpacing: -5}}>{eaten}</div>
          <div style={{fontFamily: TXT, fontWeight: 700, fontSize: 40, color: C.dim}}>из {goal} ккал</div>
          <div style={{fontFamily: TXT, fontWeight: 800, fontSize: 38, color: C.lime, marginTop: 10}}>осталось {goal - eaten}</div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 90,
          right: 90,
          top: 1140,
          display: 'flex',
          flexDirection: 'column',
          gap: 34,
          opacity: card,
          transform: `translateY(${(1 - card) * 100}px)`,
        }}
      >
        <MacroBar label="🥩 Белки" v={96} goal={130} color={C.pink} delay={16} />
        <MacroBar label="🧈 Жиры" v={58} goal={67} color={C.yellow} delay={22} />
        <MacroBar label="🍞 Углеводы" v={180} goal={225} color={C.cyan} delay={28} />
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, fontFamily: TXT}}>
          <span style={{color: C.text, fontSize: 40, fontWeight: 700}}>
            💧 Вода <b style={{color: C.cyan}}>{(water / 4).toFixed(1).replace('.0', '')}</b>
            <span style={{color: C.dim}}> / 2 л</span>
          </span>
          <span>
            {Array.from({length: 8}, (_, i) => (
              <Emoji key={i} size={46} style={{opacity: i < water ? 1 : 0.18, marginLeft: 4, transform: `scale(${i < water ? 1 : 0.8})`}}>
                💧
              </Emoji>
            ))}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ============================== 6. Неделя ============================== */

const WEEK = [
  {d: 'Пн', v: 1820},
  {d: 'Вт', v: 2050},
  {d: 'Ср', v: 1930},
  {d: 'Чт', v: 1760},
  {d: 'Пт', v: 2210},
  {d: 'Сб', v: 1990},
  {d: 'Вс', v: 1640},
];

export const Week: React.FC = () => {
  const f = useCurrentFrame();
  const goal = 2000;
  const H = 760;
  const max = 2400;
  const avg = Math.round(WEEK.reduce((s, x) => s + x.v, 0) / WEEK.length);
  const lineP = interpolate(f, [30, 46], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Caption>
        Неделя <Hl>под контролем</Hl> 📈
      </Caption>
      <div style={{position: 'absolute', left: 90, right: 90, top: 520, height: H, display: 'flex', alignItems: 'flex-end', gap: 26}}>
        {WEEK.map((x, i) => {
          const p = useSpring(6 + i * 3, {damping: 11});
          const pct = x.v / goal;
          const col = pct > 1 ? C.red : pct > 0.9 ? C.yellow : C.lime;
          return (
            <div key={x.d} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
              <div style={{fontFamily: TXT, fontWeight: 800, fontSize: 30, color: col, opacity: p}}>{x.v}</div>
              <div
                style={{
                  width: '100%',
                  height: (x.v / max) * H * p,
                  borderRadius: 22,
                  background: `linear-gradient(180deg, ${col}, ${col}55)`,
                  boxShadow: `0 0 30px ${col}66`,
                }}
              />
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${lineP * 100}%`,
            bottom: (goal / max) * H,
            borderTop: `4px dashed ${C.text}`,
            opacity: 0.7,
          }}
        />
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 520 + H + 70, display: 'flex', gap: 26}}>
        {WEEK.map((x) => (
          <div key={x.d} style={{flex: 1, textAlign: 'center', fontFamily: TXT, fontWeight: 700, fontSize: 36, color: C.dim}}>
            {x.d}
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 210,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: TXT,
          fontWeight: 800,
          fontSize: 52,
          color: C.text,
          opacity: useSpring(40),
        }}
      >
        В среднем <span style={{color: C.lime}}>{avg} ккал</span> / день
      </div>
    </AbsoluteFill>
  );
};

/* ============================== 7. Финал ============================== */

export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const logo = useSpring(0, {damping: 9, stiffness: 140});
  const tag = useSpring(14);
  const cta = useSpring(26, {damping: 10});
  const pulse = 1 + Math.sin(f / 5) * 0.03;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          border: `3px solid ${C.lime}`,
          opacity: interpolate(f, [0, 40], [0.8, 0], clamp),
          transform: `scale(${interpolate(f, [0, 40], [0.2, 1.6], clamp)})`,
        }}
      />
      <div
        style={{
          width: 300,
          height: 300,
          borderRadius: 90,
          background: `linear-gradient(135deg, ${C.lime}, ${C.cyan})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 120px ${C.lime}88`,
          transform: `scale(${logo}) rotate(${(1 - logo) * 180}deg) translateY(-260px)`,
          position: 'absolute',
        }}
      >
        <Emoji size={170}>🍽</Emoji>
      </div>
      <div
        style={{
          position: 'absolute',
          transform: `scale(${logo})`,
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 170,
          letterSpacing: -7,
          color: C.text,
          top: 1000,
        }}
      >
        Plate<span style={{color: C.lime, textShadow: `0 0 60px ${C.lime}`}}>AI</span>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1230,
          fontFamily: TXT,
          fontWeight: 700,
          fontSize: 50,
          color: C.text,
          opacity: tag,
          transform: `translateY(${(1 - tag) * 40}px)`,
          textAlign: 'center',
        }}
      >
        Калории и БЖУ — за 3 секунды
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1400,
          padding: '36px 70px',
          borderRadius: 80,
          background: C.lime,
          color: '#0A0C10',
          fontFamily: TXT,
          fontWeight: 800,
          fontSize: 50,
          boxShadow: `0 0 70px ${C.lime}AA`,
          transform: `scale(${cta * pulse})`,
        }}
      >
        Открой бота в Telegram ➜
      </div>
    </AbsoluteFill>
  );
};
