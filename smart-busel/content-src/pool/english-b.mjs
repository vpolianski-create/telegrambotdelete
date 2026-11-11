// Английский, темы 7–13 (повторение): запас вопросов, ссылки на правила урока, объяснения.
import { S, TF, I, R } from '../lib.mjs';

const at = (phrase, ...tasks) => tasks.map((t) => R(phrase, t));
const BE = ['am', 'is', 'are', 'be'];

export const pool = {
  7: [
    ...at('С he, she, it к глаголу добавляем -s',
      S('My dad ___ coffee in the morning.', 'drinks', ['drinks', 'drink', 'drinking', 'drinkes'], 'My dad — это he, поэтому к глаголу добавляем -s.'),
      S('The dog ___ in the garden.', 'sleeps', ['sleeps', 'sleep', 'sleeping', 'sleepes'], 'The dog — это it, поэтому к глаголу добавляем -s.'),
      I('Напиши форму глагола live с she: She ___ in Minsk.', 'lives', 'С she к глаголу добавляем -s: lives.')),
    ...at('С I, you, we, they глагол остаётся без изменений',
      S('My friends ___ football after school.', 'play', ['play', 'plays', 'playing', 'playes'], 'My friends — это they, глагол остаётся без -s.'),
      S('I ___ milk every morning.', 'drink', ['drink', 'drinks', 'drinking', 'drinkes'], 'С I глагол остаётся без изменений.'),
      TF('Предложение «We lives in Belarus» правильное.', false, 'С we глагол без -s: We live in Belarus.')),
    ...at('добавляем -es',
      S('He ___ his hands before lunch.', 'washes', ['washes', 'washs', 'wash', 'washies'], 'Wash оканчивается на sh, поэтому добавляем -es.'),
      I('Напиши форму глагола go с he: He ___ to bed at nine.', 'goes', 'Go оканчивается на o, поэтому добавляем -es: goes.')),
    ...at('y → ies',
      S('Форма глагола play с he:', 'plays', ['plays', 'plaies', 'playes', 'play'], 'Перед y гласная, поэтому просто -s: play → plays.')),
    ...at('Они стоят перед глаголом',
      S('Выбери верное: «Он всегда встаёт в семь».', 'He always gets up at seven.', ['He always gets up at seven.', 'He gets always up at seven.', 'Always he gets up at seven.', 'He gets up at always seven.'], 'Слово always стоит перед глаголом: He always gets up.')),
    ...at('слова-подсказки',
      S('Что означает слово never?', 'никогда', ['никогда', 'всегда', 'иногда', 'часто'], 'Never значит «никогда».'),
      S('Что означает слово usually?', 'обычно', ['обычно', 'никогда', 'иногда', 'каждый день'], 'Usually значит «обычно».')),
  ],
  8: [
    ...at('используем don’t',
      S('We ___ go to school on Sunday.', 'don’t', ['don’t', 'doesn’t', 'isn’t', 'aren’t'], 'С we в отрицании используем don’t.'),
      S('My sister ___ eat meat.', 'doesn’t', ['doesn’t', 'don’t', 'isn’t', 'aren’t'], 'My sister — это she, поэтому doesn’t.'),
      I('Вставь don’t или doesn’t: He ___ play tennis.', 'doesn’t', 'С he в отрицании используем doesn’t.'),
      S('They ___ watch TV in the morning.', 'don’t', ['don’t', 'doesn’t', 'isn’t', 'aren’t'], 'С they в отрицании используем don’t.')),
    ...at('ставим Do или Does в начало',
      S('___ she speak English?', 'Does', ['Does', 'Do', 'Is', 'Are'], 'С she вопрос начинаем с Does.'),
      S('___ your parents work on Saturday?', 'Do', ['Do', 'Does', 'Is', 'Are'], 'Your parents — это they, вопрос начинаем с Do.')),
    ...at('После does глагол тоже без -s',
      S('Does he ___ in Brest?', 'live', ['live', 'lives', 'living', 'lived'], 'После does глагол стоит без -s: live.'),
      TF('Вопрос «Does she plays the piano?» правильный.', false, 'После does глагол без -s: Does she play the piano?')),
    ...at('Краткие ответы',
      S('Выбери краткий ответ на вопрос «Do you like fish?» (нет).', 'No, I don’t.', ['No, I don’t.', 'No, I doesn’t.', 'No, I am not.', 'No, I like not.'], 'На вопрос с Do отвечаем: No, I don’t.')),
    ...at('Вопросительное слово ставим перед do/does',
      S('Выбери верный вопрос: «Что она делает?»', 'What does she do?', ['What does she do?', 'What she does?', 'Does what she do?', 'What do she does?'], 'Вопросительное слово ставим перед does: What does she do?')),
  ],
  9: [
    ...at('Для всех лиц форма одна',
      S('My sister ___ ride a bike.', 'can', ['can', 'cans', 'is can', 'can to'], 'Форма can одна для всех лиц: she can.'),
      TF('Форма can одинакова для I, he и they.', true, 'Для всех лиц форма одна: I can, he can, they can.')),
    ...at('без to и без -s',
      S('He can ___ fast.', 'run', ['run', 'runs', 'to run', 'running'], 'После can глагол стоит без to и без -s.'),
      S('Выбери верное: «Она умеет рисовать».', 'She can draw.', ['She can draw.', 'She can draws.', 'She can to draw.', 'She cans draw.'], 'После can глагол без to и без -s: She can draw.'),
      I('Вставь глагол jump: Kangaroos can ___ high.', 'jump', 'После can глагол стоит без изменений: jump.')),
    ...at('Отрицание: can’t',
      S('Как будет «Он не умеет петь»?', 'He can’t sing.', ['He can’t sing.', 'He doesn’t can sing.', 'He not can sing.', 'He can’t sings.'], 'Отрицание — can’t, после него глагол без -s.'),
      S('I ___ ski, but I can skate. (не умею)', 'can’t', ['can’t', 'can', 'am not', 'haven’t'], '«Не умею» — это отрицание can’t.')),
    ...at('Вопрос: Can you swim?',
      S('Выбери верный вопрос: «Она умеет танцевать?»', 'Can she dance?', ['Can she dance?', 'Does she can dance?', 'She can dance?', 'Can she dances?'], 'В вопросе can ставим вперёд: Can she dance?')),
    ...at('Короткие ответы: Yes, I can',
      S('Выбери краткий ответ на вопрос «Can you skate?» (да).', 'Yes, I can.', ['Yes, I can.', 'Yes, I do.', 'Yes, I am.', 'Yes, I can to.'], 'Отвечаем с тем же словом: Yes, I can.')),
    ...at('используют для разрешения',
      S('Как спросить разрешения выйти?', 'Can I go out?', ['Can I go out?', 'I can go out?', 'Do I can go out?', 'Can I to go out?'], 'Разрешения спрашивают так: Can I go out?')),
    ...at('Просьбы и предложения',
      S('Как попросить о помощи?', 'Can you help me?', ['Can you help me?', 'You can help me?', 'Can you to help me?', 'Do you can help me?'], 'Просьба с can: Can you help me?')),
  ],
  10: [
    ...at('in — внутри',
      S('The milk is ___ the fridge. (внутри)', 'in', ['in', 'on', 'under', 'between'], 'Внутри чего-то — предлог in.'),
      S('The ball is ___ the bed. (под)', 'under', ['under', 'on', 'in', 'behind'], 'Под чем-то — предлог under.'),
      S('The book is ___ the desk. (на)', 'on', ['on', 'in', 'under', 'between'], 'На поверхности — предлог on.')),
    ...at('next to и near — рядом',
      S('The park is ___ my house. (около)', 'near', ['near', 'under', 'between', 'in'], 'Около, рядом — предлог near.'),
      S('The car is ___ the house. (перед)', 'in front of', ['in front of', 'behind', 'under', 'between'], 'Перед, спереди — in front of.'),
      S('The tree is ___ the house. (за)', 'behind', ['behind', 'in front of', 'on', 'in'], 'За, позади — предлог behind.'),
      TF('Between используют, когда предмет находится между двумя другими.', true, 'Between — между двумя: between the shop and the café.')),
    ...at('at используем для точек',
      S('Выбери верное: «Я дома».', 'I am at home.', ['I am at home.', 'I am in home.', 'I am on home.', 'I am under home.'], 'Для точек используем at: at home.'),
      S('We live ___ Belarus.', 'in', ['in', 'at', 'on', 'next to'], 'Для городов и стран используем in: in Belarus.'),
      S('Выбери верное: «на автобусной остановке».', 'at the bus stop', ['at the bus stop', 'in the bus stop', 'on the bus stop', 'under the bus stop'], 'Для точек используем at: at the bus stop.')),
    ...at('behind (за, позади)',
      S('Что означает предлог under?', 'под', ['под', 'на', 'в', 'между'], 'Under значит «под»: under the chair — под стулом.')),
  ],
  11: [
    ...at('What (что, какой)',
      S('___ is your teacher? — Mrs Brown.', 'Who', ['Who', 'What', 'Where', 'When'], 'Спрашиваем о человеке — Who (кто).'),
      S('___ is my bag? — Under the desk.', 'Where', ['Where', 'When', 'Who', 'Why'], 'Спрашиваем о месте — Where (где).'),
      S('___ do you get up? — At seven.', 'When', ['When', 'Where', 'Who', 'Whose'], 'Спрашиваем о времени — When (когда).'),
      S('___ is this? — It’s a pen.', 'What', ['What', 'Who', 'Where', 'Why'], 'Спрашиваем о предмете — What (что).'),
      S('___ pen is this? — It’s Kate’s.', 'Whose', ['Whose', 'Who', 'What', 'How'], 'Спрашиваем, чья вещь, — Whose (чей).'),
      S('Что означает слово Why?', 'почему', ['почему', 'когда', 'где', 'чей'], 'Why значит «почему», отвечают на него словом Because.')),
    ...at('How many используем',
      S('___ pens have you got? — Five.', 'How many', ['How many', 'How much', 'How old', 'How'], 'Pens можно сосчитать, поэтому How many.'),
      S('___ water is there in the bottle?', 'How much', ['How much', 'How many', 'How old', 'Whose'], 'Water нельзя сосчитать на штуки, поэтому How much.')),
    ...at('How old — возраст',
      S('Выбери ответ на вопрос «How old is your brother?»', 'He is six.', ['He is six.', 'He is Tom.', 'He is at home.', 'Because he is little.'], 'How old — вопрос о возрасте.')),
    ...at('Why — Because',
      S('Выбери ответ на вопрос «Why are you sad?»', 'Because my cat is ill.', ['Because my cat is ill.', 'In the park.', 'At five o’clock.', 'It’s my cat.'], 'На вопрос Why отвечают со слова Because.')),
  ],
  12: [
    ...at('am / is / are + глагол с -ing',
      S('My mum ___ cooking dinner now.', 'is', BE, 'My mum — это she, поэтому is + cooking.'),
      S('We ___ doing our homework at the moment.', 'are', BE, 'С we используем are + глагол с -ing.'),
      S('Look! The dog is ___.', 'running', ['running', 'run', 'runs', 'ran'], 'После is нужен глагол с -ing: running.'),
      TF('Предложение «I am read now» правильное.', false, 'После am нужен глагол с -ing: I am reading now.'),
      I('Вставь am, is или are: I ___ listening to music now.', 'am', 'С I используем am + глагол с -ing.')),
    ...at('е убираем',
      S('Как правильно пишется write с -ing?', 'writing', ['writing', 'writeing', 'writting', 'writng'], 'Немое -e убираем: write → writing.'),
      I('Напиши dance с -ing: She is ___ now.', 'dancing', 'Немое -e убираем: dance → dancing.')),
    ...at('согласная удваивается',
      S('Как правильно пишется swim с -ing?', 'swimming', ['swimming', 'swiming', 'swimeing', 'swimmming'], 'В коротком слове согласная удваивается: swim → swimming.')),
    ...at('обычно просто добавляем -ing',
      S('Как правильно пишется read с -ing?', 'reading', ['reading', 'readding', 'reding', 'readeing'], 'Обычно просто добавляем -ing: read → reading.')),
    ...at('Отрицание: He isn’t reading',
      S('Выбери отрицание: «Они сейчас не играют».', 'They aren’t playing now.', ['They aren’t playing now.', 'They don’t playing now.', 'They isn’t playing now.', 'They not playing now.'], 'С they в отрицании используем aren’t + глагол с -ing.')),
    ...at('Различай: Present Simple',
      S('Какое предложение говорит о действии прямо сейчас?', 'I am reading now.', ['I am reading now.', 'I read every day.', 'I read books.', 'I often read.'], 'Present Continuous (am reading) — действие сейчас, Present Simple — привычка.')),
  ],
  13: [
    ...at('Дни недели: Monday',
      S('Какой день идёт после Wednesday?', 'Thursday', ['Thursday', 'Tuesday', 'Friday', 'Monday'], 'Monday, Tuesday, Wednesday, Thursday — после среды четверг.'),
      S('Какой день идёт перед Saturday?', 'Friday', ['Friday', 'Sunday', 'Thursday', 'Monday'], 'Thursday, Friday, Saturday — перед субботой пятница.')),
    ...at('Месяцы: January',
      S('Какой месяц идёт после June?', 'July', ['July', 'May', 'August', 'January'], 'May, June, July — после июня июль.'),
      S('Какой месяц идёт перед December?', 'November', ['November', 'October', 'January', 'September'], 'October, November, December — перед декабрём ноябрь.')),
    ...at('С днями используем предлог on',
      S('We have English ___ Friday.', 'on', ['on', 'in', 'at', 'to'], 'С днями недели используем on: on Friday.'),
      S('My birthday is ___ July.', 'in', ['in', 'on', 'at', 'to'], 'С месяцами используем in: in July.'),
      S('The film starts ___ five o’clock.', 'at', ['at', 'in', 'on', 'to'], 'С временем используем at: at five o’clock.')),
    ...at('Времена года',
      S('Как по-английски «осень»?', 'autumn', ['autumn', 'spring', 'summer', 'winter'], 'Времена года: spring, summer, autumn, winter. Осень — autumn.')),
    ...at('Порядковые числа',
      S('Порядковое число 2-е:', 'second', ['second', 'two', 'twice', 'secondth'], 'First, second, third — второй это second.'),
      S('Как сказать дату «5 мая»?', 'the fifth of May', ['the fifth of May', 'the five of May', 'fifth the May', 'May of fifth'], 'Дату говорят так: the fifth of May.')),
    ...at('a quarter past seven',
      S('Как сказать «7:15»?', 'a quarter past seven', ['a quarter past seven', 'a quarter to seven', 'half past seven', 'seven o’clock'], '7:15 — четверть после семи: a quarter past seven.'),
      S('Как сказать «7:00»?', 'seven o’clock', ['seven o’clock', 'half past seven', 'a quarter to seven', 'seven past'], 'Ровно семь — seven o’clock.')),
  ],
};

