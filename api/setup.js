// Одноразовая настройка: открываешь в браузере
//   https://ТВОЙ-ПРОЕКТ.vercel.app/api/setup?secret=ТВОЙ_TELEGRAM_WEBHOOK_SECRET
// и бот подключается к Telegram (webhook + меню команд).

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

  const commands = await api('setMyCommands', {
    commands: [
      { command: 'today', description: 'Итоги за сегодня' },
      { command: 'week', description: 'Последние 7 дней' },
      { command: 'undo', description: 'Удалить последнюю запись' },
      { command: 'water', description: 'Вода: /water 300 или без числа' },
      { command: 'watergoal', description: 'Норма воды, например /watergoal 2000' },
      { command: 'profile', description: 'Рассчитать мою норму калорий и БЖУ' },
      { command: 'goal', description: 'Дневная норма, например /goal 2200' },
      { command: 'tz', description: 'Часовой пояс, например /tz Asia/Shanghai' },
      { command: 'help', description: 'Как пользоваться' },
    ],
  });

  const has = (k) => Boolean(process.env[k]);
  res.status(200).json({
    webhook_url: url,
    webhook,
    commands,
    env_ok: {
      TELEGRAM_BOT_TOKEN: has('TELEGRAM_BOT_TOKEN'),
      TELEGRAM_WEBHOOK_SECRET: has('TELEGRAM_WEBHOOK_SECRET'),
      ANTHROPIC_API_KEY: has('ANTHROPIC_API_KEY'),
      REDIS_URL: has('UPSTASH_REDIS_REST_URL') || has('KV_REST_API_URL'),
      REDIS_TOKEN: has('UPSTASH_REDIS_REST_TOKEN') || has('KV_REST_API_TOKEN'),
      ALLOWED_USER_IDS: has('ALLOWED_USER_IDS'),
    },
  });
}
