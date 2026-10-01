# PlateAI — промо-ролик

Вертикальное видео 1080×1920, 23 секунды, 30 fps. Сделано на [Remotion](https://remotion.dev).

Сцены (`src/scenes.tsx`): хук → логотип → чат с ботом → распознавание фото → итоги дня → неделя → финал с призывом.
Саундтрек синтезируется скриптом `scripts/make-audio.mjs` (120 BPM, склейки попадают в доли бита).

```bash
npm i
npm run studio        # живое превью и правки
npm run render        # → out/plateai-promo.mp4
npm run render:cloud  # то же в облачной сессии Claude Code (локальный Chromium)
```

Тайминги сцен — в `src/Promo.tsx`, цвета — в `src/ui.tsx`.
