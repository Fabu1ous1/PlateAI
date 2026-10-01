// Синтезирует саундтрек под ролик (120 BPM, 23 с) без внешних сэмплов → public/soundtrack.wav
import {writeFileSync, mkdirSync} from 'node:fs';

const SR = 44100;
const DUR = 23;
const N = SR * DUR;
const L = new Float32Array(N);
const R = new Float32Array(N);
const BEAT = 0.5;
const FPS = 30;

let seed = 1;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const add = (t0, len, fn, gain = 1, pan = 0) => {
  const s0 = Math.floor(t0 * SR);
  for (let i = 0; i < len * SR; i++) {
    const k = s0 + i;
    if (k < 0 || k >= N) continue;
    const v = fn(i / SR) * gain;
    L[k] += v * (1 - Math.max(0, pan));
    R[k] += v * (1 + Math.min(0, pan));
  }
};
const note = (m) => 440 * 2 ** ((m - 69) / 12);

const kick = (t, g = 1) =>
  add(t, 0.45, (x) => {
    const ph = 2 * Math.PI * (45 * x + (110 / 28) * (1 - Math.exp(-28 * x)));
    return Math.sin(ph) * Math.exp(-6 * x) + (x < 0.004 ? rnd() * 0.5 : 0);
  }, g);
const hat = (t, g = 0.18, pan = 0.3) => {
  let prev = 0;
  add(t, 0.06, (x) => {
    const n = rnd();
    const hp = n - prev;
    prev = n;
    return hp * Math.exp(-70 * x);
  }, g, pan);
};
const clap = (t, g = 0.35) =>
  add(t, 0.25, (x) => {
    const env = [0, 0.01, 0.02].reduce((s, o) => s + (x >= o ? Math.exp(-60 * (x - o)) : 0), 0) + 0.5 * Math.exp(-14 * x);
    return rnd() * env * 0.6;
  }, g);
const impact = (t, g = 1) => {
  kick(t, g);
  add(t, 1.6, (x) => rnd() * Math.exp(-3.5 * x) * 0.35 + Math.sin(2 * Math.PI * 38 * x) * Math.exp(-2.2 * x), g * 0.8);
};
const whoosh = (t, len = 0.5, g = 0.35) => {
  let lp = 0;
  add(t - len, len, (x) => {
    const p = x / len;
    const a = 0.02 + 0.5 * p * p;
    lp += a * (rnd() - lp);
    return lp * p * p * 2;
  }, g);
};
const riser = (t0, len, g = 0.25) =>
  add(t0, len, (x) => {
    const p = x / len;
    const f = 200 + 1800 * p * p;
    return (Math.sin(2 * Math.PI * f * x) * 0.4 + rnd() * 0.3 * p) * p * p;
  }, g);
const saw = (f, x) => 2 * ((f * x) % 1) - 1;
const stab = (t, notes, len, g = 0.09) =>
  notes.forEach((m, j) =>
    [-0.12, 0, 0.12].forEach((dt, k) =>
      add(t, len, (x) => saw(note(m + dt), x) * Math.min(1, x * 200) * Math.exp(-3 * x), g / 3, (k - 1) * 0.6 * (j % 2 ? 1 : -1)),
    ),
  );
const bass = (t, m, len, g = 0.32) =>
  add(t, len, (x) => {
    const f = note(m);
    return (Math.sin(2 * Math.PI * f * x) + 0.3 * Math.sin(4 * Math.PI * f * x)) * Math.min(1, x * 300) * Math.min(1, (len - x) * 40) * (1 - 0.6 * Math.exp(-12 * x) * 0);
  }, g);
const blip = (t, f, g = 0.12, len = 0.05) => add(t, len, (x) => Math.sin(2 * Math.PI * f * x) * Math.exp(-60 * x), g);
const pop = (t, g = 0.3) => add(t, 0.15, (x) => Math.sin(2 * Math.PI * (300 + 900 * Math.exp(-40 * x)) * x) * Math.exp(-25 * x), g);

const fr = (f) => f / FPS;

// ---- Хук (0–2 с): удары на каждое слово + подъём
[0, 8, 16, 24].forEach((f, i) => impact(fr(f), 0.55 + i * 0.12));
riser(0.9, 1.1, 0.3);
whoosh(2.0, 0.6, 0.5);

