import { T, S, TF, I, adv } from '../lib.mjs';

export const engU2 = [
  T(22, 'Unit 2, Lesson 1. Likes and dislikes: like, enjoy, don’t mind, hate', {
    cards: [
      'Чтобы сказать, что нравится, используем **like**, **love**, **enjoy**. Что не нравится — **dislike**, **don’t like**, **hate** («ненавидеть»). Середина — **don’t mind** («не возражаю, мне всё равно»). Например: I **enjoy** playing sports. She **hates** cold weather. We **don’t mind** walking.',
      'После этих глаголов часто идёт глагол с окончанием **-ing**: I like **swimming**. He enjoys **flying** a kite. They hate **getting up** early. С he / she / it к глаголу добавляем **-s**: **likes, enjoys, hates, doesn’t mind**.',
      'Вопрос: **Do you like** going to theme parks? — Yes, I do. / No, I don’t. **Does she enjoy** doing sports? — Yes, she does. / No, she doesn’t. Отрицание: **don’t like**, **doesn’t like**.',
      'Слова урока: **inside / outside** (внутри / снаружи), **spend** (проводить время), **theme park** (парк развлечений), **go on an excursion** (идти на экскурсию), **go out** (выйти из дома), **do / play sports** (заниматься спортом).',
    ],
    example: ['Скажи, что тебе нравится гулять в парке, а не сидеть дома.', [
      ['Нравится: I like walking in the park.', 'Like + глагол с -ing.'],
      ['Не нравится: I don’t like staying inside.', 'Don’t like + -ing.'],
      ['Если сильно не нравится: I hate staying inside.', 'Hate — «ненавижу».'],
    ]],
    check: [
      S('She ___ playing football. (любит)', 'enjoys', ['enjoy', 'enjoys', 'enjoying'], ['С she к глаголу добавляем -s.']),
      S('Что значит don’t mind?', 'не возражаю', ['не возражаю', 'не помню', 'не люблю', 'не знаю'], ['Mind — возражать.']),
    ],
    practice: [
      S('I like ___. (swim)', 'swimming', ['swim', 'swimming', 'swims'], ['После like — форма с -ing.']),
      S('He ___ getting up early. (ненавидит)', 'hates', ['hate', 'hates', 'hating'], ['С he — hates.']),
      S('___ you like going to theme parks?', 'Do', ['Do', 'Does', 'Are'], ['С you — do.']),
      S('Outside — это …', 'снаружи, на улице', ['снаружи, на улице', 'внутри', 'за городом', 'вчера'], ['Противоположность — inside.']),
      S('Как будет «заниматься спортом»?', 'do sports', ['do sports', 'make sports', 'go sport', 'be sports'], ['Do / play sports.']),
      adv(S('Выбери верное предложение.', 'She doesn’t like cooking.', ['She don’t like cooking.', 'She doesn’t likes cooking.', 'She doesn’t like cooking.'], ['После doesn’t — like без -s.'])),
      adv(TF('«Hate» значит «ненавидеть».', true, ['Hate — очень сильное «не нравится».'])),
    ],
    bonus: [
      S('Что значит go on an excursion?', 'идти на экскурсию', ['идти на экскурсию', 'выходить из дома', 'заниматься спортом', 'проводить время'], ['Excursion — экскурсия.']),
      I('Вставь форму: They enjoy ___ (play) outside.', 'playing', ['После enjoy — глагол с -ing.'], ['Play + ing.']),
    ],
    card: ['👍', 'Нравится / не нравится', 'Лесенка чувств: love → like → don’t mind → dislike → hate. После этих глаголов часто идёт глагол с -ing.'],
  }),
  T(23, 'Unit 2, Lessons 2 и 4. Fun outside: Past Simple в рассказе', {
    cards: [
      'В рассказе о том, что ты делал, используем **Past Simple**. Правильные глаголы с **-ed**: **relaxed**, **stretched**, **breathed**, **watched**, **enjoyed**. Неправильные — V2: **built** (build), **made friends** (make friends), **flew a kite** (fly a kite), **went rock climbing**.',
      'Слова урока 2: **build** (строить), **make friends** (подружиться), **fly a kite** (запускать змея), **watch the stars** (смотреть на звёзды), **sky** (небо), **night** (ночь), **go rock climbing** (заниматься скалолазанием).',
      'Слова урока 4: **breathe** (дышать), **relax** (отдыхать), **stretch** (потягиваться), **yoga** (йога). Например: At the weekend we **relaxed** in the park. We **stretched** and **breathed** deeply.',
      'Рассказ о выходных: **On Saturday we went out. We flew a kite in the park, made friends with other children, and watched the stars at night.** Слова **on Saturday, last weekend, yesterday** подсказывают Past Simple. Можно написать маленькое стихотворение о выходных.',
    ],
    example: ['Расскажи, что ты делал в выходные.', [
      ['Выбираем время: Last weekend …', 'Показываем, что это прошлое.'],
      ['Добавляем действия: I flew a kite and built a sandcastle.', 'Fly — flew, build — built.'],
      ['Заканчиваем: It was fun!', 'Was — прошедшее от is.'],
    ]],
    check: [
      S('Past Simple от fly.', 'flew', ['flied', 'flew', 'flown'], ['Fly — flew.']),
      S('Past Simple от build.', 'built', ['builded', 'built', 'build'], ['Build — built.']),
    ],
    practice: [
      S('Last weekend I ___ friends. (make friends)', 'made', ['make', 'made', 'maked'], ['Make — made.']),
      S('We ___ the stars last night. (watch)', 'watched', ['watch', 'watched', 'watchd'], ['Правильный глагол.']),
      S('What does “sky” mean?', 'небо', ['небо', 'звезда', 'ночь', 'змей'], ['Sky — небо.']),
      S('Как будет «потягиваться»?', 'stretch', ['stretch', 'breathe', 'relax', 'build'], ['Stretch — потягиваться.']),
      S('Что значит breathe?', 'дышать', ['дышать', 'отдыхать', 'строить', 'смотреть'], ['Breathe — дышать.']),
      adv(S('Как будет «пошёл заниматься скалолазанием» в прошлом?', 'went rock climbing', ['go rock climbing', 'went rock climbing', 'goes rock climbing'], ['Go — went.'])),
      adv(TF('«Relax» значит «отдыхать».', true, ['Relax — отдыхать, расслабляться.'])),
    ],
    bonus: [
      I('Напиши Past Simple глагола relax.', 'relaxed', ['Правильный глагол: relax + ed.'], ['relax + ed.']),
      S('Выбери слово, которое значит «ночь».', 'night', ['night', 'sky', 'star', 'kite'], ['Night — ночь.']),
    ],
    card: ['🪁', 'Выходные', 'Расскажи про выходные: flew a kite, watched the stars, went rock climbing. Три фразы — и рассказ готов.'],
  }),
  T(24, 'Unit 2, Lesson 3. Out for a walk: приглашения', {
    cards: [
      'Чтобы **пригласить**, говорим: **Would you like to go for a walk?** **Let’s go for a swim!** **Do you want to go for a run?** Друг может **принять** приглашение: **Yes, I’d love to! Great idea! OK, let’s go.**',
      'Чтобы **отказаться**, говорим вежливо: **Sorry, I can’t. I’m busy.** **I’d like to, but I can’t.** Не забываем **sorry** и **thank you**: Thank you, but I can’t.',
      'Фразы со словом **go**: **go for a walk** (пойти погулять), **go for a swim** (пойти поплавать), **go for a run** (пойти побегать), **go for a bike ride** (поехать кататься на велосипеде), **go out** (выйти). Спросить, как дела: **What’s up?** (Как дела?)',
      'Пример диалога: — **What’s up?** — Hi! Would you like to go for a walk? — Yes, I’d love to! — Let’s go to the park. — Sorry, I can’t. I’m at school. Это вежливые разговорные фразы.',
    ],
    example: ['Пригласи друга погулять и отреагируй на отказ.', [
      ['Приглашаем: Would you like to go for a walk?', 'Would you like to …? — вежливо.'],
      ['Друг отказывается: Sorry, I can’t.', 'Вежливый отказ.'],
      ['Отвечаем: OK, maybe tomorrow!', 'Предлагаем другое время.'],
    ]],
    check: [
      S('Что значит What’s up?', 'Как дела?', ['Как дела?', 'Что случилось с погодой?', 'Куда идёшь?', 'Который час?'], ['Дружеское приветствие.']),
      S('Как принять приглашение?', 'Yes, I’d love to!', ['Yes, I’d love to!', 'No, I hate it.', 'Sorry, I can’t.', 'I don’t mind.'], ['I’d love to — с удовольствием.']),
    ],
    practice: [
      S('Как отказаться вежливо?', 'Sorry, I can’t.', ['Sorry, I can’t.', 'Great idea!', 'Let’s go!', 'Yes, I’d love to!'], ['Sorry — извините.']),
      S('Как пригласить погулять?', 'Would you like to go for a walk?', ['Would you like to go for a walk?', 'You are going for a walk.', 'Go for walk.', 'I walk.'], ['Would you like to …?']),
      S('Что значит go for a run?', 'пойти побегать', ['пойти побегать', 'пойти поплавать', 'пойти погулять', 'поехать на велосипеде'], ['Run — бегать.']),
      S('Как будет «пойти поплавать»?', 'go for a swim', ['go for a swim', 'go for a run', 'go for a walk', 'go out'], ['Swim — плавать.']),
      S('Какая фраза значит «Давай пойдём!»?', 'Let’s go!', ['Let’s go!', 'I can’t.', 'What’s up?', 'Excuse me.'], ['Let’s — давай.']),
      adv(S('Выбери фразу для приглашения.', 'Let’s go for a swim!', ['I can’t go out.', 'Let’s go for a swim!', 'I’m busy now.'], ['Let’s + глагол — приглашение.'])),
      adv(TF('«Great idea!» можно сказать, если ты принимаешь приглашение.', true, ['Great idea — отличная идея.'])),
    ],
    bonus: [
      S('Что значит busy?', 'занятой', ['занятой', 'свободный', 'уставший', 'весёлый'], ['I’m busy — я занят.']),
      I('Вставь: Would you ___ to go for a walk?', 'like', ['Would you like to …?'], ['Первая буква — l.']),
    ],
    card: ['🚶', 'Пригласи друга', 'Приглашение звучит вежливо с would you like to… А отказаться можно мягко: I’d like to, but I can’t.'],
  }),
  T(25, 'Unit 2, Lessons 6–7. Past Simple: вопросы с Wh-словами (интервью)', {
    cards: [
      'Чтобы взять **интервью** о том, что было, задаём вопросы в **Past Simple**: **Wh-слово + did + подлежащее + глагол**. **What did you do** at the weekend? **Where did you go**? **Who did you meet**? **When did it happen**? Глагол после did — в начальной форме.',
      'С глаголом **to be** вопрос строим без did: **Where were you** on Sunday? **What was** the weather like? **Who was** with you? **How was** the show?',
      'Отвечаем полным предложением в прошедшем времени: **What did you do? — I read a book. Where did she go? — She went to the park.** Ответ о том, с кем: **Who did you play with? — I played with my friends.**',
      'Пример интервью: — **What did you do on Saturday?** — I went to the school radio station. — **Who did you meet there?** — I met a famous singer. — **Did you like it?** — Yes, I did! Так можно придумать диалог со звездой.',
    ],
    example: ['Задай вопрос: «Maxim read a book on Sunday». Спроси, что он делал.', [
      ['Спрашиваем «что»: What.', 'Выбираем вопросительное слово.'],
      ['Добавляем did, подлежащее и глагол: What did Maxim read?', 'После did — read без изменений.'],
      ['Или: What did Maxim do on Sunday? — He read a book.', 'Do — общий глагол «делать».'],
    ]],
    check: [
      S('___ did you go on Saturday?', 'Where', ['Where', 'Who', 'Why'], ['Спрашиваем про место.']),
      S('What did she ___ ? (do)', 'do', ['do', 'did', 'does'], ['После did — начальная форма.']),
    ],
    practice: [
      S('Who ___ you meet at the weekend?', 'did', ['did', 'do', 'were'], ['Вопрос о прошедшем времени.']),
      S('Where ___ you on Sunday? (быть)', 'were', ['did', 'were', 'was'], ['С to be did не нужен.']),
      S('Выбери верный вопрос.', 'What did he buy?', ['What did he bought?', 'What did he buy?', 'What he did buy?'], ['After did — buy.']),
      S('Когда? — вопросительное слово:', 'When', ['When', 'Where', 'Who', 'Why'], ['When — когда.']),
      S('How was the show?', 'Это вопрос о впечатлении', ['Это вопрос о впечатлении', 'Это вопрос о месте', 'Это вопрос о времени', 'Это вопрос о человеке'], ['How was …? — «Как было?»']),
      adv(S('Как спросить «С кем ты играл?»', 'Who did you play with?', ['Who did you play with?', 'Who you played with?', 'Who did you played with?'], ['After did — play.'])),
      adv(TF('В вопросе «What did you read?» глагол read стоит в начальной форме.', true, ['После did глагол без V2.'])),
    ],
    bonus: [
      S('Выбери верный порядок.', 'Where did they go?', ['Where they did go?', 'Where did they go?', 'Where did they went?'], ['Where + did + they + go.']),
      I('Вставь: What ___ you do yesterday?', 'did', ['Past Simple вопрос.'], ['Первая буква — d.']),
    ],
    card: ['🎙️', 'Интервью', 'Wh-слово + did + подлежащее + глагол. Так строится почти любой вопрос о прошлом в интервью.'],
  }),
  T(26, 'Unit 2, Lesson 8. The Bright Autumn Festival: workshop и приглашение', {
    cards: [
      '**Workshop** — «мастер-класс»: люди собираются, чтобы научиться чему-то новому (например, плести или готовить). **Take part (in)** значит «принимать участие». **Free** — «бесплатный» или «свободный».',
      'Приглашение на мастер-класс: **Come to our workshop! You can learn to paint eggs. Take part in the festival! Entrance is free.** Здесь используем приказы и **can** — «можешь».',
      'Для рассказа об участии в мероприятии в прошлом: **We took part in the workshop. We learnt to make a toy. It was free.** Take — took, learn — learnt (или learned).',
      'Афиша (плакат) отвечает на вопросы: **What?** (что), **Where?** (где), **When?** (когда), **How much?** (сколько стоит). Например: Workshop “Paint a pot”. Where? School hall. When? Saturday, 11 a.m. Free.',
    ],
    example: ['Составь приглашение на мастер-класс.', [
      ['Привлекаем внимание: Come to our workshop!', 'Приказ с come.'],
      ['Рассказываем: You can make a toy.', 'Can — «можешь».'],
      ['Добавляем: Entrance is free. Take part!', 'Free — бесплатно.'],
    ]],
    check: [
      S('Что значит workshop?', 'мастер-класс', ['мастер-класс', 'школьный двор', 'завод', 'праздник'], ['Workshop — место, где учатся делать.']),
      S('Take part in … значит …', 'принимать участие', ['принимать участие', 'брать часть', 'делать фото', 'уходить'], ['Take part — участвовать.']),
    ],
    practice: [
      S('Free в афише чаще означает …', 'бесплатно', ['бесплатно', 'дорого', 'далеко', 'рано'], ['Entrance is free.']),
      S('Past Simple от take.', 'took', ['taked', 'took', 'taken'], ['Take — took.']),
      S('Как пригласить?', 'Come to our workshop!', ['Come to our workshop!', 'I didn’t go.', 'We were there.', 'It was free.'], ['Come — приходи.']),
      S('Что значит autumn?', 'осень', ['осень', 'лето', 'зима', 'весна'], ['Autumn — осень.']),
      S('Какой вопрос отвечает на «Saturday, 11 a.m.»?', 'When?', ['When?', 'Where?', 'Who?', 'Why?'], ['When — когда.']),
      adv(S('Как будет «Мы участвовали в мастер-классе»?', 'We took part in the workshop.', ['We take part in the workshop.', 'We took part in the workshop.', 'We taked part in the workshop.'], ['Took — прошедшее от take.'])),
      adv(TF('Афиша отвечает на вопросы What, Where, When.', true, ['Это главные сведения для участников.'])),
    ],
    bonus: [
      I('Вставь слово: Entrance is ___ . (бесплатно)', 'free', ['Free — бесплатно.'], ['Первая буква — f.']),
      S('Что значит festival?', 'праздник, фестиваль', ['праздник, фестиваль', 'мастер-класс', 'осень', 'парк'], ['The Bright Autumn Festival.']),
    ],
    card: ['🎨', 'Мастер-класс', 'Workshop — это не только мастерская, но и занятие, где можно научиться новому. Попробуй придумать афишу своего.'],
  }),
];
