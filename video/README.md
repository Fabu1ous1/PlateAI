# PlateAI — промо-ролики (Remotion)

Вертикальные видео 1080×1920, 30 fps, со звуком.

| Композиция | Длина | Что внутри |
|---|---|---|
| `PlateAIPromo` | ~27 c | крючок → боль → логотип → демо чата (текст + фото) → фичи → призыв |
| `PlateAIPromoShort` | ~16 c | крючок → демо чата → призыв (для рекламы) |
| `PlateAICover` | кадр | обложка для Reels / Shorts |

```bash
npm i
npm run dev                                                   # редактор в браузере
npx remotion render PlateAIPromo out/PlateAIPromo.mp4
npx remotion render PlateAIPromoShort out/PlateAIPromoShort.mp4
npx remotion still PlateAICover out/plateai-cover.png
```

- Юзернейм бота на финальном экране — `botHandle` в `src/Root.tsx` (или в правой панели редактора). Там же `music: false` выключает музыку.
- Тайминги сцен — `FULL` / `SHORT` в `src/PlateAIPromo.tsx`, реплики чата — `src/scenes/ChatDemo.tsx`.
- Музыка и звуки синтезированы кодом (`scripts/make-audio.mjs` → `public/sfx`), без сторонних сэмплов. Свой трек: положи файл в `public/sfx/music.wav`.
- Шрифт Inter (OFL) лежит в `public/fonts`, рендер работает без интернета.
