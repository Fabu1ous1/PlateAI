// Telegram-бот онлайн-записи для салонов, барбершопов, мастеров и студий.
// Vercel serverless-функция (Node), без внешних зависимостей.
import cfg from '../config.js';
import {
  tg,
  send,
  isAdmin,
  notifyAdmins,
  redis,
  K,
  parse,
  now,
  addDays,
  dateLabel,
  minutesUntil,
  parseDate,
  esc,
  price,
  compact,
  expand,
} from '../lib/core.js';
import {
  freeSlots,
  offDays,
  openDates,
  createBooking,
  getBooking,
  cancelBooking,
  dayBookings,
  userUpcoming,
} from '../lib/bookings.js';

const B = { book: '📅 Записаться', my: '🗂 Мои записи', info: '📍 Контакты' };
const MAIN_KB = {
  keyboard: [[{ text: B.book }], [{ text: B.my }, { text: B.info }]],
  resize_keyboard: true,
};

const btn = (text, data) => ({ text, callback_data: data });
const rows = (items, n) => Array.from({ length: Math.ceil(items.length / n) }, (_, i) => items.slice(i * n, i * n + n));

const getState = async (uid) => parse(await redis('GET', K.state(uid))) || {};
const setState = (uid, s) => redis('SET', K.state(uid), JSON.stringify(s), 'EX', 3600);
const clearState = (uid) => redis('DEL', K.state(uid));
const getProfile = async (uid) => parse(await redis('GET', K.profile(uid)));
const setProfile = (uid, p) => redis('SET', K.profile(uid), JSON.stringify(p));

const bookingLine = (b) =>
  `<b>${dateLabel(b.date)}, ${b.start}–${b.end}</b>\n${esc(b.service)} · ${price(b.price)}`;

const clientLink = (b) =>
  `<a href="tg://user?id=${b.uid}">${esc(b.name)}</a>${b.username ? ` (@${esc(b.username)})` : ''} · ${esc(b.phone)}`;

/* ============================== Экраны записи ============================== */

function servicesView() {
  return {
    text: `✂️ <b>Выберите услугу</b>`,
    reply_markup: {
      inline_keyboard: cfg.services.map((s, i) => [
        btn(`${s.name} · ${price(s.price)} · ${s.duration} мин`, `s:${i}`),
      ]),
    },
  };
}

async function datesView(si) {
  const svc = cfg.services[si];
  const dates = await openDates(svc);
  if (!dates.length) {
    return {
      text: `😔 На ближайшие ${cfg.daysAhead} дн. нет свободного времени для «${esc(svc.name)}».\nПозвоните нам: ${esc(cfg.business.phone)}`,
      reply_markup: { inline_keyboard: [[btn('← Услуги', 'svc')]] },
    };
  }
  const today = now().date;
  const label = (d) => (d === today ? 'Сегодня' : d === addDays(today, 1) ? 'Завтра' : dateLabel(d));
  return {
    text: `📅 <b>${esc(svc.name)}</b> — выберите день`,
    reply_markup: {
      inline_keyboard: [...rows(dates.map((d) => btn(label(d), `d:${si}:${compact(d)}`)), 3), [btn('← Услуги', 'svc')]],
    },
  };
}

async function timesView(si, date) {
  const svc = cfg.services[si];
  const slots = await freeSlots(svc, date, await offDays());
  if (!slots.length) return datesView(si);
  return {
    text: `🕐 <b>${esc(svc.name)}</b>, ${dateLabel(date)} — выберите время`,
    reply_markup: {
      inline_keyboard: [
        ...rows(slots.map((t) => btn(t, `t:${si}:${compact(date)}:${t.replace(':', '')}`)), 4),
        [btn('← Другой день', `s:${si}`)],
      ],
    },
  };
}

function confirmView(st, profile) {
  const svc = cfg.services[st.si];
  return {
    text:
      `📝 <b>Проверьте запись</b>\n\n` +
      `Услуга: ${esc(svc.name)}\n` +
      `Когда: <b>${dateLabel(st.date)}, ${st.start}</b>\n` +
      `Стоимость: ${price(svc.price)}\n` +
      `Имя: ${esc(profile.name)}\nТелефон: ${esc(profile.phone)}\n\n` +
      `📍 ${esc(cfg.business.address)}`,
    reply_markup: {
      inline_keyboard: [[btn('✅ Подтвердить', 'ok')], [btn('✏️ Другой телефон', 'rephone'), btn('✖️ Отмена', 'x')]],
    },
  };
}

