// Слоты и записи. Занятость хранится в hash busy:<дата> (HH:MM -> id записи);
// бронь ставится через HSETNX по каждой ячейке, поэтому двойная запись невозможна.
import cfg from '../config.js';
import { redis, K, parse, pairsToObj, now, addDays, toMin, fmtMin, hoursFor } from './core.js';

const TTL = 60 * 60 * 24 * (cfg.daysAhead + 90);
const span = (duration) => Math.ceil(duration / cfg.slotStep) * cfg.slotStep;

export const offDays = async () => new Set((await redis('SMEMBERS', K.off())) || []);

export async function freeSlots(svc, date, off) {
  const hours = hoursFor(date);
  if (!hours || off.has(date)) return [];
  const busy = pairsToObj(await redis('HGETALL', K.busy(date)));
  const [open, close] = hours.map(toMin);
  const len = span(svc.duration);
  const n = now();
  const out = [];
  for (let s = open; s + len <= close; s += cfg.slotStep) {
    if (date === n.date && s < n.min + cfg.minLeadMinutes) continue;
    let ok = true;
    for (let t = s; t < s + len; t += cfg.slotStep) {
      if (busy[fmtMin(t)]) {
        ok = false;
        break;
      }
    }
    if (ok) out.push(fmtMin(s));
  }
  return out;
}

// Дни, в которые у услуги есть хотя бы один свободный слот.
export async function openDates(svc) {
  const off = await offDays();
  const today = now().date;
  const dates = Array.from({ length: cfg.daysAhead }, (_, i) => addDays(today, i));
  const slots = await Promise.all(dates.map((d) => freeSlots(svc, d, off)));
  return dates.filter((_, i) => slots[i].length);
}

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Возвращает запись или null, если время уже заняли.
export async function createBooking({ svc, date, start, uid, chat, name, phone, username }) {
  if (!(await freeSlots(svc, date, await offDays())).includes(start)) return null;

  const id = newId();
  const len = span(svc.duration);
  const taken = [];
  for (let t = toMin(start); t < toMin(start) + len; t += cfg.slotStep) {
    const ok = await redis('HSETNX', K.busy(date), fmtMin(t), id);
    if (!ok) {
      if (taken.length) await redis('HDEL', K.busy(date), ...taken);
      return null;
    }
    taken.push(fmtMin(t));
  }
  await redis('EXPIRE', K.busy(date), TTL);

  const b = {
    id,
    uid,
    chat,
    name,
    phone,
    username: username || '',
    service: svc.name,
    price: svc.price,
    duration: svc.duration,
    date,
    start,
    end: fmtMin(toMin(start) + svc.duration),
    status: 'active',
    reminded: false,
    createdAt: Date.now(),
  };
  await saveBooking(b);
  await redis('SADD', K.day(date), id);
  await redis('EXPIRE', K.day(date), TTL);
  await redis('SADD', K.userBookings(uid), id);
  return b;
}

export const getBooking = async (id) => parse(await redis('GET', K.booking(id)));
export const saveBooking = (b) => redis('SET', K.booking(b.id), JSON.stringify(b), 'EX', TTL);

export async function cancelBooking(b, by) {
  b.status = 'cancelled';
  b.cancelledBy = by;
  await saveBooking(b);
  await redis('SREM', K.day(b.date), b.id);
  const fields = [];
  for (let t = toMin(b.start); t < toMin(b.start) + span(b.duration); t += cfg.slotStep) fields.push(fmtMin(t));
  const owners = await redis('HMGET', K.busy(b.date), ...fields);
  const mine = fields.filter((_, i) => owners[i] === b.id);
  if (mine.length) await redis('HDEL', K.busy(b.date), ...mine);
  return b;
}

async function loadMany(ids) {
  if (!ids?.length) return [];
  const rows = await redis('MGET', ...ids.map(K.booking));
  return rows.map(parse).filter(Boolean);
}

const byTime = (a, b) => (a.date + a.start).localeCompare(b.date + b.start);

export async function dayBookings(date) {
  const list = await loadMany(await redis('SMEMBERS', K.day(date)));
  return list.filter((b) => b.status === 'active').sort(byTime);
}

export async function userUpcoming(uid) {
  const ids = (await redis('SMEMBERS', K.userBookings(uid))) || [];
  const list = await loadMany(ids);
  const alive = new Set(list.map((b) => b.id));
  const stale = ids.filter((id) => !alive.has(id));
  if (stale.length) await redis('SREM', K.userBookings(uid), ...stale);
  const n = now();
  return list
    .filter((b) => b.status === 'active' && (b.date > n.date || (b.date === n.date && toMin(b.start) >= n.min)))
    .sort(byTime);
}
