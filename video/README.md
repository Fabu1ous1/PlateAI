# PlateAI — промо-ролик (Remotion)

Вертикальное видео 1080×1920, 30 fps, ~27 c: крючок → боль → логотип → демо чата с ботом (текст + фото) → фичи → призыв.

```bash
npm i
npm run dev                                      # редактор в браузере
npx remotion render PlateAIPromo out/plateai-promo.mp4   # рендер MP4
```

- Юзернейм бота на финальном экране — `botHandle` в `src/Root.tsx` (или в правой панели редактора).
- Тайминги сцен — `SCENES` в `src/PlateAIPromo.tsx`, реплики чата — `src/scenes/ChatDemo.tsx`.
- Музыку положи в `public/music.mp3` и добавь `<Audio src={staticFile("music.mp3")} />` в `PlateAIPromo`.
- Шрифт Inter (OFL) лежит в `public/fonts`, рендер работает без интернета.
