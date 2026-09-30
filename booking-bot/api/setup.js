// Одноразовая настройка: открываешь в браузере
//   https://ТВОЙ-ПРОЕКТ.vercel.app/api/setup?secret=ТВОЙ_TELEGRAM_WEBHOOK_SECRET
// и бот подключается к Telegram (webhook + меню команд для клиентов и для владельца).
import cfg from '../config.js';

export default async function handler(req, res) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || req.query?.secret !== secret) return res.status(401).send('forbidden');

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN is not set' });

  const api = (method, body) =>
    fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json());

  const url = `https://${req.headers.host}/api/webhook`;

  const webhook = await api('setWebhook', {
    url,
    secret_token: secret,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  });

  const clientCommands = [
    { command: 'book', description: 'Записаться' },
    { command: 'my', description: 'Мои записи' },
    { command: 'info', description: 'Адрес и контакты' },
  ];
  const commands = await api('setMyCommands', { commands: clientCommands });

  const admins = String(process.env.ADMIN_IDS || '')
    .split(/[\s,]+/)
    .filter(Boolean);
  const adminCommands = await Promise.all(
    admins.map((id) =>
      api('setMyCommands', {
        scope: { type: 'chat', chat_id: Number(id) },
        commands: [
          { command: 'today', description: 'Записи на сегодня' },
          { command: 'tomorrow', description: 'Записи на завтра' },
          { command: 'week', description: 'Сводка на 7 дней' },
          { command: 'off', description: 'Закрыть день: /off 05.10' },
          { command: 'on', description: 'Открыть день: /on 05.10' },
          { command: 'broadcast', description: 'Рассылка всем клиентам' },
          { command: 'stats', description: 'Клиентов в базе' },
          { command: 'admin', description: 'Все команды владельца' },
          ...clientCommands,
        ],
      }),
    ),
  );

  const description = await api('setMyShortDescription', { short_description: `Онлайн-запись в ${cfg.business.name}`.slice(0, 120) });

  const has = (k) => Boolean(process.env[k]);
  res.status(200).json({
    webhook_url: url,
    webhook,
    commands,
    adminCommands,
    description,
    env_ok: {
      TELEGRAM_BOT_TOKEN: has('TELEGRAM_BOT_TOKEN'),
      TELEGRAM_WEBHOOK_SECRET: has('TELEGRAM_WEBHOOK_SECRET'),
      ADMIN_IDS: has('ADMIN_IDS'),
      CRON_SECRET: has('CRON_SECRET'),
      REDIS_URL: has('UPSTASH_REDIS_REST_URL') || has('KV_REST_API_URL'),
      REDIS_TOKEN: has('UPSTASH_REDIS_REST_TOKEN') || has('KV_REST_API_TOKEN'),
    },
  });
}
