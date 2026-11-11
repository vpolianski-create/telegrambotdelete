// Английский, темы 21–26 (словарь Unit 1 и Unit 2. Be Active!): запас вопросов, ссылки на правила урока.
import { S, TF, I, R } from '../lib.mjs';

const at = (phrase, ...tasks) => tasks.map((t) => R(phrase, t));

export const pool = {
  21: [
    ...at('Места и природа',
      S('Что значит woods?', 'лес', ['лес', 'река', 'гора', 'песок'], 'Woods значит «лес».'),
      S('Как будет «река»?', 'river', ['river', 'lake', 'rock', 'woods'], 'River значит «река».'),
      S('Что значит storm?', 'шторм', ['шторм', 'песок', 'скала', 'пляж'], 'Storm значит «шторм».'),
      S('Как будет «побережье»?', 'seaside', ['seaside', 'country', 'mountain', 'lake'], 'Seaside значит «побережье».')),
    ...at('Занятия: go hiking',
      S('Что значит go sunbathing?', 'загорать', ['загорать', 'ходить в поход', 'идти купаться', 'идти на пикник'], 'Go sunbathing значит «загорать».'),
      S('Как будет «готовить на костре»?', 'cook over a campfire', ['cook over a campfire', 'watch birds', 'take photos', 'go for a picnic'], 'Cook over a campfire — готовить на костре.'),
      S('Что значит pick (berries)?', 'собирать', ['собирать', 'покупать', 'падать', 'готовить'], 'Pick значит «собирать»: pick berries — собирать ягоды.')),
    ...at('Что берём или находим',
      S('Что значит hotel?', 'гостиница', ['гостиница', 'палатка', 'лагерь', 'пляж'], 'Hotel значит «гостиница».'),
      S('Как будет «цветы»?', 'flowers', ['flowers', 'berries', 'mushrooms', 'woods'], 'Flowers значит «цветы».'),
      I('Напиши по-английски слово «лагерь».', 'camp', 'Camp значит «лагерь»: summer camp.')),
    ...at('Слова-помощники',
      S('Что значит fall?', 'падать', ['падать', 'покупать', 'сказать', 'понимать'], 'Fall значит «падать».'),
      S('Как будет «покупать»?', 'buy', ['buy', 'say', 'spend', 'fall'], 'Buy значит «покупать».')),
  ],
  22: [
    ...at('используем like, love, enjoy',
      S('Какое слово значит «ненавидеть»?', 'hate', ['hate', 'enjoy', 'love', 'like'], 'Hate значит «ненавидеть».'),
      S('Что значит «I don’t mind walking»?', 'Я не против ходить пешком.', ['Я не против ходить пешком.', 'Я ненавижу ходить пешком.', 'Я обожаю ходить пешком.', 'Я не умею ходить пешком.'], 'Don’t mind значит «не возражаю, мне всё равно».')),
    ...at('глагол с окончанием -ing',
      S('He enjoys ___ a kite. (fly)', 'flying', ['flying', 'fly', 'flies', 'flew'], 'После enjoy идёт глагол с -ing: flying.'),
      S('They hate ___ up early. (get)', 'getting', ['getting', 'get', 'gets', 'got'], 'После hate идёт глагол с -ing: getting.'),
      I('Вставь форму: I like ___ (read) books.', 'reading', 'После like идёт глагол с -ing: reading.'),
      TF('Предложение «I enjoy play sports» правильное.', false, 'После enjoy нужен глагол с -ing: I enjoy playing sports.')),
    ...at('С he / she / it к глаголу добавляем -s',
      S('My brother ___ doing sports. (нравится)', 'likes', ['likes', 'like', 'liking', 'is like'], 'My brother — это he, поэтому likes.'),
      S('Anna ___ mind walking. (не против)', 'doesn’t', ['doesn’t', 'don’t', 'isn’t', 'not'], 'Anna — это she, поэтому doesn’t mind.')),
    ...at('Does she enjoy doing sports?',
      S('___ she enjoy doing sports?', 'Does', ['Does', 'Do', 'Is', 'Are'], 'С she вопрос начинаем с Does.'),
      S('Do you like going out? — …', 'Yes, I do.', ['Yes, I do.', 'Yes, I like.', 'Yes, I am.', 'Yes, I does.'], 'На вопрос с Do отвечаем: Yes, I do.')),
    ...at('Слова урока: inside',
      S('Что значит inside?', 'внутри', ['внутри', 'снаружи', 'рядом', 'далеко'], 'Inside значит «внутри», outside — «снаружи».'),
      S('Что значит theme park?', 'парк развлечений', ['парк развлечений', 'зоопарк', 'школьный двор', 'музей'], 'Theme park — парк развлечений.')),
  ],
  23: [
    ...at('Правильные глаголы с -ed',
      S('Past Simple от enjoy.', 'enjoyed', ['enjoyed', 'enjoied', 'enjoyd', 'enjoy'], 'Правильный глагол: enjoy → enjoyed.'),
      I('Напиши Past Simple глагола stretch.', 'stretched', 'Правильный глагол: stretch → stretched.'),
      S('Past Simple от breathe.', 'breathed', ['breathed', 'breatheed', 'breathd', 'brothe'], 'Правильный глагол: breathe → breathed.')),
    ...at('Неправильные — V2',
      S('We ___ a sandcastle. (build)', 'built', ['built', 'builded', 'build', 'builts'], 'Неправильный глагол: build → built.'),
      S('Yesterday I ___ a kite in the park. (fly)', 'flew', ['flew', 'flied', 'flyed', 'fly'], 'Неправильный глагол: fly → flew.'),
      S('They ___ rock climbing last weekend. (go)', 'went', ['went', 'goed', 'go', 'gone'], 'Неправильный глагол: go → went.')),
    ...at('Слова урока 2',
      S('Что значит fly a kite?', 'запускать змея', ['запускать змея', 'смотреть на звёзды', 'строить', 'подружиться'], 'Fly a kite — запускать змея.'),
      S('Как будет «подружиться»?', 'make friends', ['make friends', 'build', 'watch the stars', 'go out'], 'Make friends значит «подружиться».'),
      S('Что значит watch the stars?', 'смотреть на звёзды', ['смотреть на звёзды', 'запускать змея', 'строить', 'дышать'], 'Watch the stars — смотреть на звёзды.'),
      S('Как будет «строить»?', 'build', ['build', 'breathe', 'stretch', 'relax'], 'Build значит «строить».')),
    ...at('Слова урока 4',
      S('Как будет «дышать»?', 'breathe', ['breathe', 'relax', 'stretch', 'build'], 'Breathe значит «дышать».')),
    ...at('подсказывают Past Simple',
      S('Какие слова подсказывают Past Simple?', 'last weekend', ['last weekend', 'every weekend', 'now', 'tomorrow'], 'Слова on Saturday, last weekend, yesterday подсказывают Past Simple.')),
  ],
  24: [
    ...at('Чтобы пригласить',
      S('Какая фраза — приглашение?', 'Do you want to go for a run?', ['Do you want to go for a run?', 'Sorry, I can’t.', 'I’m busy.', 'Great idea!'], 'Приглашают так: Do you want to go for a run?'),
      S('Would you like ___ for a walk?', 'to go', ['to go', 'go', 'going', 'goes'], 'После Would you like идёт to + глагол: to go.')),
    ...at('Друг может принять приглашение',
      S('Какой ответ значит «да»?', 'OK, let’s go.', ['OK, let’s go.', 'Sorry, I can’t.', 'I’m busy.', 'Thank you, but I can’t.'], 'Приглашение принимают так: OK, let’s go.'),
      TF('«Yes, I’d love to!» говорят, когда отказываются.', false, 'Yes, I’d love to! — так принимают приглашение.')),
    ...at('Чтобы **отказаться**',
      S('Какая фраза — вежливый отказ?', 'I’d like to, but I can’t.', ['I’d like to, but I can’t.', 'Yes, I’d love to!', 'Great idea!', 'Let’s go!'], 'Вежливый отказ: I’d like to, but I can’t.')),
    ...at('Не забываем',
      S('Какие слова не забываем при отказе?', 'sorry и thank you', ['sorry и thank you', 'no и never', 'what и where', 'go и run'], 'При отказе не забываем sorry и thank you.')),
    ...at('Фразы со словом go',
      S('Что значит go for a walk?', 'пойти погулять', ['пойти погулять', 'пойти побегать', 'пойти поплавать', 'выйти'], 'Go for a walk — пойти погулять.'),
      S('Как будет «поехать кататься на велосипеде»?', 'go for a bike ride', ['go for a bike ride', 'go for a run', 'go for a swim', 'go out'], 'Go for a bike ride — поехать кататься на велосипеде.'),
      S('Что значит go out?', 'выйти', ['выйти', 'войти', 'побегать', 'поплавать'], 'Go out значит «выйти».'),
      I('Вставь слово: Let’s go ___ a swim!', 'for', 'Говорят go for a swim — пойти поплавать.')),
  ],
  25: [
    ...at('Wh-слово + did + подлежащее + глагол',
      S('___ did you do at the weekend?', 'What', ['What', 'Who', 'Where', 'When'], 'Спрашиваем, что делал, — What did you do?'),
      S('What did you ___ at the shop? (buy)', 'buy', ['buy', 'bought', 'buys', 'buying'], 'После did глагол в начальной форме: buy.'),
      S('Выбери верный вопрос: «Куда она ходила?»', 'Where did she go?', ['Where did she go?', 'Where did she went?', 'Where she went?', 'Where was she go?'], 'Wh-слово + did + подлежащее + глагол: Where did she go?'),
      TF('Вопрос «Who did you met?» правильный.', false, 'После did глагол в начальной форме: Who did you meet?')),
    ...at('С глаголом to be вопрос строим без did',
      S('What ___ the weather like?', 'was', ['was', 'did', 'were', 'do'], 'С глаголом to be вопрос строим без did: What was the weather like?'),
      S('Who ___ with you?', 'was', ['was', 'did', 'does', 'do'], 'С глаголом to be вопрос строим без did: Who was with you?'),
      S('Выбери верный вопрос: «Где ты был в воскресенье?»', 'Where were you on Sunday?', ['Where were you on Sunday?', 'Where did you be on Sunday?', 'Where did you were on Sunday?', 'Where you were on Sunday?'], 'С to be помощник did не нужен: Where were you?')),
    ...at('Отвечаем полным предложением',
      S('Where did she go? — …', 'She went to the park.', ['She went to the park.', 'She go to the park.', 'She did go park.', 'She goes to the park.'], 'Отвечаем в прошедшем времени: She went to the park.'),
      S('What did you do? — …', 'I read a book.', ['I read a book.', 'I reading a book.', 'I did read book.', 'I am read a book.'], 'Отвечаем полным предложением в прошедшем времени.')),
    ...at('Пример интервью',
      S('Did you like it? — …', 'Yes, I did!', ['Yes, I did!', 'Yes, I liked!', 'Yes, I was!', 'Yes, I do liked!'], 'На вопрос с Did отвечаем: Yes, I did.')),
  ],
  26: [
    ...at('«бесплатный» или «свободный»',
      S('Какие два значения у слова free?', '«бесплатный» или «свободный»', ['«бесплатный» или «свободный»', '«быстрый» или «лёгкий»', '«новый» или «старый»', '«большой» или «маленький»'], 'Free — «бесплатный» или «свободный».')),
    ...at('Take part (in)',
      S('Как будет «принимать участие»?', 'take part', ['take part', 'take photos', 'take a seat', 'take off'], 'Take part (in) значит «принимать участие».')),
    ...at('Приглашение на мастер-класс',
      S('Какая фраза приглашает на праздник?', 'Take part in the festival!', ['Take part in the festival!', 'We took part in the workshop.', 'It was free.', 'Where? School hall.'], 'Приглашение — это приказ: Take part in the festival!')),
    ...at('вход бесплатный',
      S('Что значит «Entrance is free»?', 'Вход бесплатный.', ['Вход бесплатный.', 'Вход закрыт.', 'Вход платный.', 'Выход свободен.'], 'Entrance is free значит «вход бесплатный».')),
    ...at('Здесь используем приказы',
      TF('В приглашении используют приказы: «Come to our workshop!»', true, 'В приглашении используем приказы и can: Come to our workshop!')),
    ...at('learn — learnt',
      S('Past Simple от learn.', 'learnt', ['learnt', 'learnd', 'learn', 'learns'], 'Learn → learnt (или learned).'),
      S('Как сказать «Это было бесплатно»?', 'It was free.', ['It was free.', 'It is free.', 'It were free.', 'It free.'], 'О прошлом говорим: It was free.')),
    ...at('Афиша (плакат) отвечает на вопросы',
      S('Какой вопрос афиши значит «сколько стоит»?', 'How much?', ['How much?', 'When?', 'Where?', 'What?'], 'How much? — «сколько стоит».'),
      S('Какой вопрос отвечает на «School hall»?', 'Where?', ['Where?', 'When?', 'How much?', 'Why?'], 'School hall — это место, вопрос Where? (где).'),
      S('Какой вопрос отвечает на «Workshop “Paint a pot”»?', 'What?', ['What?', 'When?', 'Where?', 'How much?'], 'Название события отвечает на вопрос What? (что).')),
  ],
};

