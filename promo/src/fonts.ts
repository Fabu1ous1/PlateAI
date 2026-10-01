import {continueRender, delayRender, staticFile} from 'remotion';

// Шрифты лежат в public/fonts — рендер не зависит от сети
const LATIN = 'U+0000-00FF, U+2000-206F, U+20AC, U+2122, U+2212';
const CYRILLIC = 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116';

const FACES = [
  ['Unbounded', 'unbounded-lat', LATIN, '700 900'],
  ['Unbounded', 'unbounded-cyr', CYRILLIC, '700 900'],
  ['Manrope', 'manrope-lat', LATIN, '200 800'],
  ['Manrope', 'manrope-cyr', CYRILLIC, '200 800'],
] as const;

if (typeof document !== 'undefined') {
  const handle = delayRender('Загрузка шрифтов');
  Promise.all(
    FACES.map(([family, file, unicodeRange, weight]) =>
      new FontFace(family, `url(${staticFile(`fonts/${file}.woff2`)}) format('woff2')`, {unicodeRange, weight})
        .load()
        .then((face) => document.fonts.add(face)),
    ),
  ).then(() => continueRender(handle));
}

export const DISPLAY = 'Unbounded';
export const BODY = 'Manrope';