const askContact = (chat) =>
  send(chat, '📱 Оставьте номер телефона — нажмите кнопку ниже или напишите номер сообщением.', {
    reply_markup: {
      keyboard: [[{ text: '📱 Отправить мой номер', request_contact: true }], [{ text: '✖️ Отмена' }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });

async function myBookingsView(uid) {
  const list = await userUpcoming(uid);
  if (!list.length) {
    return { text: 'У вас нет предстоящих записей.', reply_markup: { inline_keyboard: [[btn(B.book, 'svc')]] } };
  }
  return {
    text: `🗂 <b>Ваши записи</b>\n\n${list.map(bookingLine).join('\n\n')}`,
    reply_markup: { inline_keyboard: list.map((b) => [btn(`❌ Отменить ${dateLabel(b.date)} ${b.start}`, `c:${b.id}`)]) },
  };
}

const infoText = () =>
  `<b>${esc(cfg.business.name)}</b>\n${esc(cfg.business.about)}\n\n` +
  `📍 ${esc(cfg.business.address)}${cfg.business.mapUrl ? ` — <a href="${cfg.business.mapUrl}">карта</a>` : ''}\n` +
  `📞 ${esc(cfg.business.phone)}`;

/* ============================== Админка ============================== */

async function dayReport(date) {
  const list = await dayBookings(date);
  const off = (await offDays()).has(date);
  const head = `📋 <b>${dateLabel(date)}</b>${off ? ' — 🚫 закрыт для записи' : ''}`;
  if (!list.length) return { text: `${head}\nЗаписей нет.` };
  const sum = list.reduce((a, b) => a + (b.price || 0), 0);
  return {
    text:
      `${head} · ${list.length} зап. · ${price(sum)}\n\n` +
      list.map((b) => `<b>${b.start}–${b.end}</b> ${esc(b.service)}\n${clientLink(b)}`).join('\n\n'),
    reply_markup: { inline_keyboard: list.map((b) => [btn(`❌ ${b.start} ${b.name}`.slice(0, 60), `c:${b.id}`)]) },
  };
}

const ADMIN_HELP =
  `🔧 <b>Панель владельца</b>\n\n` +
  `/today — записи на сегодня\n` +
  `/tomorrow — на завтра\n` +
  `/week — сводка на 7 дней\n` +
  `/off 05.10 — закрыть день для записи\n` +
  `/on 05.10 — открыть день обратно\n` +
  `/broadcast текст — рассылка всем клиентам бота\n` +
  `/stats — сколько клиентов в базе`;

async function onAdminCommand(chat, cmd, arg) {
  const today = now().date;
  if (cmd === '/admin') return send(chat, ADMIN_HELP), true;
  if (cmd === '/today' || cmd === '/tomorrow') {
    const v = await dayReport(cmd === '/today' ? today : addDays(today, 1));
    return send(chat, v.text, v.reply_markup ? { reply_markup: v.reply_markup } : {}), true;
  }
  if (cmd === '/week') {
    const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i));
    const lists = await Promise.all(dates.map(dayBookings));
    const off = await offDays();
    const lines = dates.map((d, i) => {
      const sum = lists[i].reduce((a, b) => a + (b.price || 0), 0);
      return `${dateLabel(d)}: ${off.has(d) ? '🚫 закрыт' : `${lists[i].length} зап. · ${price(sum)}`}`;
    });
    return send(chat, `📊 <b>Неделя</b>\n\n${lines.join('\n')}`), true;
  }
  if (cmd === '/off' || cmd === '/on') {
    const date = parseDate(arg);
    if (!date) return send(chat, `Формат: ${cmd} 05.10`), true;
    await redis(cmd === '/off' ? 'SADD' : 'SREM', K.off(), date);
    const n = cmd === '/off' ? (await dayBookings(date)).length : 0;
    return (
      send(
        chat,
        cmd === '/off'
          ? `🚫 ${dateLabel(date)} закрыт для новых записей.${n ? `\n⚠️ На этот день уже есть ${n} зап. — посмотрите /today или отмените вручную.` : ''}`
          : `✅ ${dateLabel(date)} снова открыт для записи.`,
      ),
      true
    );
  }
  if (cmd === '/stats') {
    return send(chat, `👥 Клиентов в базе бота: <b>${await redis('SCARD', K.users())}</b>`), true;
  }
  if (cmd === '/broadcast') {
    if (!arg) return send(chat, 'Формат: /broadcast Скидка 20% на бороду до пятницы!'), true;
    const ids = (await redis('SMEMBERS', K.users())) || [];
    let ok = 0;
    for (const id of ids) {
      const r = await tg('sendMessage', { chat_id: id, text: arg });
      if (r.ok) ok++;
      await new Promise((res) => setTimeout(res, 40)); // лимит Telegram ~30 сообщений/сек
    }
    return send(chat, `📣 Разослано: ${ok} из ${ids.length}`), true;
  }
  return false;
}

/* ============================== Сообщения ============================== */

async function onMessage(m) {
  const uid = m.from?.id;
  const chat = m.chat?.id;
  if (!uid || !chat || m.chat.type !== 'private') return;
  await redis('SADD', K.users(), uid);

  const text = (m.text || '').trim();
  const [rawCmd] = text.split(/\s+/);
  const cmd = rawCmd?.startsWith('/') ? rawCmd.split('@')[0].toLowerCase() : '';
  const arg = text.slice(rawCmd?.length || 0).trim();

  try {
    if (cmd && isAdmin(uid) && (await onAdminCommand(chat, cmd, arg))) return;

    if (cmd === '/start') {
      await clearState(uid);
      await send(chat, `👋 Здравствуйте! Это бот записи в <b>${esc(cfg.business.name)}</b>.\n${esc(cfg.business.about)}`, {
        reply_markup: MAIN_KB,
      });
      const v = servicesView();
      return await send(chat, v.text, { reply_markup: v.reply_markup });
    }
    if (cmd === '/book' || text === B.book) {
      await clearState(uid);
      const v = servicesView();
      return await send(chat, v.text, { reply_markup: v.reply_markup });
    }
    if (cmd === '/my' || text === B.my) {
      const v = await myBookingsView(uid);
      return await send(chat, v.text, { reply_markup: v.reply_markup });
    }
    if (cmd === '/info' || text === B.info) return await send(chat, infoText(), { reply_markup: MAIN_KB });
    if (cmd === '/help') {
      return await send(chat, `Нажмите «${B.book}», выберите услугу, день и время — готово. Напомним накануне.`, {
        reply_markup: MAIN_KB,
      });
    }
    if (text === '✖️ Отмена') {
      await clearState(uid);
      return await send(chat, 'Отменено.', { reply_markup: MAIN_KB });
    }

    // Ждём телефон после выбора времени
    const st = await getState(uid);
    if (st.step === 'contact') {
      const phone = m.contact?.phone_number || (/^[+\d][\d\s()-]{5,}$/.test(text) ? text : null);
      if (!phone) return await askContact(chat);
      const profile = { name: m.contact?.first_name || m.from.first_name || 'Клиент', phone };
      await setProfile(uid, profile);
      await setState(uid, { ...st, step: 'confirm' });
      await send(chat, '👍 Номер сохранён.', { reply_markup: MAIN_KB });
      const v = confirmView(st, profile);
      return await send(chat, v.text, { reply_markup: v.reply_markup });
    }

    await send(chat, 'Выберите действие в меню ниже 👇', { reply_markup: MAIN_KB });
  } catch (e) {
    console.error('onMessage error', e);
    await send(chat, `⚠️ Что-то пошло не так. Попробуйте ещё раз или позвоните: ${esc(cfg.business.phone)}`);
  }
}

/* ============================== Кнопки ============================== */

async function onCallback(q) {
  const uid = q.from?.id;
  const chat = q.message?.chat?.id;
  const mid = q.message?.message_id;
  if (!uid || !chat) return tg('answerCallbackQuery', { callback_query_id: q.id });
  const answer = (text) => tg('answerCallbackQuery', { callback_query_id: q.id, ...(text ? { text } : {}) });
  const edit = (v) =>
    tg('editMessageText', {
      chat_id: chat,
      message_id: mid,
      text: v.text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...(v.reply_markup ? { reply_markup: v.reply_markup } : {}),
    });

  const [a, x, y, z] = String(q.data || '').split(':');

  try {
    if (a === 'svc') return await Promise.all([answer(), edit(servicesView())]);

    if (a === 's' && cfg.services[x]) return await Promise.all([answer(), edit(await datesView(Number(x)))]);

    if (a === 'd' && cfg.services[x]) return await Promise.all([answer(), edit(await timesView(Number(x), expand(y)))]);

    if (a === 't' && cfg.services[x]) {
      const st = { si: Number(x), date: expand(y), start: `${z.slice(0, 2)}:${z.slice(2)}` };
      const profile = await getProfile(uid);
      await answer();
      if (!profile) {
        await setState(uid, { ...st, step: 'contact' });
        await edit({ text: `🕐 ${esc(cfg.services[st.si].name)}, <b>${dateLabel(st.date)}, ${st.start}</b>` });
        return await askContact(chat);
      }
      await setState(uid, { ...st, step: 'confirm' });
      return await edit(confirmView(st, profile));
    }

    if (a === 'rephone') {
      const st = await getState(uid);
      await answer();
      if (st.si === undefined) return await edit(servicesView());
      await setState(uid, { ...st, step: 'contact' });
      return await askContact(chat);
    }

    if (a === 'x') {
      await clearState(uid);
      return await Promise.all([answer('Запись отменена'), edit({ text: 'Запись не создана. Нажмите «📅 Записаться», чтобы начать заново.' })]);
    }

    if (a === 'ok') {
      const st = await getState(uid);
      const profile = await getProfile(uid);
      const svc = cfg.services[st.si];
      if (!svc || !profile || st.step !== 'confirm') {
        await answer('Сессия устарела, начните заново');
        return await edit(servicesView());
      }
      const b = await createBooking({
        svc,
        date: st.date,
        start: st.start,
        uid,
        chat,
        name: profile.name,
        phone: profile.phone,
        username: q.from.username,
      });
      if (!b) {
        await answer('Это время только что заняли 😔');
        return await edit(await timesView(st.si, st.date));
      }
      await clearState(uid);
      await answer('Готово!');
      await edit({
        text: `✅ <b>Вы записаны!</b>\n\n${bookingLine(b)}\n\n📍 ${esc(cfg.business.address)}\nНапомним накануне. Отменить можно в «${B.my}».`,
      });
      return await notifyAdmins(`🆕 <b>Новая запись</b>\n\n${bookingLine(b)}\n${clientLink(b)}`, {
        reply_markup: { inline_keyboard: [[btn('❌ Отменить запись', `c:${b.id}`)]] },
      });
    }

    // Отмена: c:<id> — спросить, cy:<id> — отменить
    if (a === 'c' || a === 'cy') {
      const b = await getBooking(x);
      const admin = isAdmin(uid);
      if (!b || (b.uid !== uid && !admin)) return await answer('Запись не найдена');
      if (b.status !== 'active') return await Promise.all([answer('Уже отменена'), edit({ text: `Запись отменена.\n\n${bookingLine(b)}` })]);
      const byClient = b.uid === uid && !admin;
      if (byClient && minutesUntil(b.date, b.start) < cfg.cancelLeadHours * 60) {
        return await answer(`Отмена менее чем за ${cfg.cancelLeadHours} ч — только по телефону ${cfg.business.phone}`);
      }
      if (a === 'c') {
        await answer();
        return await edit({
          text: `Отменить запись?\n\n${bookingLine(b)}${admin ? `\n${clientLink(b)}` : ''}`,
          reply_markup: { inline_keyboard: [[btn('Да, отменить', `cy:${b.id}`), btn('Нет', 'keep')]] },
        });
      }
      await cancelBooking(b, byClient ? 'client' : 'admin');
      await answer('Запись отменена');
      await edit({ text: `❌ Запись отменена.\n\n${bookingLine(b)}` });
      if (byClient) return await notifyAdmins(`❌ <b>Клиент отменил запись</b>\n\n${bookingLine(b)}\n${clientLink(b)}`);
      if (b.uid !== uid) {
        return await send(b.chat, `❌ К сожалению, ваша запись отменена:\n\n${bookingLine(b)}\n\nВыберите другое время или позвоните: ${esc(cfg.business.phone)}`, {
          reply_markup: { inline_keyboard: [[btn(B.book, 'svc')]] },
        });
      }
      return;
    }

    if (a === 'keep') return await Promise.all([answer('Оставили как есть'), edit({ text: 'Запись сохранена 👍' })]);

    return await answer();
  } catch (e) {
    console.error('onCallback error', e);
    await answer('Ошибка, попробуйте ещё раз');
  }
}

async function handleUpdate(u) {
  if (!u || typeof u.update_id !== 'number') return;
  // защита от повторной доставки одного и того же апдейта
  const fresh = await redis('SET', K.update(u.update_id), 1, 'NX', 'EX', 3600);
  if (!fresh) return;
  if (u.callback_query) return onCallback(u.callback_query);
  if (u.message) return onMessage(u.message);
}

/* ============================== Vercel handler ============================== */

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('Booking bot is running');

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || req.headers['x-telegram-bot-api-secret-token'] !== secret) {
    return res.status(401).send('forbidden');
  }

  try {
    await handleUpdate(req.body);
  } catch (e) {
    console.error('handleUpdate error', e);
  }
  // всегда 200, чтобы Telegram не слал апдейт повторно
  return res.status(200).send('ok');
}
