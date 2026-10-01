# PlateAI — промо-ролики (Remotion)

Вертикальные видео 1080×1920, 30 fps. Светлый моушн-дизайн: кинетическая типографика, 3D-иконки еды, 3D-телефон с чатом бота.

| Композиция | Длина | Что внутри |
|---|---|---|
| `PlateAIPromo` | ~22 c | крючок → боль → бренд → фото тарелки → ответ бота и КБЖУ → 4 фичи → призыв |
| `PlateAIPromoShort` | ~13 c | крючок → демо чата → призыв (для рекламы) |
| `PlateAICover` | кадр | обложка для Reels / Shorts |

```bash
npm i
npm run dev                                                   # редактор в браузере
npx remotion render PlateAIPromo out/PlateAIPromo.mp4
npx remotion render PlateAIPromoShort out/PlateAIPromoShort.mp4
npx remotion still PlateAICover out/plateai-cover.png
```

- Юзернейм бота на финальном экране — `botHandle` в `src/Root.tsx` (или в правой панели редактора).
- Тайминги сцен — `FULL` / `SHORT` в `src/PlateAIPromo.tsx`, демо и цифры — `src/scenes/Demo.tsx`.
- Музыки в ролике нет — добавляй трендовый звук прямо в Reels/TikTok. Звуковые эффекты синтезированы кодом (`scripts/make-audio.mjs` → `public/sfx`).
- 3D-иконки — Microsoft Fluent Emoji 3D (MIT), `public/e3d`.
- Шрифты Unbounded и Inter (OFL) лежат в `public/fonts`, рендер работает без интернета.
