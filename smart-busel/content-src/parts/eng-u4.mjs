import { T, S, TF, I, adv } from '../lib.mjs';

const IOA = ['in', 'on', 'at'];

export const engU4 = [
  T(32, 'Unit 4, Lesson 1. Праздники и предлоги времени in / on / at', {
    cards: [
      'Праздники Беларуси: **New Year’s Day** (Новый год), **Women’s Day** (8 марта), **Labour Day** (Праздник труда), **Victory Day** (День Победы), **Independence Day** (День Независимости), **Fatherland Defender’s Day** (День защитников Отечества), **Harvest Festival** (Праздник урожая), **October Revolution Day**, **Christmas** (Рождество), **Easter** (Пасха), **Pancake Day** (Масленица). **Celebrate** — «праздновать», **celebration** — «праздник».',
      'Предлог **in** — для месяцев, лет, времён года, частей суток: **in July, in 2025, in summer, in the morning**. Предлог **on** — для дней и дат: **on Monday, on May 9th, on my birthday, on New Year’s Day**. Предлог **at** — для точного времени и праздников-периодов: **at 5 o’clock, at night, at Christmas, at Easter, at the weekend**.',
      'Примеры: Independence Day is **on** July 3rd. We celebrate Victory Day **in** May. We get presents **at** Christmas. The party is **at** 6 o’clock **on** Saturday.',
      'Хитрости: **in the morning**, но **at night**; **on Monday**, но **at the weekend**; **on Sundays** — по воскресеньям. Спрашиваем: **When is Women’s Day?** — It’s **on** March 8th.',
    ],
    example: ['Выбери in, on или at: «Independence Day is ___ July 3rd».', [
      ['Это дата, то есть конкретный день.', 'Для дат нужен on.'],
      ['Independence Day is on July 3rd.', 'On + дата.'],
      ['Но: Independence Day is in July.', 'Для месяца — in.'],
    ]],
    check: [
      S('My birthday is ___ June.', 'in', IOA, ['Месяц — in.']),
      S('We have a party ___ Saturday.', 'on', IOA, ['День недели — on.']),
    ],
    practice: [
      S('I get up ___ 7 o’clock.', 'at', IOA, ['Точное время — at.']),
      S('We celebrate ___ Christmas.', 'at', IOA, ['At Christmas — на Рождество.']),
      S('It is cold ___ winter.', 'in', IOA, ['Время года — in.']),
      S('The parade is ___ May 9th.', 'on', IOA, ['Дата — on.']),
      S('We watch fireworks ___ night.', 'at', IOA, ['At night — ночью.']),
      adv(S('Выбери верное предложение.', 'Victory Day is on May 9th.', ['Victory Day is in May 9th.', 'Victory Day is on May 9th.', 'Victory Day is at May 9th.'], ['Дата — on.'])),
      adv(TF('В английском говорят «on the morning».', false, ['Нужно in the morning.'])),
    ],
    bonus: [
      S('Как будет «Праздник труда»?', 'Labour Day', ['Labour Day', 'Victory Day', 'Pancake Day', 'Women’s Day'], ['Labour — труд.']),
      I('Вставь предлог: They celebrate Easter ___ spring.', 'in', ['Время года — in.'], ['Две буквы.']),
    ],
    card: ['📅', 'In, on, at', 'In — большие периоды (месяц, год). On — дни и даты. At — точное время. Три маленьких слова — большая шпаргалка.'],
  }),
  T(33, 'Unit 4, Lesson 2. Let’s celebrate: как мы празднуем', {
    cards: [
      'Что делают на празднике: **invite relatives** (приглашать родственников), **decorate … with …** (украшать чем-то), **light candles** (зажигать свечи), **get presents** (получать подарки), **send cards** (посылать открытки), **watch a parade** (смотреть парад), **watch fireworks** (смотреть салют), **play jokes on …** (подшучивать над …), **wish happiness** (желать счастья), **paint eggs** (красить яйца).',
      'Про то, что **делаем каждый год**, используем **Present Simple**: **We invite our relatives. My mum decorates the house with lights. We watch fireworks.** С he / she / it добавляем **-s**: **decorates, lights, sends, gets**.',
      'Про то, что **было в прошлом году**, используем **Past Simple**: **We invited relatives. We lit candles (light — lit). We got presents. She sent cards. We watched a parade.** Light — lit, get — got, send — sent.',
      'Рассказ: **On Easter we paint eggs. Last Easter we painted eggs and gave them to our relatives.** Здесь важно слово: **Last Easter, last year** — прошедшее время, **every year, always** — настоящее.',
    ],
    example: ['Расскажи, что ты делаешь на Новый год.', [
      ['Выбираем фразы: decorate the tree, get presents, watch fireworks.', 'Берём из учебника.'],
      ['Составляем: We decorate the tree and get presents.', 'Present Simple — привычное действие.'],
      ['Добавляем: Last year we watched fireworks.', 'Past Simple — что было.'],
    ]],
    check: [
      S('Что значит decorate?', 'украшать', ['украшать', 'приглашать', 'красить', 'смотреть'], ['Decorate — украшать.']),
      S('Past Simple от get.', 'got', ['getted', 'got', 'gotten'], ['Get — got.']),
    ],
    practice: [
      S('Как будет «смотреть салют»?', 'watch fireworks', ['watch fireworks', 'watch a parade', 'light candles', 'paint eggs'], ['Fireworks — салют.']),
      S('Как будет «зажигать свечи»?', 'light candles', ['light candles', 'send cards', 'paint eggs', 'invite relatives'], ['Candles — свечи.']),
      S('Как будет «красить яйца»?', 'paint eggs', ['paint eggs', 'play jokes', 'wish happiness', 'get presents'], ['Paint — красить.']),
      S('Last year we ___ cards. (send)', 'sent', ['sended', 'sent', 'send'], ['Send — sent.']),
      S('Every year my mum ___ the house with lights. (decorate)', 'decorates', ['decorate', 'decorates', 'decorated'], ['Every year + she — decorates.']),
      adv(S('Что значит play jokes on someone?', 'подшучивать над кем-то', ['подшучивать над кем-то', 'играть с кем-то', 'смеяться', 'дарить подарки'], ['Joke — шутка.'])),
      adv(TF('«Wish happiness» значит «желать счастья».', true, ['Wish — желать.'])),
    ],
    bonus: [
      S('Как будет «родственник»?', 'relative', ['relative', 'present', 'parade', 'angel'], ['Relative — родственник.']),
      I('Напиши Past Simple глагола light.', 'lit', ['Light — lit.'], ['Три буквы.']),
    ],
    card: ['🎆', 'Праздничные дела', 'Праздник — это приглашения, украшения, подарки и салют. Используй фразы урока, чтобы рассказать о любимом празднике.'],
  }),
  T(34, 'Unit 4, Lessons 3–4. Present Simple и Past Simple: Yes / No и Wh-вопросы', {
    cards: [
      '**Present Simple** — для привычек и фактов: **Do you celebrate Easter? — Yes, I do. Does she get presents? — Yes, she does.** Помощник — **do / does**; Past Simple — для событий в прошлом: **Did you celebrate Easter? — Yes, I did. Did she get presents? — No, she didn’t.** Помощник — **did**.',
      'Wh-вопросы в Present Simple: **What do you do on Easter? Where does your family go? When do they celebrate it?** В Past Simple: **What did you do last Easter? Where did your family go? When did they celebrate it?** Меняем do / does на did.',
      'Отрицание: Present — **don’t / doesn’t** (We **don’t** paint eggs. She **doesn’t** like jokes). Past — **didn’t** (We **didn’t** paint eggs last year). После вспомогательного глагола — всегда начальная форма: **don’t go, didn’t go**.',
      'Сравнение: **Every Easter we paint eggs. Last Easter we painted eggs and ate cake.** Подсказки: **every year, usually, always** — Present; **last year, yesterday, ago** — Past. Символы Пасхи: **symbol, church, tradition**. Это слова урока 4 об Пасхе в Беларуси и других странах.',
    ],
    example: ['Преврати «We go to church at Easter» в вопрос в Past Simple.', [
      ['Меняем время на прошедшее: last Easter.', 'Нужно слово-подсказка.'],
      ['Ставим did в начало: Did we go to church last Easter?', 'После did — go.'],
      ['Ответ: Yes, we did. / No, we didn’t.', 'Отвечаем с did.'],
    ]],
    check: [
      S('___ she like Easter? (Present)', 'Does', ['Do', 'Does', 'Did'], ['С she в Present — does.']),
      S('___ they celebrate Christmas last year?', 'Did', ['Do', 'Does', 'Did'], ['Last year — Past: did.']),
    ],
    practice: [
      S('What ___ you do last Easter?', 'did', ['do', 'does', 'did'], ['Last Easter — прошедшее.']),
      S('Where ___ your family go every summer?', 'does', ['do', 'does', 'did'], ['Family в единственном числе — как she / it: does.']),
      S('We ___ paint eggs last year. (отрицание)', 'didn’t', ['don’t', 'didn’t', 'doesn’t'], ['Last year — didn’t.']),
      S('She ___ like jokes. (отрицание, Present)', 'doesn’t', ['don’t', 'doesn’t', 'didn’t'], ['С she — doesn’t.']),
      S('Выбери верное предложение.', 'Did he go to church?', ['Did he went to church?', 'Did he go to church?', 'Does he went to church?'], ['After did — go.']),
      adv(S('Каким словом подсказано Present Simple?', 'every year', ['every year', 'last year', 'yesterday', 'ago'], ['Every year — каждый год.'])),
      adv(TF('«Church» значит «церковь, костёл».', true, ['A church is a place of worship.'])),
    ],
    bonus: [
      S('Что значит tradition?', 'традиция', ['традиция', 'праздник', 'символ', 'подарок'], ['Tradition — обычай.']),
      I('Вставь слово: Easter is a ___ of spring. (символ)', 'symbol', ['Symbol — символ.'], ['Первая буква — s.']),
    ],
    card: ['🥚', 'Пасха и время', 'Привычка в настоящем — do / does, событие в прошлом — did. Не смешивай их в одном вопросе!'],
  }),
  T(35, 'Unit 4, Lessons 5, 8–9. Christmas, Maslenitsa и открытки', {
    cards: [
      'Слова Рождества (**Christmas**): **pull crackers** (взрывать хлопушки), **hang stockings** (вешать чулки), **sing carols** (петь рождественские гимны), **fireplace** (камин), **angel** (ангел), **tinsel** (мишура), **ornament** (украшение), **lights** (огни), **snowman** (снеговик), **snowflake** (снежинка).',
      'Рождественская открытка: **Dear Anna, Merry Christmas and a Happy New Year! I wish you happiness and health. Love, Maxim.** Слова **Merry Christmas!** — «С Рождеством!», **Happy New Year!** — «С Новым годом!», **I wish you …** — «желаю тебе …».',
      '**Maslenitsa** (**Pancake Day**) — праздник проводов зимы. Говорим: **We eat pancakes. We see off winter. We play games and sing songs.** Pancake — блин. В английском есть слово **Pancake Day** (вторник на Масленой неделе).',
      'Чтобы сказать, что **делаем на Рождество**: **We hang stockings by the fireplace. We sing carols. We decorate the tree with lights and ornaments.** Рассказ о прошлом: **Last Christmas we pulled crackers and built a snowman.**',
    ],
    example: ['Напиши короткую рождественскую открытку.', [
      ['Обращение: Dear Sasha,', 'Dear — «дорогой».'],
      ['Поздравление: Merry Christmas and a Happy New Year!', 'Стандартная фраза.'],
      ['Пожелание и подпись: I wish you health and happiness! Anna.', 'I wish you … — желаю тебе …'],
    ]],
    check: [
      S('Что значит tinsel?', 'мишура', ['мишура', 'камин', 'ангел', 'снеговик'], ['Tinsel — блестящая мишура.']),
      S('Как будет «снеговик»?', 'snowman', ['snowman', 'snowflake', 'angel', 'fireplace'], ['Snow + man.']),
    ],
    practice: [
      S('Что значит sing carols?', 'петь рождественские гимны', ['петь рождественские гимны', 'взрывать хлопушки', 'вешать чулки', 'зажигать свечи'], ['Carols — рождественские песни.']),
      S('Как будет «камин»?', 'fireplace', ['fireplace', 'tinsel', 'ornament', 'lights'], ['Fire + place.']),
      S('Как будет «снежинка»?', 'snowflake', ['snowflake', 'snowman', 'angel', 'cracker'], ['Flake — хлопья.']),
      S('Как сказать «С Рождеством!»?', 'Merry Christmas!', ['Merry Christmas!', 'Happy Easter!', 'Good morning!', 'Happy birthday!'], ['Merry — весёлый.']),
      S('Что значит Pancake Day?', 'вторник на Масленой неделе', ['вторник на Масленой неделе', 'Новый год', 'Пасха', 'День Победы'], ['Pancake — блин.']),
      adv(S('Что значит hang stockings?', 'вешать чулки', ['вешать чулки', 'надевать носки', 'красить яйца', 'петь песни'], ['Stockings — длинные чулки.'])),
      adv(TF('В рождественской открытке пишут «I wish you happiness».', true, ['Желаем счастья.'])),
    ],
    bonus: [
      S('Как будет «ангел»?', 'angel', ['angel', 'snowman', 'ornament', 'tinsel'], ['Angel — ангел.']),
      I('Вставь слово: Merry Christmas and a Happy New ___ !', 'Year', ['Happy New Year!'], ['Первая буква — Y.']),
    ],
    card: ['🎄', 'Рождество', 'Слова урока — tinsel, ornament, lights, snowflake — помогут описать ёлку и праздничный дом.'],
  }),
];
