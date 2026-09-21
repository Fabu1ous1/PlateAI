// Telegram-бот для подсчёта калорий.
// Vercel serverless-функция (Node), без внешних зависимостей.

/* ============================== Telegram ============================== */

const TOKEN = () => process.env.TELEGRAM_BOT_TOKEN;
const TG_API = () => `https://api.telegram.org/bot${TOKEN()}`;

async function tg(method, payload) {
  const r = await fetch(`${TG_API()}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!data.ok) console.error('Telegram error', method, JSON.stringify(data));
  return data;
}

const send = (chat_id, text, extra = {}) =>
  tg('sendMessage', { chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra });

async function photoToBase64(file_id) {
  const info = await tg('getFile', { file_id });
  const path = info?.result?.file_path;
  if (!path) throw new Error('getFile failed');
  const r = await fetch(`https://api.telegram.org/file/bot${TOKEN()}/${path}`);
  if (!r.ok) throw new Error('photo download failed');
  return Buffer.from(await r.arrayBuffer()).toString('base64');
}

/* ============================== Redis (Upstash REST) ============================== */

async function redis(...args) {
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

const TTL = 60 * 60 * 24 * 120; // храним дневники 120 дней
const dayKey = (uid, date) => `u:${uid}:d:${date}`;
const parse = (s) => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

async function getDay(uid, date) {
  const rows = await redis('LRANGE', dayKey(uid, date), 0, -1);
  return (rows || []).map(parse).filter(Boolean);
}

async function addMeal(uid, date, entry) {
  await redis('RPUSH', dayKey(uid, date), JSON.stringify(entry));
  await redis('EXPIRE', dayKey(uid, date), TTL);
}

// Удаляет последнюю запись дня. Если передан onlyId — только если она совпадает с этим id.
async function undoLast(uid, date, onlyId) {
  const key = dayKey(uid, date);
  if (onlyId !== undefined) {
    const last = parse(await redis('LINDEX', key, -1));
    if (!last || String(last.id) !== String(onlyId)) return null;
  }
  return parse(await redis('RPOP', key));
}

async function getGoal(uid) {
  return Number(await redis('GET', `u:${uid}:goal`)) || 2000;
}
async function getTz(uid) {
  return (await redis('GET', `u:${uid}:tz`)) || process.env.DEFAULT_TZ || 'Asia/Shanghai';
}

/* ============================== Время ============================== */

function isValidTz(tz) {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
const dateKey = (tz, back = 0) =>
  new Date(Date.now() - back * 864e5).toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD
const timeNow = (tz) =>
  new Date().toLocaleTimeString('ru-RU', { timeZone: tz, hour: '2-digit', minute: '2-digit' });

/* ============================== Claude ============================== */

const MODEL = () => process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';

const SYSTEM = `Ты — точный калькулятор калорий и БЖУ в Telegram-боте.
Пользователь пишет (или присылает фото), что он съел. Разбери еду на позиции, оцени порции, калории, белки, жиры, углеводы.
Правила:
- Отвечай на языке пользователя. Названия позиций короткие («Гречка варёная», «Яйцо варёное»).
- Если вес указан — используй его. Если не указан — возьми типичную порцию и покажи её в поле amount (например «~150 г»).
- Если не сказано «сухой», «сырой» или «до варки», считай крупы и пасту в готовом виде.
- Учитывай масло, соусы и способ приготовления, если они названы; если нет — предполагай обычное домашнее приготовление.
- Для фото оцени размер порции по виду; при сильной неуверенности напиши это в note.
- Для каждой позиции выбери один подходящий эмодзи в поле emoji (например 🍳, 🍚, 🍔, 🥗, 🍎).
- Все значения — целые числа. kcal должно примерно сходиться с 4*белки + 4*углеводы + 9*жиры.
- Если сообщение не про еду или напитки, поставь is_food=false и коротко ответь в reply.
Всегда вызывай инструмент log_meal.`;

const TOOL = {
  name: 'log_meal',
  description: 'Записать приём пищи с оценкой калорий и БЖУ',
  input_schema: {
    type: 'object',
    properties: {
      is_food: { type: 'boolean', description: 'true, если пользователь описал еду или напитки' },
      reply: { type: 'string', description: 'Если is_food=false — короткий ответ пользователю' },
      note: { type: 'string', description: 'Короткая пометка о допущениях, если они были' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            emoji: { type: 'string', description: 'Один эмодзи, подходящий к этой еде' },
            amount: { type: 'string', description: 'Порция, например «200 г» или «2 шт (~110 г)»' },
            kcal: { type: 'number' },
            protein: { type: 'number', description: 'граммы' },
            fat: { type: 'number', description: 'граммы' },
            carbs: { type: 'number', description: 'граммы' },
          },
          required: ['name', 'amount', 'kcal', 'protein', 'fat', 'carbs'],
        },
      },
    },
    required: ['is_food', 'items'],
  },
};

// Общая очистка ответа модели (одинаковая для Claude и Gemini)
function normalize(out) {
  out = out || {};
  const num = (x, max) => Math.round(Math.min(Math.max(Number(x) || 0, 0), max));
  const items = (Array.isArray(out.items) ? out.items : []).slice(0, 30).map((i) => ({
    name: String(i.name || '?').slice(0, 60),
    emoji: /\p{Extended_Pictographic}/u.test(String(i.emoji || '')) ? String(i.emoji).trim().slice(0, 8) : '🍽',
    amount: String(i.amount || '').slice(0, 40),
    kcal: num(i.kcal, 5000),
    protein: num(i.protein, 500),
    fat: num(i.fat, 500),
    carbs: num(i.carbs, 800),
  }));
  return {
    isFood: out.is_food !== false && items.length > 0,
    reply: String(out.reply || ''),
    note: String(out.note || ''),
    items,
  };
}

/* ---------- Claude (если задан ANTHROPIC_API_KEY) ---------- */

async function analyzeClaude({ text, imageB64 }) {
  const content = [];
  if (imageB64) {
    content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageB64 } });
  }
  content.push({ type: 'text', text: text || 'Оцени калории и БЖУ того, что на фото.' });

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL(),
      max_tokens: 1500,
      system: SYSTEM,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'log_meal' },
      messages: [{ role: 'user', content }],
    }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`);

  const data = await r.json();
  const block = data.content?.find((b) => b.type === 'tool_use');
  if (!block) throw new Error('No tool_use block in response');
  return normalize(block.input);
}

/* ---------- Gemini (бесплатно, если задан GEMINI_API_KEY) ---------- */

// Порядок важен: если первая модель недоступна (снята с поддержки, лимит), пробуем следующую.
// Можно переопределить переменной GEMINI_MODELS (через запятую).
const GEMINI_MODELS = () =>
  (process.env.GEMINI_MODELS || 'gemini-3.7-flash,gemini-3-flash-preview,gemini-2.5-flash-lite')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const SYSTEM_GEMINI = SYSTEM.replace(
  'Всегда вызывай инструмент log_meal.',
  'Ответь строго JSON-объектом по заданной схеме, без пояснений и без markdown.',
);

const GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    is_food: { type: 'BOOLEAN', description: 'true, если пользователь описал еду или напитки' },
    reply: { type: 'STRING', description: 'Если is_food=false — короткий ответ пользователю, иначе пустая строка' },
    note: { type: 'STRING', description: 'Короткая пометка о допущениях, если они были, иначе пустая строка' },
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          emoji: { type: 'STRING', description: 'Один эмодзи, подходящий к этой еде' },
          amount: { type: 'STRING', description: 'Порция, например «200 г» или «2 шт (~110 г)»' },
          kcal: { type: 'NUMBER' },
          protein: { type: 'NUMBER', description: 'граммы' },
          fat: { type: 'NUMBER', description: 'граммы' },
          carbs: { type: 'NUMBER', description: 'граммы' },
        },
        required: ['name', 'emoji', 'amount', 'kcal', 'protein', 'fat', 'carbs'],
      },
    },
  },
  required: ['is_food', 'items'],
};

function geminiJson(data) {
  const cand = data.candidates?.[0];
  if (!cand) throw new Error(`Gemini: no candidates ${JSON.stringify(data.promptFeedback || {})}`);
  const txt = (cand.content?.parts || [])
    .filter((p) => typeof p.text === 'string' && !p.thought)
    .map((p) => p.text)
    .join('')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();
  return JSON.parse(txt);
}

async function analyzeGemini({ text, imageB64 }) {
  const parts = [];
  if (imageB64) parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageB64 } });
  parts.push({ text: text || 'Оцени калории и БЖУ того, что на фото.' });

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM_GEMINI }] },
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: GEMINI_SCHEMA,
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  });

  let lastErr = new Error('Gemini: no models configured');
  for (const model of GEMINI_MODELS()) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body,
    });
    if (r.ok) return normalize(geminiJson(await r.json()));

    lastErr = new Error(`Gemini ${model} ${r.status}: ${(await r.text()).slice(0, 300)}`);
    console.error(lastErr.message);
    if (r.status === 401 || r.status === 403) break; // проблема с ключом — другая модель не поможет
  }
  throw lastErr;
}

// Какой ИИ использовать: Gemini, если есть GEMINI_API_KEY, иначе Claude
async function analyze(args) {
  return process.env.GEMINI_API_KEY ? analyzeGemini(args) : analyzeClaude(args);
}

/* ============================== Форматирование ============================== */

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clip = (s, n) => {
  const chars = Array.from(String(s));
  return chars.length > n ? chars.slice(0, n - 1).join('') + '…' : chars.join('');
};
const LINE = '━━━━━━━━━━';

// Кнопки внизу экрана → команды
const BUTTON_TEXT = {
  '📊 Сегодня': '/today',
  '📅 Неделя': '/week',
  '↩️ Отменить': '/undo',
  'ℹ️ Помощь': '/help',
};
const MAIN_KEYBOARD = {
  keyboard: [[{ text: '📊 Сегодня' }, { text: '📅 Неделя' }], [{ text: '↩️ Отменить' }, { text: 'ℹ️ Помощь' }]],
  resize_keyboard: true,
  is_persistent: true,
  input_field_placeholder: 'Что съел? Например: 2 яйца и 150 г гречки',
};

const helpText = (name) => `👋 <b>${name ? `Привет, ${esc(name)}!` : 'Привет!'}</b> Я <b>PlateAI</b> — считаю калории и БЖУ.

