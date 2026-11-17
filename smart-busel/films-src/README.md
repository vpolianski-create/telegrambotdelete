# Исходники мультуроков

Ролики делаются скиллом Papermorph (github.com/DozenTwelve/Papermorph, движок engine-v2.12, MIT).
Готовый ролик — в `public/films/<id темы>/`; анимация — в его `index.html` (массив `BEATS`).

Как ролики должны выглядеть и звучать — в `STYLE.md` (эталон — math-t12).

Здесь — то, из чего ролик собирается:
- `narration.ru.json` — текст озвучки по частям; метки `[[...]]` — моменты, к которым привязана анимация.
- `style.json` — договорённости по стилю (цвета Aurora Play, голос, без вопросов в ролике).

Озвучка: `scripts/tts.py` скилла (Edge, голос `ru-RU-SvetlanaNeural`, −4 %; у math-t12 — Дмитрий) → `audio/ru/*.mp3` и `timings.js`.
Если сервер Edge упорно молчит на целой части, её озвучивают по предложениям и склеивают (ffmpeg concat),
сдвигая метки и субтитры на длину кусков.
После правок: `npm test` (tests/films.test.ts сверяет части ролика с `src/content/films.ts`).
