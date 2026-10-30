import { T, S, TF, I, adv } from '../lib.mjs';

const TIMES = ['It’s a quarter past five.', 'It’s half past five.', 'It’s a quarter to six.', 'It’s five o’clock.'];

export const engU3 = [
  T(27, 'Unit 3, Lessons 1–2. TV programmes: какие бывают передачи', {
    cards: [
      'Виды передач (TV programmes): **the news** (новости), **cartoon** (мультфильм), **documentary** (документальный фильм), **educational programme** (познавательная программа), **game show** (игровое шоу), **talk show** (ток-шоу), **music programme** (музыкальная программа), **nature programme** (передача о природе), **sports programme** (спортивная программа), **TV series** (сериал).',
      'Жанры фильмов (genre — жанр): **action film** (боевик), **adventure film** (приключенческий), **comedy** (комедия), **detective film** (детектив), **fantasy film** (фэнтези), **horror film** (фильм ужасов), **romantic film** (мелодрама), **science fiction film** (научная фантастика), **fairy tale** (сказка).',
      'Чтобы высказать **мнение**, говорим: **I like / I love … I don’t like … My favourite programme is … I think … is exciting.** Спросить: **Do you like cartoons? What is your favourite film?** Ответ: Yes, I do. / No, I don’t.',
      '**To be on TV** значит «идти по телевизору»: **What’s on TV?** — «Что сейчас по ТВ?» **The news is on at seven.** Эти слова помогут составить идеальную телепрограмму (TV guide).',
    ],
    example: ['Расскажи, какую передачу ты любишь.', [
      ['Называем тип: I like nature programmes.', 'Nature programme — передача о природе.'],
      ['Объясняем: I think they are interesting.', 'Выражаем мнение.'],
      ['Добавляем любимое: My favourite is “Animal Planet”.', 'My favourite — моя любимая.'],
    ]],
    check: [
      S('Что значит documentary?', 'документальный фильм', ['документальный фильм', 'мультфильм', 'новости', 'сериал'], ['Documentary — о реальных событиях.']),
      S('Что значит the news?', 'новости', ['новости', 'новинки', 'погода', 'сериал'], ['The news — новости.']),
    ],
    practice: [
      S('Как будет «ток-шоу»?', 'talk show', ['talk show', 'game show', 'nature programme', 'TV series'], ['Talk — разговор.']),
      S('Как будет «фильм ужасов»?', 'horror film', ['horror film', 'comedy', 'fairy tale', 'action film'], ['Horror — ужас.']),
      S('Как будет «боевик»?', 'action film', ['action film', 'adventure film', 'romantic film', 'science fiction film'], ['Action — действие, боевик.']),
      S('Как будет «спортивная программа»?', 'sports programme', ['sports programme', 'music programme', 'educational programme', 'game show'], ['Sports — спорт.']),
      S('Как спросить «Что идёт по ТВ?»', 'What’s on TV?', ['What’s on TV?', 'Where is TV?', 'Who is on TV?', 'Why TV?'], ['Be on TV — идти по ТВ.']),
      adv(S('Как будет «мелодрама»?', 'romantic film', ['romantic film', 'detective film', 'fantasy film', 'comedy'], ['Romantic — романтический.'])),
      adv(TF('Genre — это «жанр».', true, ['Action film — один из жанров.'])),
    ],
    bonus: [
      S('Как будет «познавательная программа»?', 'educational programme', ['educational programme', 'music programme', 'game show', 'nature programme'], ['Educational — образовательный.']),
      I('Вставь слово: My ___ film is “Frozen”. (любимый)', 'favourite', ['Favourite — любимый.'], ['Первая буква — f.']),
    ],
    card: ['📺', 'Что по телику?', 'В английском телепередач много видов: news, cartoon, game show, documentary. Выучи их — и сможешь составить свою телепрограмму.'],
  }),
  T(28, 'Unit 3, Lessons 4–5. Описываем фильм: exciting, scary, touching', {
    cards: [
      'Слова-оценки: **exciting** (захватывающий), **amusing** (забавный), **scary** (страшный), **touching** (трогательный), **silly** (глупый), **horrible** (ужасный). Говорим: The film is **exciting**. The cartoon was **amusing**.',
      'Вопросы о вчерашнем просмотре: **What films did you watch yesterday? Did you like it? Why?** Ответ: I watched a comedy. It was **funny**. I didn’t like the horror film. It was **scary**.',
      '**Рецензия** (review) — короткий отзыв: название, жанр, о чём, мнение, совет. **“Frozen” is a cartoon. It is about two sisters. It is exciting and touching. I recommend it!** Слово **recommend** — «рекомендовать».',
      'Полезные слова: **both** (оба), **brave** (храбрый), **strong** (сильный), **weak** (слабый). Фразы совета: **You should watch it. Don’t miss it!**',
    ],
    example: ['Напиши мини-отзыв на любимый фильм.', [
      ['Название и жанр: “Shrek” is a comedy.', 'Is — настоящее время.'],
      ['Мнение: It is amusing and exciting.', 'Прилагательные-оценки.'],
      ['Совет: I recommend it!', 'Recommend — рекомендую.'],
    ]],
    check: [
      S('Что значит scary?', 'страшный', ['страшный', 'смешной', 'трогательный', 'глупый'], ['Scary — пугающий.']),
      S('Что значит touching?', 'трогательный', ['трогательный', 'забавный', 'страшный', 'глупый'], ['Touching film — трогает до слёз.']),
    ],
    practice: [
      S('The horror film was very ___ .', 'scary', ['scary', 'amusing', 'touching', 'weak'], ['Horror — страшный.']),
      S('The comedy was ___ . (забавный)', 'amusing', ['amusing', 'scary', 'horrible', 'brave'], ['Comedy — забавная.']),
      S('Как будет «захватывающий»?', 'exciting', ['exciting', 'silly', 'weak', 'both'], ['Exciting — захватывает.']),
      S('Что значит recommend?', 'рекомендовать', ['рекомендовать', 'смотреть', 'любить', 'выбирать'], ['I recommend it — я рекомендую.']),
      S('Как будет «глупый»?', 'silly', ['silly', 'brave', 'strong', 'amusing'], ['Silly — глупый.']),
      adv(S('Выбери верное предложение.', 'I didn’t like the film. It was silly.', ['I didn’t liked the film.', 'I didn’t like the film. It was silly.', 'I not like the film.'], ['Didn’t + like.'])),
      adv(TF('В рецензии пишут название, жанр, мнение и совет.', true, ['Это план короткого отзыва.'])),
    ],
    bonus: [
      S('Как будет «храбрый»?', 'brave', ['brave', 'weak', 'lazy', 'mean'], ['Brave — храбрый.']),
      I('Вставь слово: I ___ this show! (рекомендую)', 'recommend', ['Recommend — рекомендовать.'], ['Первая буква — r.']),
    ],
    card: ['⭐', 'Рецензия', 'Хорошая рецензия коротка: название, жанр, мнение и совет. Например: “It is exciting. I recommend it!”'],
  }),
  T(29, 'Unit 3, Lesson 3. What time is it? Время и телепрограмма', {
    cards: [
      'Спросить время: **What time is it?** Ответ: **It’s five o’clock.** (ровно пять). **It’s a quarter past five** (5:15, «четверть после пяти»), **It’s half past five** (5:30, «половина после пяти»), **It’s a quarter to six** (5:45, «четверть до шести»).',
      'Минуты: после часа до 30 минут говорим **past**: **ten past three** (3:10), **twenty-five past three** (3:25). Если минут больше 30 — **to**: **ten to four** (3:50), **five to four** (3:55).',
      'Телепрограмма: **What time is the news on? — It’s on at seven o’clock.** **The cartoon is on at a quarter past four.** Слова **quarter** (четверть) и **half** (половина) мы уже знаем из учебника, а **be on** значит «идти (о передаче)».',
      'Составим «идеальную программу» (TV guide): **4:00 cartoons — 5:15 sports programme — 6:30 nature programme — 7:00 the news.** Читаем: The sports programme is on at a quarter past five.',
    ],
    example: ['Скажи, во сколько идёт мультфильм в 4:15.', [
      ['Это четверть после четырёх.', 'Quarter past four.'],
      ['The cartoon is on at a quarter past four.', 'Be on at + время.'],
      ['Вопрос: What time is the cartoon on?', 'What time … ?'],
    ]],
    check: [
      S('5:30 — это …', 'It’s half past five.', TIMES.slice(0, 4), ['Half — половина.']),
      S('5:15 — это …', 'It’s a quarter past five.', TIMES.slice(0, 4), ['Quarter — четверть.']),
    ],
    practice: [
      S('5:45 — это …', 'It’s a quarter to six.', TIMES, ['До шести — четверть.']),
      S('7:00 — это …', 'It’s seven o’clock.', ['It’s a quarter past seven.', 'It’s seven o’clock.', 'It’s half past seven.'], ['O’clock — ровно.']),
      S('3:10 — это …', 'It’s ten past three.', ['It’s ten to three.', 'It’s ten past three.', 'It’s ten past four.'], ['Минуты после часа — past.']),
      S('Как спросить время?', 'What time is it?', ['What time is it?', 'How old is it?', 'Where is it?', 'Who is it?'], ['Time — время.']),
      S('Что значит be on (о программе)?', 'идти по ТВ', ['идти по ТВ', 'быть дома', 'выключить', 'любить'], ['What’s on TV?']),
      adv(S('Ten to four — это …', '3:50', ['3:10', '3:50', '4:10', '4:50'], ['До четырёх остаётся десять минут.'])),
      adv(TF('«Half» значит «половина».', true, ['Half past — половина после.'])),
    ],
    bonus: [
      I('Вставь слово: It’s a ___ to six. (5:45)', 'quarter', ['Quarter — четверть.'], ['Первая буква — q.']),
      S('Как сказать «2:30»?', 'half past two', ['half past two', 'half to two', 'two past half', 'two o’clock'], ['Half past.']),
    ],
    card: ['🕰️', 'Время на английском', 'Past — «после», to — «до». Четверть — quarter, половина — half. Научись читать часы — это очень нужно.'],
  }),
  T(30, 'Unit 3, Lesson 4. How often? Наречия частоты', {
    cards: [
      'Наречия частоты отвечают на вопрос **How often?** — «Как часто?»: **always** (всегда), **usually** (обычно), **often** (часто), **sometimes** (иногда), **rarely** (редко), **never** (никогда). Часто используются в **Present Simple**.',
      'Место наречия: **перед** смысловым глаголом, но **после** to be. **I often watch TV.** **She never watches horror films.** **He is always late.** **They are usually at home.**',
      'Вопрос: **How often do you watch TV?** — I **usually** watch TV in the evening. **How often does she go to the cinema?** — She **sometimes** goes there. С he / she / it к глаголу добавляем **-s** (watches, goes).',
      'Ответ в шкале: **Yes, always. / Yes, often. / Yes, sometimes. / No, rarely. / No, never.** Так можно ответить в анкете о телепросмотре или даже о здоровом образе жизни.',
    ],
    example: ['Скажи, что ты редко смотришь телевизор.', [
      ['Наречие: rarely.', 'Rarely — редко.'],
      ['Ставим его перед глаголом: I rarely watch TV.', 'Перед смысловым глаголом.'],
      ['С he: He rarely watches TV.', 'Добавляем -es.'],
    ]],
    check: [
      S('She ___ watches horror films. (никогда)', 'never', ['never', 'always', 'often', 'usually'], ['Never — никогда.']),
      S('Как будет «обычно»?', 'usually', ['usually', 'rarely', 'sometimes', 'always'], ['Usually — обычно.']),
    ],
    practice: [
      S('I ___ watch TV in the evening. (всегда)', 'always', ['always', 'never', 'rarely', 'ago'], ['Always — всегда.']),
      S('He is ___ late. (никогда)', 'never', ['never', 'always', 'often', 'does'], ['После is.']),
      S('Выбери предложение, где often стоит по правилу (перед глаголом).', 'They often play games.', ['They play often games.', 'They often play games.', 'They often plays games.'], ['Often — перед смысловым глаголом.']),
      S('Как спросить «Как часто ты смотришь ТВ?»', 'How often do you watch TV?', ['How often do you watch TV?', 'How do you often watch TV?', 'Do you how often watch TV?'], ['How often + do + you.']),
      S('Что значит rarely?', 'редко', ['редко', 'часто', 'всегда', 'иногда'], ['Rarely — почти никогда.']),
      adv(S('She ___ cartoons on Sundays. (иногда, наречие перед глаголом)', 'sometimes watches', ['sometimes watches', 'sometimes watching', 'sometimes watch', 'sometimes to watch'], ['С she — watches.'])),
      adv(TF('Наречие always стоит после глагола to be.', true, ['He is always kind.'])),
    ],
    bonus: [
      S('Как сказать «Он часто читает» (often перед глаголом)?', 'He often reads.', ['He often read.', 'He often reading.', 'He often reads.'], ['Often + reads.']),
      I('Вставь слово: We ___ have dinner at 7. (обычно)', 'usually', ['Usually — обычно.'], ['Первая буква — u.']),
    ],
    card: ['📊', 'Как часто?', 'От 100% до 0%: always – usually – often – sometimes – rarely – never. Выучи шкалу по порядку.'],
  }),
  T(31, 'Unit 3, Lessons 6–9. Cartoon characters: прилагательные характера', {
    cards: [
      'Герои мультфильмов — какие они? **cheerful** (жизнерадостный), **helpful** (готовый помочь), **hard-working** (трудолюбивый), **loyal** (преданный), **brave** (храбрый), **strong** (сильный). Плохие качества: **lazy** (ленивый), **rude** (грубый), **mean** (злой, скупой), **cowardly** (трусливый), **nosy** (любопытный), **weak** (слабый).',
      'Описываем героя: **Winnie-the-Pooh is cheerful and loyal. Piglet is cowardly, but he is a good friend. Rabbit is hard-working. Eeyore is sad.** Используем глагол **to be** и союзы **and, but**.',
      'Рассказ о любимом персонаже: **My favourite character is … He / She is … He / She likes … I like him / her because he / she is …** Можно сказать, кого герой напоминает: **He is like my friend.**',
      'В учебнике есть урок об истории мультфильмов в Беларуси (его слушают на аудио) и проект «Викторина» (quiz). Придумай свои вопросы о мультфильмах: **What is your favourite cartoon? Who is your favourite character? Why do you like him / her?**',
    ],
    example: ['Опиши героя мультфильма.', [
      ['Называем героя: My favourite character is Winnie-the-Pooh.', 'My favourite — моя любимая.'],
      ['Описываем: He is cheerful and loyal.', 'Is + прилагательные.'],
      ['Объясняем: I like him because he is a good friend.', 'Because — потому что.'],
    ]],
    check: [
      S('Что значит lazy?', 'ленивый', ['ленивый', 'трудолюбивый', 'храбрый', 'грубый'], ['Lazy — ленивый.']),
      S('Что значит hard-working?', 'трудолюбивый', ['трудолюбивый', 'ленивый', 'грубый', 'слабый'], ['Hard-working — усердно работающий.']),
    ],
    practice: [
      S('Как будет «трусливый»?', 'cowardly', ['cowardly', 'brave', 'strong', 'loyal'], ['Cowardly — боящийся.']),
      S('Как будет «преданный»?', 'loyal', ['loyal', 'rude', 'mean', 'nosy'], ['Loyal friend — верный друг.']),
      S('Как будет «жизнерадостный»?', 'cheerful', ['cheerful', 'weak', 'lazy', 'silly'], ['Cheerful — радостный.']),
      S('Что значит nosy?', 'любопытный', ['любопытный', 'грубый', 'слабый', 'храбрый'], ['Nosy — суёт нос везде.']),
      S('Что значит rude?', 'грубый', ['грубый', 'добрый', 'ленивый', 'умный'], ['Rude — невежливый.']),
      adv(S('Какое слово противоположно слову strong?', 'weak', ['weak', 'brave', 'loyal', 'helpful'], ['Strong — сильный, weak — слабый.'])),
      adv(TF('Helpful значит «готовый помочь».', true, ['A helpful friend — отзывчивый друг.'])),
    ],
    bonus: [
      S('Как будет «злой, скупой»?', 'mean', ['mean', 'brave', 'lazy', 'strong'], ['Mean — злой, скупой.']),
      I('Вставь слово: He is a ___ friend. (преданный)', 'loyal', ['Loyal — преданный.'], ['Первая буква — l.']),
    ],
    card: ['🐻', 'Характер героя', 'Опиши героя тремя прилагательными: например, Pooh is cheerful, loyal and kind. Так учатся описывать людей.'],
  }),
];
