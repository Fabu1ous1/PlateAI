// Общие помощники: Telegram API, Redis (Upstash REST), время, форматирование.
import cfg from '../config.js';

/* ============================== Telegram ============================== */

const TOKEN = () => process.env.TELEGRAM_BOT_TOKEN;

export async function tg(method, payload) {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN()}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!data.ok) console.error('Telegram error', method, JSON.stringify(data));
  return data;
}

export const send = (chat_id, text, extra = {}) =>
  tg('sendMessage', { chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra });

export const adminIds = () =>
  String(process.env.ADMIN_IDS || '')
    .split(/[\s,]+/)
    .map(Number)
    .filter(Boolean);

export const isAdmin = (uid) => adminIds().includes(Number(uid));

export const notifyAdmins = (text, extra) => Promise.all(adminIds().map((id) => send(id, text, extra)));

/* ============================== Redis (Upstash REST) ============================== */

export async function redis(...args) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Redis env vars are missing');
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(args.map(String)),
  });
  const data = await r.json();
  if (data.error) throw new Error(`Redis: ${data.error}`);
  return data.result;
}

// Префикс позволяет держать нескольких клиентов в одной базе Redis.
const P = () => process.env.REDIS_PREFIX || 'bb';
export const K = {
  booking: (id) => `${P()}:bk:${id}`,
  busy: (date) => `${P()}:busy:${date}`, // hash HH:MM -> bookingId
  day: (date) => `${P()}:day:${date}`, // set bookingId
  userBookings: (uid) => `${P()}:ubk:${uid}`,
  profile: (uid) => `${P()}:prof:${uid}`,
  state: (uid) => `${P()}:st:${uid}`,
  off: () => `${P()}:off`, // set of YYYY-MM-DD
  users: () => `${P()}:users`,
  update: (id) => `${P()}:upd:${id}`,
};

export const parse = (s) => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

export const pairsToObj = (arr) => {
  const o = {};
  for (let i = 0; i < (arr || []).length; i += 2) o[arr[i]] = arr[i + 1];
  return o;
};

/* ============================== Время ============================== */

export function now() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: cfg.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, min: Number(p.hour) * 60 + Number(p.minute) };
}

const utc = (date) => {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
export const addDays = (date, n) => new Date(utc(date) + n * 86400000).toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((utc(b) - utc(a)) / 86400000);
export const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
export const fmtMin = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

const WD_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const WD_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const weekday = (date) => new Date(utc(date)).getUTCDay();
export const hoursFor = (date) => cfg.schedule[WD_KEYS[weekday(date)]] || null;
export const dateLabel = (date) => `${WD_RU[weekday(date)]} ${date.slice(8, 10)}.${date.slice(5, 7)}`;

// Минут от «сейчас» до начала записи (отрицательно — уже прошло).
export const minutesUntil = (date, start) => {
  const n = now();
  return daysBetween(n.date, date) * 1440 + toMin(start) - n.min;
};

// Принимает 2026-10-05, 05.10 или 05.10.2026.
export function parseDate(s) {
  s = String(s || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?$/);
  if (!m) return null;
  const today = now().date;
  let y = m[3] ? Number(m[3]) : Number(today.slice(0, 4));
  const iso = (yy) => `${yy}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  if (!m[3] && iso(y) < today) y += 1;
  return iso(y);
}

/* ============================== Форматирование ============================== */

export const esc = (s) =>
  String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

export const price = (p) => (p ? `${p.toLocaleString('ru-RU')} ${cfg.currency}` : 'по договорённости');

export const compact = (date) => date.replaceAll('-', '');
export const expand = (d8) => `${d8.slice(0, 4)}-${d8.slice(4, 6)}-${d8.slice(6, 8)}`;
