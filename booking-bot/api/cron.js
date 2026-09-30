// Ежедневный запуск (vercel.json → crons): напоминания клиентам о завтрашних записях
// и сводка на завтра владельцу.
import { tg, send, notifyAdmins, now, addDays, dateLabel, esc, price } from '../lib/core.js';
import { dayBookings, saveBooking } from '../lib/bookings.js';
import cfg from '../config.js';

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).send('forbidden');

  const date = addDays(now().date, 1);
  const list = await dayBookings(date);
  let sent = 0;

  for (const b of list) {
    if (b.reminded) continue;
    const r = await send(
      b.chat,
      `⏰ <b>Напоминание</b>\nЗавтра вы записаны в ${esc(cfg.business.name)}:\n\n` +
        `<b>${dateLabel(b.date)}, ${b.start}</b> — ${esc(b.service)}\n📍 ${esc(cfg.business.address)}\n\nЖдём вас! Если планы изменились — отмените запись, пожалуйста.`,
      { reply_markup: { inline_keyboard: [[{ text: '❌ Не смогу прийти', callback_data: `c:${b.id}` }]] } },
    );
    if (r.ok) {
      b.reminded = true;
      await saveBooking(b);
      sent++;
    }
  }

  if (list.length) {
    const sum = list.reduce((a, b) => a + (b.price || 0), 0);
    await notifyAdmins(
      `🌙 <b>Завтра, ${dateLabel(date)}</b> · ${list.length} зап. · ${price(sum)}\n\n` +
        list.map((b) => `${b.start} ${esc(b.service)} — ${esc(b.name)}, ${esc(b.phone)}`).join('\n'),
    );
  }

  res.status(200).json({ date, bookings: list.length, reminded: sent });
}
