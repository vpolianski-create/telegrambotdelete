// Английский, темы 1–6 (повторение): запас вопросов, ссылки на правила урока, объяснения.
// Каждый вопрос привязан к фразе-правилу, которая дословно стоит в карточке темы.
import { S, TF, I, R } from '../lib.mjs';

const at = (phrase, ...tasks) => tasks.map((t) => R(phrase, t));
const BE = ['am', 'is', 'are', 'be'];
const ART = ['a', 'an', 'the', 'без артикля'];

export const pool = {
  1: [
    ...at('he / she / it is',
      S('My sister ___ ten.', 'is', BE, 'My sister — это she, а с she используем is.'),
      S('Tom and I ___ in the park.', 'are', BE, 'Tom and I — это we, а с we используем are.'),
      S('The cats ___ hungry.', 'are', BE, 'The cats — это they, а с they используем are.'),
      I('Вставь am, is или are: I ___ from Belarus.', 'am', 'С местоимением I используем только am.'),
      TF('Предложение «You is my friend» правильное.', false, 'С you нужно are: You are my friend.')),
    ...at('Короткие формы',
      S('Какая короткая форма у «they are»?', 'they’re', ['they’re', 'they’s', 'they’m', 'theyre'], 'Короткая форма от they are — they’re.'),
      S('Что означает «she’s» в предложении «She’s my sister»?', 'she is', ['she is', 'she are', 'she am', 'she not'], 'She’s — короткая форма от she is.')),
    ...at('глагол ставим вперёд',
      S('Выбери верный вопрос: «Он дома?»', 'Is he at home?', ['Is he at home?', 'He is at home?', 'Are he at home?', 'Does he at home?'], 'В вопросе глагол to be ставим вперёд, а с he нужен is.')),
    ...at('добавляем not',
      S('Выбери верное отрицание: «Я не устал».', 'I am not tired.', ['I am not tired.', 'I not am tired.', 'I is not tired.', 'I are not tired.'], 'С I используем am, а not ставим после глагола.')),
    ...at('Краткие ответы',
      S('Выбери краткий ответ на вопрос «Are you ready?» (да).', 'Yes, I am.', ['Yes, I am.', 'Yes, I is.', 'Yes, I are.', 'Yes, you am.'], 'О себе отвечаем с am: Yes, I am.')),
  ],
  2: [
    ...at('He, she, it → has got',
      S('My cat ___ got green eyes.', 'has', ['has', 'have', 'is', 'are'], 'My cat — это it, а с it используем has got.'),
      S('Anna ___ got two brothers.', 'has', ['has', 'have', 'am', 'are'], 'Anna — это she, а с she используем has got.'),
      I('Вставь have или has: My dad ___ got a car.', 'has', 'My dad — это he, а с he используем has got.')),
    ...at('I, you, we, they → have got',
      S('We ___ got a new teacher.', 'have', ['have', 'has', 'is', 'are'], 'С we используем have got.'),
      S('Tom and Ann ___ got a dog.', 'have', ['have', 'has', 'is', 'am'], 'Tom and Ann — это they, а с they используем have got.'),
      TF('Предложение «They has got a garden» правильное.', false, 'С they нужно have: They have got a garden.')),
    ...at('Отрицание: haven’t got',
      S('Выбери отрицание: «У него нет велосипеда».', 'He hasn’t got a bike.', ['He hasn’t got a bike.', 'He haven’t got a bike.', 'He not has got a bike.', 'He isn’t got a bike.'], 'С he в отрицании используем hasn’t got.'),
      S('I ___ got a sister. (отрицание)', 'haven’t', ['haven’t', 'hasn’t', 'isn’t', 'aren’t'], 'С I в отрицании используем haven’t got.')),
    ...at('Has she got',
      S('Выбери верный вопрос: «У тебя есть ручка?»', 'Have you got a pen?', ['Have you got a pen?', 'Has you got a pen?', 'You have got a pen?', 'Are you got a pen?'], 'В вопросе have ставим вперёд: Have you got…?')),
    ...at('Yes, she has',
      S('Выбери краткий ответ на вопрос «Has she got a cat?» (да).', 'Yes, she has.', ['Yes, she has.', 'Yes, she have.', 'Yes, she is.', 'Yes, she got.'], 'Отвечаем с тем же глаголом: Yes, she has.')),
  ],
  3: [
    ...at('an — перед гласным звуком',
      S('It is ___ apple.', 'an', ART, 'Apple начинается с гласного звука, поэтому an.'),
      S('I see ___ dog.', 'a', ART, 'Dog начинается с согласного звука, поэтому a.'),
      I('Вставь a или an: She has ___ umbrella.', 'an', 'Umbrella начинается с гласного звука, поэтому an.'),
      TF('Перед словом book ставят an.', false, 'Book начинается с согласного звука, поэтому a book.')),
    ...at('когда предмет единственный',
      S('___ Earth is our planet.', 'The', ['The', 'A', 'An', 'без артикля'], 'Земля одна, поэтому the Earth.')),
    ...at('когда упоминали его раньше',
      S('I have a cat. ___ cat is black.', 'The', ['The', 'A', 'An', 'без артикля'], 'Кошку уже упоминали, поэтому во второй раз — the cat.')),
    ...at('Артикля нет',
      S('Выбери верное: «Это Анна».', 'This is Anna.', ['This is Anna.', 'This is an Anna.', 'This is the Anna.', 'This is a Anna.'], 'Перед именами артикль не ставят.'),
      S('Выбери верное: «Я живу в Беларуси».', 'I live in Belarus.', ['I live in Belarus.', 'I live in the Belarus.', 'I live in a Belarus.', 'I live in an Belarus.'], 'Перед названием страны Belarus артикля нет.'),
      TF('Перед названиями месяцев артикль не ставят.', true, 'Перед названиями языков, дней и месяцев артикля нет.')),
  ],
  4: [
    ...at('обычно добавляют -s',
      S('Множественное число слова pen:', 'pens', ['pens', 'penes', 'penies', 'pen'], 'Обычно к слову добавляют -s: pen → pens.'),
      I('Напиши множественное число слова dog.', 'dogs', 'Обычно к слову добавляют -s: dog → dogs.')),
    ...at('добавляем -es',
      S('Множественное число слова bus:', 'buses', ['buses', 'buss', 'busies', 'bus'], 'После s добавляем -es: bus → buses.'),
      I('Напиши множественное число слова brush.', 'brushes', 'После sh добавляем -es: brush → brushes.'),
      S('Множественное число слова tomato:', 'tomatoes', ['tomatoes', 'tomatos', 'tomaties', 'tomato'], 'После o добавляем -es: tomato → tomatoes.'),
      TF('Множественное число слова photo — photoes.', false, 'Photo — исключение: photo → photos.')),
    ...at('y меняется на ies',
      S('Множественное число слова family:', 'families', ['families', 'familys', 'familyes', 'family'], 'Перед y согласная, поэтому y меняется на ies.')),
    ...at('перед y гласная',
      S('Множественное число слова day:', 'days', ['days', 'daies', 'dayes', 'day'], 'Перед y гласная, поэтому просто добавляем -s.'),
      I('Напиши множественное число слова toy.', 'toys', 'Перед y гласная o, поэтому просто добавляем -s.')),
    ...at('Слова на -f/-fe',
      S('Множественное число слова wolf:', 'wolves', ['wolves', 'wolfs', 'wolfes', 'wolf'], 'В словах на -f буква f меняется на ves: wolf → wolves.'),
      I('Напиши множественное число слова leaf.', 'leaves', 'В словах на -f буква f меняется на ves: leaf → leaves.')),
    ...at('Исключения: man',
      S('Множественное число слова woman:', 'women', ['women', 'womans', 'womens', 'womanes'], 'Woman — исключение: woman → women.'),
      S('Множественное число слова foot:', 'feet', ['feet', 'foots', 'footes', 'feets'], 'Foot — исключение: foot → feet.')),
    ...at('sheep и fish не изменяются',
      S('Как сказать «три рыбы»?', 'three fish', ['three fish', 'three fishs', 'three fishies', 'three fishen'], 'Слово fish во множественном числе не изменяется.')),
  ],
  5: [
    ...at('для одного предмета',
      S('There ___ a lamp on the desk.', 'is', BE, 'A lamp — один предмет, поэтому there is.'),
      I('Вставь is или are: There ___ a dog in the garden.', 'is', 'A dog — один предмет, поэтому there is.')),
    ...at('There are — для нескольких',
      S('There ___ three apples in the bag.', 'are', BE, 'Three apples — несколько предметов, поэтому there are.'),
      S('There ___ many pupils in the class.', 'are', BE, 'Many pupils — несколько человек, поэтому there are.'),
      TF('Предложение «There are a pen on the table» правильное.', false, 'A pen — один предмет, поэтому нужно there is.')),
    ...at('Для неисчисляемых слов',
      S('There ___ some bread on the plate.', 'is', BE, 'Bread — неисчисляемое слово, поэтому there is.')),
    ...at('There aren’t any pens',
      S('Выбери отрицание: «В сумке нет ручек».', 'There aren’t any pens in the bag.', ['There aren’t any pens in the bag.', 'There isn’t any pens in the bag.', 'There aren’t some pens in the bag.', 'There not are pens in the bag.'], 'Pens — множественное число: there aren’t, а вместо some в отрицании any.')),
    ...at('используем any',
      S('Are there ___ books on the shelf?', 'any', ['any', 'some', 'a', 'an'], 'В вопросе вместо some используем any.')),
    ...at('Is there a cat',
      S('Выбери верный вопрос: «В комнате есть стол?»', 'Is there a table in the room?', ['Is there a table in the room?', 'There is a table in the room?', 'Are there a table in the room?', 'Is a table there in the room?'], 'В вопросе is ставим перед there; a table — один предмет.')),
    ...at('Yes, there are',
      S('Выбери краткий ответ на вопрос «Are there any apples?» (нет).', 'No, there aren’t.', ['No, there aren’t.', 'No, there isn’t.', 'No, they aren’t.', 'No, it isn’t.'], 'На вопрос с Are there отвечаем: No, there aren’t.')),
  ],
  6: [
    ...at('his (его)',
      S('This is my dad. ___ name is Oleg.', 'His', ['His', 'Her', 'Its', 'Their'], 'Dad — это he, значит, his.'),
      S('Kate has a brother. ___ brother is five.', 'Her', ['Her', 'His', 'Its', 'Our'], 'Kate — девочка, значит, her.'),
      S('We have a dog. ___ dog is funny.', 'Our', ['Our', 'Their', 'Your', 'Its'], 'С we используем our — «наш».'),
      S('The children are happy. ___ teacher is kind.', 'Their', ['Their', 'His', 'Her', 'Its'], 'The children — это they, значит, their.'),
      I('Вставь слово: I have a cat. ___ cat is black.', 'My', 'С I используем my — «мой».'),
      S('Как по-английски «наш»?', 'our', ['our', 'their', 'your', 'its'], 'Our значит «наш»: our school — наша школа.')),
    ...at('Не путай its',
      S('Что означает it’s?', 'it is', ['it is', 'его (для предмета)', 'их', 'наш'], 'It’s — короткая форма от it is, а its — притяжательное местоимение.')),
    ...at('используем ’s',
      S('Выбери верное: «машина моей мамы».', 'my mother’s car', ['my mother’s car', 'my mothers car', 'my mother car’s', 'car my mother’s'], 'Для людей добавляем ’s: my mother’s car.'),
      S('Выбери верное: «собака Анны».', 'Anna’s dog', ['Anna’s dog', 'Annas dog', 'Anna dog’s', 'dog Anna’s'], 'Для людей добавляем ’s: Anna’s dog.')),
    ...at('ставим только апостроф',
      S('Выбери верное: «книги девочек» (много девочек).', 'the girls’ books', ['the girls’ books', 'the girl’s books', 'the girls books’', 'the girls’s books'], 'Girls оканчивается на s, поэтому ставим только апостроф.')),
  ],
};