export const at_ = {};
const old = (topic, phrase, ...keys) => keys.forEach((k) => { at_[`english-t${topic}-${k}`] = phrase; });
old('07', 'С he, she, it к глаголу добавляем -s', 'sc1', 'p4');
old('07', 'С I, you, we, they глагол остаётся без изменений', 'sc2', 'p5', 'x13');
old('07', 'добавляем -es', 'p3', 'p6', 'p7');
old('08', 'ставим Do или Does в начало', 'p3', 'p4', 'p9');
old('08', 'После них глагол стоит без -s', 'p10');
old('09', 'без to и без -s', 'p4', 'p6');
old('10', 'in — внутри', 'sc1', 'p3', 'x11');
old('10', 'in — для городов и стран', 'p7');
old('10', 'at используем для точек', 'p10');
old('10', 'behind (за, позади)', 'x12');
old('11', 'What (что, какой)', 'sc1', 'p3', 'p4', 'p9', 'x12');
old('11', 'How old — возраст', 'p6');
old('12', 'am / is / are + глагол с -ing', 'sc1', 'sc2', 'p3', 'p4', 'p9');
old('12', 'Вопрос: Is he reading?', 'p10');
old('13', 'С днями используем предлог on', 'sc2', 'p3', 'p10');
old('13', 'Времена года', 'p9');
old('13', 'Вопрос: What time is it?', 'x11');
export { at_ as at };

export const drop = [
  'english-t10-p8', // выражения «in the tree» в уроке нет
  'english-t13-x12', // слова weekend в уроке нет
];

export const explain = {
  'english-t09-p9': 'Рыбы не умеют летать, поэтому нужно отрицание: can’t.',
  'english-t09-x11': 'Птицы умеют летать, поэтому can.',
  'english-t13-p5': '7:30 — «половина после семи»: half past seven.',
  'english-t13-p6': '7:45 — без четверти восемь: a quarter to eight.',
  'english-t13-p7': 'Порядковые числа: first, second, third. Третий — third.',
};