// ---- Дроп и бит (2–20 с)
const PROG = [
  [57, [69, 72, 76]], // Am
  [53, [69, 72, 77]], // F
  [48, [67, 72, 76]], // C
  [55, [67, 71, 74]], // G
];
impact(2.0, 1.1);
for (let t = 2.0; t < 20 - 1e-6; t += BEAT) {
  const b = Math.round((t - 2) / BEAT);
  kick(t, 0.9);
  hat(t + BEAT / 2, 0.2, 0.35);
  hat(t + BEAT / 4, 0.07, -0.35);
  hat(t + (3 * BEAT) / 4, 0.07, -0.35);
  if (b % 2 === 1) clap(t);
  if (b % 4 === 0) {
    const [root, chord] = PROG[(b / 4) % 4];
    bass(t, root - 12, BEAT * 1.5);
    bass(t + BEAT * 1.5, root - 12, BEAT * 0.5);
    bass(t + BEAT * 2, root, BEAT * 0.5);
    bass(t + BEAT * 2.5, root - 12, BEAT * 1.5);
    stab(t, chord, 0.35);
    stab(t + BEAT * 1.5, chord, 0.25, 0.06);
    stab(t + BEAT * 3, chord, 0.25, 0.06);
  }
}

// ---- Склейки: вжух перед каждой
[120, 300, 420, 525, 600].forEach((f) => whoosh(fr(f), 0.4, 0.3));

// ---- Чат (с 4 с): клики набора, поп сообщений, звук подсчёта
const CHAT = 120;
const MSG_LEN = '2 яйца и 150 г гречки'.length;
for (let i = 1; i <= MSG_LEN; i++) blip(fr(CHAT + 18 + i * 1.6), 2400 + rnd() * 600, 0.07, 0.02);
pop(fr(CHAT + 56), 0.35);
pop(fr(CHAT + 86), 0.35);
for (let i = 0; i < 5; i++) blip(fr(CHAT + 94 + i * 7), 880 * 2 ** (i / 12 * 3), 0.1);

// ---- Фото: сканер + щелчки рамок + итог
add(fr(300 + 14), 1.2, (x) => {
  const f = 400 + 700 * (x / 1.2);
  return Math.sin(2 * Math.PI * f * x + 3 * Math.sin(2 * Math.PI * 7 * x)) * 0.5 * Math.sin(Math.PI * (x / 1.2));
}, 0.12);
[22, 31, 40].forEach((f, i) => blip(fr(300 + f), 1320 + i * 220, 0.18, 0.08));
for (let i = 0; i < 10; i++) blip(fr(300 + 60 + i * 3), 1500 + i * 60, 0.05, 0.02);

// ---- Итоги дня и неделя: тики роста
for (let i = 0; i < 8; i++) blip(fr(420 + 40 + i * 5), 1046, 0.06, 0.04);
for (let i = 0; i < 7; i++) blip(fr(525 + 6 + i * 3), 660 * 2 ** (i / 12 * 2), 0.09, 0.05);

// ---- Финал (20 с): удар + длинный аккорд
riser(19.0, 1.0, 0.25);
impact(20.0, 1.2);
[57, 64, 69, 72, 76].forEach((m, j) =>
  [-0.08, 0.08].forEach((dt, k) =>
    add(20.0, 3, (x) => saw(note(m + dt), x) * Math.min(1, x * 10) * Math.exp(-0.9 * x) * (0.5 + 0.5 * Math.sin(x * 3)), 0.035, k ? 0.5 : -0.5),
  ),
);
bass(20.0, 45, 2.8, 0.35);

// ---- Мастеринг: мягкий клиппер, нормализация, фейд в конце
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * 1.2);
  R[i] = Math.tanh(R[i] * 1.2);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const fade = Math.min(1, (N - i) / (SR * 0.6));
  buf.writeInt16LE(Math.round(L[i] * norm * fade * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(R[i] * norm * fade * 32767), 46 + i * 4);
}
mkdirSync(new URL('../public/', import.meta.url), {recursive: true});
writeFileSync(new URL('../public/soundtrack.wav', import.meta.url), buf);
console.log('public/soundtrack.wav готов');