/** Старые задания: правило из урока, которое показывают подсказка и разбор ошибки. */
export const at_ = {};
const old = (topic, phrase, ...keys) => keys.forEach((k) => { at_[`english-t${topic}-${k}`] = phrase; });
old('01', 'he / she / it is', 'sc1', 'sc2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p9', 'p10', 'x12');
old('01', 'глагол ставим вперёд', 'p8');
old('01', 'добавляем not', 'p11');
old('01', 'Краткие ответы', 'x13');
old('02', 'I, you, we, they → have got', 'sc1', 'p3', 'x11');
old('02', 'He, she, it → has got', 'sc2', 'p4', 'p7', 'p9');
old('03', 'an — перед гласным звуком', 'sc1', 'sc2', 'p3', 'x12');
old('03', 'когда предмет единственный', 'p4', 'p10', 'x11');
old('03', 'когда упоминали его раньше', 'p5');
old('03', 'an hour', 'p6');
old('03', 'a university', 'p9');
old('05', 'для одного предмета', 'sc1');
old('05', 'There are — для нескольких', 'sc2', 'p9');
old('05', 'Для неисчисляемых слов', 'p3', 'x11');
old('05', 'Is there a cat', 'p4');
old('05', 'Are there any pens', 'p5', 'x12');
old('06', 'their (их)', 'p4', 'p10', 'x11');
old('06', 'Они стоят перед существительным', 'p6');
old('06', 'Не путай its', 'x12');
export { at_ as at };

export const explain = {
  'english-t04-p5': 'Child — исключение: child → children.',
  'english-t04-p6': 'Man — исключение: man → men.',
  'english-t04-p7': 'Tooth — исключение: tooth → teeth.',
  'english-t02-p8': 'О себе отвечаем с тем же глаголом have: No, I haven’t.',
  'english-t02-x12': 'I’ve got — короткая форма от I have got.',
};
