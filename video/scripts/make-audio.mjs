// Синтезирует звуковые эффекты для ролика в public/sfx/*.wav.
// Никаких сторонних сэмплов — всё генерируется кодом, авторских прав нет.
// Запуск: node scripts/make-audio.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const SR = 44100;
const OUT = new URL("../public/sfx/", import.meta.url);
mkdirSync(OUT, { recursive: true });

// детерминированный шум, чтобы файлы не менялись от запуска к запуску
let seed = 1;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 2 ** 32) * 2 - 1;
};

const buf = (sec) => new Float32Array(Math.ceil(sec * SR));

function save(name, data, peak = 0.9) {
  let m = 0;
  for (const v of data) m = Math.max(m, Math.abs(v));
  const k = m > 0 ? peak / m : 1;
  const b = Buffer.alloc(44 + data.length * 2);
  b.write("RIFF", 0);
  b.writeUInt32LE(36 + data.length * 2, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24);
  b.writeUInt32LE(SR * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(data.length * 2, 40);
  data.forEach((v, i) => b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * k)) * 32767), 44 + i * 2));
  writeFileSync(new URL(name, OUT), b);
  console.log(name, (data.length / SR).toFixed(2) + "s");
}

// простые «кирпичики»
function addSine(out, at, dur, f0, f1, amp, decay) {
  const s = Math.floor(at * SR);
  let ph = 0;
  for (let i = 0; i < dur * SR && s + i < out.length; i++) {
    const t = i / SR;
    const f = f0 * Math.pow(f1 / f0, t / dur);
    ph += (2 * Math.PI * f) / SR;
    const atk = Math.min(1, t / 0.004);
    out[s + i] += Math.sin(ph) * amp * atk * Math.exp(-t * decay);
  }
}
function addNoise(out, at, dur, amp, decay, lp0 = 1, lp1 = lp0, hp = false) {
  const s = Math.floor(at * SR);
  let y = 0;
  let prev = 0;
  for (let i = 0; i < dur * SR && s + i < out.length; i++) {
    const t = i / SR;
    const a = lp0 + (lp1 - lp0) * (t / dur); // коэффициент однополюсного ФНЧ
    y += a * (noise() - y);
    const v = hp ? y - prev : y;
    prev = y;
    out[s + i] += v * amp * Math.min(1, t / 0.002) * Math.exp(-t * decay);
  }
}

// ── звуковые эффекты ──
{
  const o = buf(0.25);
  addSine(o, 0, 0.2, 1100, 380, 1, 28);
  save("pop.wav", o);
}
{
  const o = buf(0.5);
  const s = 0.5 * SR;
  let y = 0;
  for (let i = 0; i < s; i++) {
    const t = i / SR;
    const env = Math.sin(Math.PI * Math.min(1, t / 0.45)) ** 2;
    const a = 0.02 + 0.25 * Math.sin(Math.PI * Math.min(1, t / 0.45));
    y += a * (noise() - y);
    o[i] = y * env;
  }
  save("whoosh.wav", o, 0.7);
}
{
  // набор текста: серия щелчков с «человеческим» ритмом
  const o = buf(1.4);
  let t = 0.02;
  while (t < 1.3) {
    addNoise(o, t, 0.02, 1, 260, 0.9, 0.9, true);
    addSine(o, t, 0.015, 2600, 1800, 0.25, 300);
    t += 0.055 + Math.abs(noise()) * 0.05;
  }
  save("typing.wav", o, 0.6);
}
{
  const o = buf(0.3);
  addNoise(o, 0, 0.25, 1, 14, 0.05, 0.6);
  save("swipe.wav", o, 0.6);
}
{
  const o = buf(0.9);
  addSine(o, 0, 0.8, 140, 38, 1, 5);
  addNoise(o, 0, 0.3, 0.6, 18, 0.3, 0.05);
  save("impact.wav", o);
}
{
  const o = buf(1.3);
  addSine(o, 0, 1.2, 988, 988, 0.6, 5);
  addSine(o, 0.09, 1.2, 1318, 1318, 0.7, 4);
  addSine(o, 0.09, 1.2, 2636, 2636, 0.15, 7);
  save("ding.wav", o);
}
{
  const o = buf(0.3);
  addNoise(o, 0, 0.04, 1, 90, 0.8, 0.8, true);
  addNoise(o, 0.09, 0.06, 1, 60, 0.5, 0.5, true);
  save("shutter.wav", o, 0.7);
}
{
  const o = buf(0.2);
  addSine(o, 0, 0.18, 620, 1240, 0.8, 20);
  save("send.wav", o, 0.6);
}