<b>Как пользоваться</b>
Просто напиши, что съел:
• <i>2 яйца и 150 г гречки</i>
• <i>бургер и кола 0.5</i>
или пришли 📸 <b>фото тарелки</b>.

<b>Команды</b>
/today — итоги за сегодня
/week — последние 7 дней
/undo — удалить последнюю запись
/goal 2200 — дневная норма ккал
/tz Asia/Shanghai — часовой пояс
/id — твой Telegram ID`;

const totalOf = (items) =>
  items.reduce(
    (a, i) => ({ kcal: a.kcal + i.kcal, p: a.p + i.protein, f: a.f + i.fat, c: a.c + i.carbs }),
    { kcal: 0, p: 0, f: 0, c: 0 },
  );

const daySum = (entries) =>
  entries.reduce(
    (a, e) => ({ kcal: a.kcal + e.kcal, p: a.p + e.p, f: a.f + e.f, c: a.c + e.c }),
    { kcal: 0, p: 0, f: 0, c: 0 },
  );

// Полоска прогресса: 🟩 в норме, 🟨 почти норма, 🟥 перебор
const bar = (value, goal, n = 10) => {
  const pct = goal > 0 ? value / goal : 0;
  const filled = Math.max(0, Math.min(n, Math.round(pct * n)));
  const on = pct > 1 ? '🟥' : pct > 0.9 ? '🟨' : '🟩';
  return on.repeat(filled) + '⬜'.repeat(n - filled);
};

function progress(entries, goal) {
  const t = daySum(entries);
  const left = goal - t.kcal;
  const pct = goal > 0 ? Math.round((t.kcal / goal) * 100) : 0;
  return (
    `📊 <b>Сегодня: ${t.kcal} / ${goal} ккал</b> · ${pct}%\n${bar(t.kcal, goal)}\n` +
    (left >= 0 ? `Осталось: <b>${left} ккал</b>` : `Перебор: <b>+${-left} ккал</b>`) +
    `\n🥩 Б ${t.p} · 🧈 Ж ${t.f} · 🍞 У ${t.c}`
  );
}

function mealText(entry, note) {
  const lines = entry.items.map(
    (i) => `${i.emoji || '🍽'} ${esc(i.name)}${i.amount ? `, ${esc(i.amount)}` : ''} — <b>${i.kcal} ккал</b>`,
  );
  return (
    `✅ <b>Записал</b>\n\n${lines.join('\n')}\n\n` +
    `<b>Итого: ${entry.kcal} ккал</b>\n🥩 Б ${entry.p} · 🧈 Ж ${entry.f} · 🍞 У ${entry.c}` +
    (note ? `\n\n💡 <i>${esc(note)}</i>` : '')
  );
}

function todayText(entries, goal) {
  if (!entries.length) {
    return `🍽 <b>Сегодня пока пусто</b>\nНапиши, что съел, или пришли фото 📸\n🎯 Норма: ${goal} ккал`;
  }
  const lines = entries.map((e) => {
    const names = e.items.map((i) => `${i.emoji || '🍽'} ${i.name}`).join(', ');
    return `<code>${esc(e.at)}</code> ${esc(clip(names, 80))} — <b>${e.kcal}</b>`;
  });
  return `🗒 <b>Сегодня</b>\n${lines.join('\n')}\n\n${LINE}\n${progress(entries, goal)}`;
}

async function weekText(uid, tz, goal) {
  const days = await Promise.all(
    [6, 5, 4, 3, 2, 1, 0].map(async (back) => {
      const d = dateKey(tz, back);
      return { d, e: await getDay(uid, d) };
    }),
  );
  const lines = days.map(({ d, e }) => {
    const kcal = daySum(e).kcal;
    const wd = new Date(`${d}T12:00:00Z`).toLocaleDateString('ru-RU', { weekday: 'short', timeZone: 'UTC' });
    return `<code>${wd} ${d.slice(8)}.${d.slice(5, 7)}</code> ${bar(kcal, goal, 8)} <b>${kcal}</b>`;
  });
  const filled = days.filter((x) => x.e.length);
  const avg = filled.length
    ? Math.round(filled.reduce((s, x) => s + daySum(x.e).kcal, 0) / filled.length)
    : 0;
  return `📅 <b>Последние 7 дней</b> (норма ${goal})\n\n${lines.join('\n')}\n\n📈 В среднем: <b>${avg} ккал/день</b>`;
}

/* ============================== Логика бота ============================== */

const DAILY_LIMIT = Number(process.env.DAILY_MESSAGE_LIMIT || 60);

function allowed(uid) {
  const list = (process.env.ALLOWED_USER_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length === 0 || list.includes(String(uid));
}

async function logMeal(m, uid, chat, text) {
  const hasPhoto = Array.isArray(m.photo) && m.photo.length > 0;
  if (!text && !hasPhoto) return send(chat, 'Напиши, что ты съел, или пришли фото 🍽');

  const tz = await getTz(uid);
  const date = dateKey(tz);

  // защита баланса API: лимит сообщений в сутки на пользователя
  const cntKey = `u:${uid}:cnt:${date}`;
  const n = Number(await redis('INCR', cntKey));
  if (n === 1) await redis('EXPIRE', cntKey, 172800);
  if (n > DAILY_LIMIT) return send(chat, `Дневной лимит (${DAILY_LIMIT} сообщений) исчерпан. Завтра продолжим 🙂`);

  await tg('sendChatAction', { chat_id: chat, action: 'typing' });
  const imageB64 = hasPhoto ? await photoToBase64(m.photo[m.photo.length - 1].file_id) : null;
  const ai = await analyze({ text, imageB64 });

  if (!ai.isFood) {
    return send(chat, esc(ai.reply || 'Не понял, что ты съел. Например: «2 яйца и 150 г гречки».'));
  }

  const t = totalOf(ai.items);
  const entry = { id: m.message_id, at: timeNow(tz), items: ai.items, kcal: t.kcal, p: t.p, f: t.f, c: t.c };
  await addMeal(uid, date, entry);

  const [entries, goal] = await Promise.all([getDay(uid, date), getGoal(uid)]);
  return send(chat, `${mealText(entry, ai.note)}\n\n${LINE}\n${progress(entries, goal)}`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '↩️ Отменить', callback_data: `undo:${entry.id}:${date}` },
          { text: '📊 Итоги дня', callback_data: 'today' },
        ],
      ],
    },
  });
}

async function onMessage(m) {
  if (m.chat?.type !== 'private') return; // работаем только в личке
  const chat = m.chat.id;
  const uid = m.from?.id;
  let raw = (m.text || m.caption || '').trim();
  if (BUTTON_TEXT[raw]) raw = BUTTON_TEXT[raw]; // нажатие на кнопку внизу
  const [head, ...rest] = raw.split(/\s+/);
  const cmd = raw.startsWith('/') ? head.split('@')[0].toLowerCase() : null;
  const arg = rest.join(' ').trim();

  if (cmd === '/id') return send(chat, `Твой Telegram ID: <code>${uid}</code>`);
  if (!allowed(uid)) return send(chat, `🔒 Бот приватный. Твой ID: <code>${uid}</code>`);

  try {
    switch (cmd) {
      case '/start':
      case '/help':
        return await send(chat, helpText(m.from?.first_name), { reply_markup: MAIN_KEYBOARD });

      case '/today': {
        const tz = await getTz(uid);
        const [entries, goal] = await Promise.all([getDay(uid, dateKey(tz)), getGoal(uid)]);
        return await send(chat, todayText(entries, goal));
      }

      case '/week': {
        const [tz, goal] = await Promise.all([getTz(uid), getGoal(uid)]);
        return await send(chat, await weekText(uid, tz, goal));
      }

      case '/undo': {
        const tz = await getTz(uid);
        const date = dateKey(tz);
        const removed = await undoLast(uid, date);
        if (!removed) return await send(chat, 'Сегодня нечего отменять 🤷');
        const [entries, goal] = await Promise.all([getDay(uid, date), getGoal(uid)]);
        const names = removed.items.map((i) => i.name).join(', ');
        return await send(
          chat,
          `↩️ <b>Удалил:</b> ${esc(clip(names, 80))} (−${removed.kcal} ккал)\n\n${LINE}\n${progress(entries, goal)}`,
        );
      }

      case '/goal': {
        const goal = parseInt(arg, 10);
        if (!(goal >= 800 && goal <= 10000)) return await send(chat, 'Формат: /goal 2200');
        await redis('SET', `u:${uid}:goal`, goal);
        return await send(chat, `🎯 Норма: <b>${goal} ккал</b> в день`);
      }

      case '/tz': {
        if (!arg || !isValidTz(arg)) {
          return await send(chat, 'Формат: /tz Asia/Shanghai (или Europe/Moscow, Asia/Tashkent)');
        }
        await redis('SET', `u:${uid}:tz`, arg);
        return await send(chat, `🕒 Часовой пояс: <b>${esc(arg)}</b>`);
      }

      default:
        if (cmd) return await send(chat, 'Не знаю такую команду. Список: /help');
        return await logMeal(m, uid, chat, raw);
    }
  } catch (e) {
    console.error('onMessage error', e);
    await send(chat, '⚠️ Что-то пошло не так. Попробуй ещё раз через минуту.');
  }
}

async function onCallback(q) {
  const uid = q.from?.id;
  const chat = q.message?.chat?.id;
  if (!allowed(uid) || !chat) return tg('answerCallbackQuery', { callback_query_id: q.id });

  const [action, id, date] = String(q.data || '').split(':');

  try {
    if (action === 'today') {
      await tg('answerCallbackQuery', { callback_query_id: q.id });
      const tz = await getTz(uid);
      const [entries, goal] = await Promise.all([getDay(uid, dateKey(tz)), getGoal(uid)]);
      return await send(chat, todayText(entries, goal));
    }

    if (action !== 'undo' || !id || !date) return await tg('answerCallbackQuery', { callback_query_id: q.id });

    const removed = await undoLast(uid, date, id);
    if (!removed) {
      return await tg('answerCallbackQuery', {
        callback_query_id: q.id,
        text: 'Уже отменено или есть более новая запись',
      });
    }
    const [entries, goal] = await Promise.all([getDay(uid, date), getGoal(uid)]);
    await tg('answerCallbackQuery', { callback_query_id: q.id, text: 'Отменено ↩️' });
    const names = removed.items.map((i) => i.name).join(', ');
    await tg('editMessageText', {
      chat_id: chat,
      message_id: q.message.message_id,
      parse_mode: 'HTML',
      text: `↩️ <b>Отменено:</b> ${esc(clip(names, 80))} (−${removed.kcal} ккал)\n\n${LINE}\n${progress(entries, goal)}`,
    });
  } catch (e) {
    console.error('onCallback error', e);
    await tg('answerCallbackQuery', { callback_query_id: q.id, text: 'Ошибка, попробуй /undo' });
  }
}

async function handleUpdate(u) {
  if (!u || typeof u.update_id !== 'number') return;
  // защита от повторной доставки одного и того же апдейта
  const fresh = await redis('SET', `upd:${u.update_id}`, 1, 'NX', 'EX', 3600);
  if (!fresh) return;
  if (u.callback_query) return onCallback(u.callback_query);
  if (u.message) return onMessage(u.message);
}

/* ============================== Vercel handler ============================== */

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('Calorie bot is running');

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