export const at_ = {};
const old = (topic, phrase, ...keys) => keys.forEach((k) => { at_[`english-t${topic}-${k}`] = phrase; });
old('21', 'Занятия: go hiking', 'p3');
old('21', 'Люди: tourist', 'p9');
old('22', 'Do you like going to theme parks?', 'p5');
old('22', 'Слова урока: inside', 'p6');
old('24', 'What’s up? (Как дела?)', 'sc1');
old('24', 'OK, let’s go', 'p7');
old('24', 'I’m busy значит', 'x10');
old('25', 'Глагол после did — в начальной форме', 'sc2', 'p5', 'p9');
old('25', 'Wh-слово + did + подлежащее + глагол', 'p3', 'x10', 'x11');
old('25', 'С глаголом to be вопрос строим без did', 'p4');
old('25', 'When did it happen?', 'p6');
old('26', 'festival — «фестиваль, праздник»', 'x11');
export { at_ as at };

export const drop = [
  'english-t25-p7', // что «How was…?» — вопрос о впечатлении, в уроке не сказано
  'english-t26-p6', // слова autumn в уроке нет (только в названии темы)
];

export const explain = {
  'english-t21-p3': 'Go hiking значит «ходить в поход».',
  'english-t21-p9': 'Tourist значит «турист».',
  'english-t21-x11': 'Seaweed значит «водоросли».',
  'english-t24-sc1': 'What’s up? — так по-дружески спрашивают «Как дела?».',
  'english-t26-x11': 'Festival значит «фестиваль, праздник».',
};
