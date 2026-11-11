// Английский, темы 27–33 (Unit 3. What’s on TV? и начало Unit 4): запас вопросов, ссылки на правила урока.
import { S, TF, I, R } from '../lib.mjs';

const at = (phrase, ...tasks) => tasks.map((t) => R(phrase, t));
const PREP = ['in', 'on', 'at', 'to'];

export const pool = {
  27: [
    ...at('Виды передач',
      S('Что значит cartoon?', 'мультфильм', ['мультфильм', 'сериал', 'новости', 'сказка'], 'Cartoon значит «мультфильм».'),
      S('Как будет «игровое шоу»?', 'game show', ['game show', 'talk show', 'TV series', 'the news'], 'Game show — игровое шоу.'),
      S('Что значит nature programme?', 'передача о природе', ['передача о природе', 'музыкальная программа', 'спортивная программа', 'познавательная программа'], 'Nature programme — передача о природе.'),
      S('Как будет «сериал»?', 'TV series', ['TV series', 'cartoon', 'documentary', 'game show'], 'TV series значит «сериал».'),
      I('Напиши по-английски слово «мультфильм».', 'cartoon', 'Мультфильм по-английски — cartoon.')),
    ...at('Жанры фильмов',
      S('Что значит comedy?', 'комедия', ['комедия', 'детектив', 'сказка', 'боевик'], 'Comedy значит «комедия».'),
      S('Как будет «сказка»?', 'fairy tale', ['fairy tale', 'fantasy film', 'comedy', 'adventure film'], 'Fairy tale значит «сказка».'),
      S('Что значит science fiction film?', 'научная фантастика', ['научная фантастика', 'фильм ужасов', 'мелодрама', 'приключенческий фильм'], 'Science fiction film — научная фантастика.'),
      S('Как будет «приключенческий фильм»?', 'adventure film', ['adventure film', 'action film', 'detective film', 'horror film'], 'Adventure film — приключенческий фильм.')),
    ...at('Чтобы высказать',
      S('Как сказать «Моя любимая передача — …»?', 'My favourite programme is …', ['My favourite programme is …', 'I don’t like …', 'What’s on TV?', 'Do you like cartoons?'], 'Favourite значит «любимый»: My favourite programme is …')),
    ...at('The news is on at seven',
      S('The news ___ on at seven.', 'is', ['is', 'are', 'am', 'be'], 'Со словом the news используем is: The news is on at seven.')),
    ...at('Ответ: Yes, I do',
      S('Do you like cartoons? — …', 'Yes, I do.', ['Yes, I do.', 'Yes, I like.', 'Yes, I am.', 'Yes, I does.'], 'На вопрос с Do отвечаем: Yes, I do.')),
  ],
  28: [
    ...at('Слова-оценки',
      S('Что значит amusing?', 'забавный', ['забавный', 'страшный', 'глупый', 'ужасный'], 'Amusing значит «забавный».'),
      S('Как будет «ужасный»?', 'horrible', ['horrible', 'exciting', 'touching', 'amusing'], 'Horrible значит «ужасный».'),
      S('Как будет «трогательный»?', 'touching', ['touching', 'scary', 'silly', 'horrible'], 'Touching значит «трогательный».'),
      S('Что значит exciting?', 'захватывающий', ['захватывающий', 'забавный', 'глупый', 'страшный'], 'Exciting значит «захватывающий».')),
    ...at('Вопросы о вчерашнем просмотре',
      S('What films did you watch yesterday? — …', 'I watched a comedy.', ['I watched a comedy.', 'I watch a comedy.', 'I am watching a comedy.', 'I did watched a comedy.'], 'О вчерашнем отвечаем в Past Simple: I watched a comedy.'),
      S('Выбери верный вопрос: «Тебе понравилось?»', 'Did you like it?', ['Did you like it?', 'Did you liked it?', 'Do you liked it?', 'Was you like it?'], 'Вопрос о прошлом: Did you like it?')),
    ...at('Рецензия (review)',
      S('Что такое review?', 'короткий отзыв', ['короткий отзыв', 'длинный фильм', 'телепрограмма', 'афиша'], 'Рецензия (review) — короткий отзыв.'),
      S('It is ___ two sisters. (о двух сёстрах)', 'about', ['about', 'at', 'on', 'of'], 'О чём фильм, говорим с about: It is about two sisters.')),
    ...at('Полезные слова',
      S('Что значит strong?', 'сильный', ['сильный', 'слабый', 'храбрый', 'оба'], 'Strong значит «сильный».'),
      S('Что значит both?', 'оба', ['оба', 'храбрый', 'слабый', 'сильный'], 'Both значит «оба».'),
      S('Как будет «слабый»?', 'weak', ['weak', 'strong', 'brave', 'both'], 'Weak значит «слабый».')),
    ...at('Фразы совета',
      S('Какая фраза — совет посмотреть фильм?', 'You should watch it.', ['You should watch it.', 'I didn’t like it.', 'It was silly.', 'What films did you watch?'], 'Фраза совета: You should watch it.'),
      TF('«Don’t miss it!» — это фраза совета.', true, 'Фразы совета: You should watch it. Don’t miss it!')),
  ],
  29: [
    ...at('a quarter past five',
      S('6:15 — это …', 'It’s a quarter past six.', ['It’s a quarter past six.', 'It’s a quarter to six.', 'It’s half past six.', 'It’s six o’clock.'], '15 минут после часа — a quarter past.'),
      S('8:30 — это …', 'It’s half past eight.', ['It’s half past eight.', 'It’s half to eight.', 'It’s a quarter past eight.', 'It’s eight o’clock.'], '30 минут — half past.'),
      S('9:45 — это …', 'It’s a quarter to ten.', ['It’s a quarter to ten.', 'It’s a quarter past nine.', 'It’s a quarter to nine.', 'It’s half past nine.'], '45 минут — четверть до следующего часа: a quarter to ten.')),
    ...at('говорим past',
      S('3:25 — это …', 'twenty-five past three', ['twenty-five past three', 'twenty-five to three', 'three past twenty-five', 'twenty-five to four'], 'До 30 минут говорим past: twenty-five past three.'),
      S('4:20 — это …', 'twenty past four', ['twenty past four', 'twenty to four', 'four past twenty', 'twenty to five'], 'До 30 минут говорим past: twenty past four.')),
    ...at('Если минут больше 30',
      S('3:55 — это …', 'five to four', ['five to four', 'five past three', 'five to three', 'fifty-five past three'], 'Больше 30 минут — to: five to four.'),
      S('Ten to seven — это …', '6:50', ['6:50', '7:10', '6:10', '7:50'], 'Ten to seven — без десяти семь, 6:50.'),
      I('Вставь слово: It’s twenty ___ six. (5:40)', 'to', 'Минут больше 30, поэтому to: twenty to six.')),
    ...at('Телепрограмма',
      S('What time is the news on? — …', 'It’s on at seven o’clock.', ['It’s on at seven o’clock.', 'It’s seven o’clock on.', 'It on seven.', 'It’s in seven o’clock.'], 'Отвечаем: It’s on at seven o’clock.')),
    ...at('Читаем: The sports programme',
      S('В программе: 6:30 nature programme. Как прочитать?', 'The nature programme is on at half past six.', ['The nature programme is on at half past six.', 'The nature programme is on at half to six.', 'The nature programme is in half past six.', 'The nature programme on six thirty is.'], '6:30 — half past six; передача «идёт» — is on.')),
    ...at('quarter (четверть)',
      S('Что значит quarter?', 'четверть', ['четверть', 'половина', 'час', 'минута'], 'Quarter значит «четверть», half — «половина».')),
  ],
  30: [
    ...at('Наречия частоты отвечают',
      S('Что значит sometimes?', 'иногда', ['иногда', 'всегда', 'редко', 'никогда'], 'Sometimes значит «иногда».'),
      S('Как будет «часто»?', 'often', ['often', 'rarely', 'never', 'always'], 'Often значит «часто».'),
      S('Как будет «редко»?', 'rarely', ['rarely', 'usually', 'often', 'sometimes'], 'Rarely значит «редко».'),
      S('Что значит How often?', 'Как часто?', ['Как часто?', 'Как долго?', 'Сколько?', 'Когда?'], 'How often? — «Как часто?»')),
    ...at('перед смысловым глаголом, но после to be',
      S('Выбери верное: «Они обычно дома».', 'They are usually at home.', ['They are usually at home.', 'They usually are at home.', 'Usually they at home are.', 'They are at usually home.'], 'После to be: They are usually at home.'),
      S('Выбери верное: «Я часто смотрю ТВ».', 'I often watch TV.', ['I often watch TV.', 'I watch often TV.', 'I am often watch TV.', 'Often I TV watch.'], 'Наречие стоит перед смысловым глаголом: I often watch TV.'),
      TF('В предложении «He always is late» слово always стоит правильно.', false, 'После to be: He is always late.')),
    ...at('С he / she / it к глаголу добавляем -s',
      S('She sometimes ___ to the cinema. (go)', 'goes', ['goes', 'go', 'going', 'gos'], 'С she к глаголу добавляем -s: goes.'),
      S('How often ___ she go to the cinema?', 'does', ['does', 'do', 'is', 'are'], 'С she в вопросе используем does.')),
    ...at('Ответ в шкале',
      S('Какой ответ значит «Нет, никогда»?', 'No, never.', ['No, never.', 'No, rarely.', 'Yes, sometimes.', 'Yes, always.'], 'Never значит «никогда»: No, never.')),
  ],
  31: [
    ...at('Герои мультфильмов',
      S('Что значит loyal?', 'преданный', ['преданный', 'ленивый', 'грубый', 'слабый'], 'Loyal значит «преданный».'),
      S('Как будет «трудолюбивый»?', 'hard-working', ['hard-working', 'helpful', 'cheerful', 'lazy'], 'Hard-working значит «трудолюбивый».'),
      S('Что значит brave?', 'храбрый', ['храбрый', 'трусливый', 'слабый', 'злой'], 'Brave значит «храбрый».'),
      S('Как будет «готовый помочь»?', 'helpful', ['helpful', 'loyal', 'nosy', 'mean'], 'Helpful значит «готовый помочь».')),
    ...at('Плохие качества',
      S('Как будет «ленивый»?', 'lazy', ['lazy', 'rude', 'mean', 'nosy'], 'Lazy значит «ленивый».'),
      S('Как будет «грубый»?', 'rude', ['rude', 'lazy', 'weak', 'cowardly'], 'Rude значит «грубый».'),
      S('Что значит cowardly?', 'трусливый', ['трусливый', 'храбрый', 'любопытный', 'сильный'], 'Cowardly значит «трусливый».'),
      S('Какое слово называет плохое качество?', 'mean', ['mean', 'loyal', 'helpful', 'cheerful'], 'Mean (злой, скупой) — плохое качество.')),
    ...at('Описываем героя',
      S('Winnie-the-Pooh ___ cheerful and loyal.', 'is', ['is', 'are', 'am', 'be'], 'Winnie-the-Pooh — это he, поэтому is.')),
    ...at('Piglet is cowardly',
      S('Piglet is cowardly, ___ he is a good friend.', 'but', ['but', 'because', 'why', 'who'], 'Противопоставление соединяем союзом but («но»).')),
    ...at('I like him / her because',
      S('I like him ___ he is brave.', 'because', ['because', 'why', 'what', 'who'], 'Причину называем со словом because («потому что»).')),
  ],
  32: [
    ...at('Праздники Беларуси',
      S('Как будет «День Победы»?', 'Victory Day', ['Victory Day', 'Labour Day', 'Independence Day', 'Women’s Day'], 'Victory Day — День Победы.'),
      S('Что значит Independence Day?', 'День Независимости', ['День Независимости', 'День Победы', 'Праздник труда', 'Праздник урожая'], 'Independence Day — День Независимости.'),
      S('Как будет «Пасха»?', 'Easter', ['Easter', 'Christmas', 'Pancake Day', 'Harvest Festival'], 'Easter значит «Пасха».'),
      S('Что значит Harvest Festival?', 'Праздник урожая', ['Праздник урожая', 'Масленица', 'Рождество', 'Новый год'], 'Harvest Festival — Праздник урожая.')),
    ...at('Celebrate — «праздновать»',
      S('Что значит celebrate?', 'праздновать', ['праздновать', 'украшать', 'приглашать', 'дарить'], 'Celebrate значит «праздновать».')),
    ...at('Предлог in — для месяцев',
      S('We go to the sea ___ summer.', 'in', PREP, 'С временами года используем in: in summer.'),
      S('I do my homework ___ the evening.', 'in', PREP, 'С частями суток используем in: in the evening.'),
      S('He was born ___ 2014.', 'in', PREP, 'С годами используем in: in 2014.')),
    ...at('Предлог on — для дней и дат',
      S('The party is ___ my birthday.', 'on', PREP, 'С днями используем on: on my birthday.'),
      S('Women’s Day is ___ March 8th.', 'on', PREP, 'С датами используем on: on March 8th.')),
    ...at('Предлог at — для точного времени',
      S('We don’t go to school ___ the weekend.', 'at', PREP, 'Говорят at the weekend.'),
      S('We paint eggs ___ Easter.', 'at', PREP, 'С праздниками-периодами используем at: at Easter.')),
    ...at('Хитрости',
      TF('Говорят «at the weekend», но «on Monday».', true, 'Хитрость: on Monday, но at the weekend.')),
  ],
  33: [
    ...at('Что делают на празднике',
      S('Что значит invite relatives?', 'приглашать родственников', ['приглашать родственников', 'получать подарки', 'посылать открытки', 'желать счастья'], 'Invite relatives — приглашать родственников.'),
      S('Как будет «получать подарки»?', 'get presents', ['get presents', 'send cards', 'light candles', 'paint eggs'], 'Get presents — получать подарки.'),
      S('Как будет «посылать открытки»?', 'send cards', ['send cards', 'get presents', 'watch a parade', 'wish happiness'], 'Send cards — посылать открытки.'),
      S('Что значит watch a parade?', 'смотреть парад', ['смотреть парад', 'смотреть салют', 'красить яйца', 'зажигать свечи'], 'Watch a parade — смотреть парад.'),
      S('Как будет «желать счастья»?', 'wish happiness', ['wish happiness', 'play jokes', 'invite relatives', 'light candles'], 'Wish happiness — желать счастья.')),
    ...at('используем Present Simple',
      S('Every year we ___ our relatives. (invite)', 'invite', ['invite', 'invited', 'invites', 'inviting'], 'Every year — каждый год, Present Simple: we invite.'),
      S('My dad always ___ cards to his friends. (send)', 'sends', ['sends', 'send', 'sent', 'sending'], 'My dad — это he, в Present Simple добавляем -s: sends.')),
    ...at('используем Past Simple',
      S('Last year we ___ a parade. (watch)', 'watched', ['watched', 'watch', 'watches', 'watching'], 'Last year — прошлое, Past Simple: watched.'),
      S('Last Christmas we ___ candles. (light)', 'lit', ['lit', 'light', 'lights', 'lighting'], 'Неправильный глагол: light → lit.')),
    ...at('Здесь важно слово',
      S('Какие слова подсказывают прошедшее время?', 'last year', ['last year', 'every year', 'always', 'usually'], 'Last Easter, last year — прошедшее время.'),
      S('Какие слова подсказывают настоящее время?', 'every year', ['every year', 'last year', 'last Easter', 'yesterday'], 'Every year, always — настоящее время.')),
  ],
};

export const at_ = {};
const old = (topic, phrase, ...keys) => keys.forEach((k) => { at_[`english-t${topic}-${k}`] = phrase; });
old('27', 'What’s on TV?', 'p7');
old('27', 'Favourite значит', 'x11');
old('30', 'перед смысловым глаголом', 'p5', 'x10');
old('30', 'С he / she / it к глаголу добавляем -s', 'p8');
old('31', 'weak (слабый)', 'p8');
old('32', 'Предлог in — для месяцев', 'sc1', 'p5', 'x11');
old('32', 'Предлог on — для дней и дат', 'sc2', 'p6');
old('32', 'Предлог at — для точного времени', 'p3', 'p4', 'p7');
old('32', 'in the morning, но at night', 'p9');
old('33', 'play jokes on', 'p8');
export { at_ as at };

export const explain = {
  'english-t27-x11': 'Favourite значит «любимый».',
  'english-t29-x11': '30 минут — «половина после»: half past two.',
  'english-t30-p4': 'Never значит «никогда» и стоит после to be: He is never late.',
  'english-t29-p6': 'Время спрашивают так: What time is it?',
};
