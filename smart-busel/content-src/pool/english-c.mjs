// Английский, темы 14–20 (Unit 1. In Summer): запас вопросов, ссылки на правила урока.
import { S, TF, I, R } from '../lib.mjs';

const at = (phrase, ...tasks) => tasks.map((t) => R(phrase, t));
const PAST = ['was', 'were', 'am', 'be'];

export const pool = {
  14: [
    ...at('What is it in Russian?',
      S('Как спросить перевод слова на русский?', 'What is it in Russian?', ['What is it in Russian?', 'How do you spell it?', 'Can I go out?', 'Sorry, I’m late.'], 'Перевод на русский спрашивают так: What is it in Russian?')),
    ...at('Can you help me, please?',
      S('Тебе нужна помощь. Что скажешь?', 'Can you help me, please?', ['Can you help me, please?', 'Sorry, I’m late.', 'No phones.', 'How do you spell it?'], 'О помощи просят так: Excuse me! Can you help me, please?')),
    ...at('Опоздал на урок',
      S('Ты опоздал на урок. Что скажешь?', 'Sorry, I’m late.', ['Sorry, I’m late.', 'Sorry, I don’t understand.', 'Can I go out?', 'Be kind.'], 'Опоздал на урок — говорим: Sorry, I’m late.')),
    ...at('May I take a seat?',
      S('Как спросить, можно ли сесть?', 'May I take a seat?', ['May I take a seat?', 'Can I go out?', 'What is it in Russian?', 'Do your homework.'], 'Take a seat — сесть. Спрашиваем: May I take a seat?')),
    ...at('делают просьбу вежливой',
      S('Какие слова делают просьбу вежливой?', 'please и sorry', ['please и sorry', 'rule и hard', 'no и not', 'raise и spell'], 'Слова please и sorry делают просьбу вежливой.')),
    ...at('Новые слова урока',
      S('Что значит understand?', 'понимать', ['понимать', 'поднимать', 'вежливый', 'правило'], 'Understand значит «понимать».'),
      S('Что значит raise?', 'поднимать', ['поднимать', 'понимать', 'усердно', 'правило'], 'Raise значит «поднимать»: Raise your hand.'),
      S('Как по-английски «усердно»?', 'hard', ['hard', 'polite', 'rule', 'raise'], 'Hard значит «усердно; трудно».')),
    ...at('Do your homework',
      S('Какое правило значит «Делай домашнее задание»?', 'Do your homework.', ['Do your homework.', 'Speak English.', 'Be kind.', 'No phones.'], 'Do your homework — делай домашнее задание.'),
      S('Какое правило значит «Говори по-английски»?', 'Speak English.', ['Speak English.', 'Do your homework.', 'Be kind.', 'No phones.'], 'Speak English — говори по-английски.')),
    ...at('Приказ начинается с глагола',
      TF('Правило класса начинается с глагола: «Listen, think, and learn».', true, 'Приказ начинается с глагола: Listen, think, and learn.')),
  ],
  15: [
    ...at('he / she / it was',
      S('My grandma ___ in the country last week.', 'was', PAST, 'My grandma — это she, а с she в прошлом используем was.'),
      S('My parents ___ abroad last year.', 'were', PAST, 'My parents — это they, а с they в прошлом используем were.'),
      S('The weather ___ nice yesterday.', 'was', PAST, 'The weather — это it, а с it в прошлом используем was.'),
      I('Вставь was или were: Sasha and I ___ at the lake.', 'were', 'Sasha and I — это we, а с we используем were.'),
      TF('Предложение «They was happy» правильное.', false, 'С they нужно were: They were happy.')),
    ...at('Слова-подсказки о прошлом',
      S('Какое слово говорит о прошлом?', 'yesterday', ['yesterday', 'now', 'tomorrow', 'every day'], 'Yesterday (вчера) — слово-подсказка о прошлом.'),
      S('Что значит last summer?', 'прошлым летом', ['прошлым летом', 'следующим летом', 'каждое лето', 'этим летом'], 'Last summer значит «прошлым летом».')),
    ...at('Слова урока: abroad',
      S('Что значит abroad?', 'за границей', ['за границей', 'в горах', 'в лагере', 'на побережье'], 'Abroad значит «за границей».'),
      S('Как по-английски «гора»?', 'mountain', ['mountain', 'seaside', 'country', 'camp'], 'Mountain значит «гора».'),
      S('Что значит seaside?', 'побережье', ['побережье', 'гора', 'лагерь', 'за границей'], 'Seaside значит «побережье».')),
    ...at('will be',
      S('They ___ in Brest next Sunday.', 'will be', ['will be', 'was', 'were', 'am'], 'Next Sunday — это будущее, поэтому will be.')),
  ],
  16: [
    ...at('Глагол ставим перед подлежащим',
      S('___ she at home yesterday?', 'Was', ['Was', 'Were', 'Is', 'Did'], 'С she в прошлом используем was и ставим его перед подлежащим.'),
      S('___ your friends at the seaside last summer?', 'Were', ['Were', 'Was', 'Are', 'Did'], 'Your friends — это they, значит, Were.'),
      S('Выбери верный вопрос: «Он опоздал?»', 'Was he late?', ['Was he late?', 'He was late?', 'Were he late?', 'Did he late?'], 'В вопросе was ставим перед подлежащим: Was he late?')),
    ...at('Короткие ответы: Yes, I was',
      S('Were you at camp? — …', 'Yes, I was.', ['Yes, I was.', 'Yes, I were.', 'Yes, you was.', 'Yes, I did.'], 'На вопрос про you отвечаем с I: Yes, I was.'),
      S('Was Maxim late? — …', 'No, he wasn’t.', ['No, he wasn’t.', 'No, he weren’t.', 'No, he didn’t.', 'No, he isn’t.'], 'Maxim — это he, значит, No, he wasn’t.')),
    ...at('добавляем not',
      S('We ___ at school last Sunday. (отрицание)', 'weren’t', ['weren’t', 'wasn’t', 'aren’t', 'didn’t'], 'С we в прошлом отрицание — weren’t.'),
      I('Вставь wasn’t или weren’t: She ___ angry.', 'wasn’t', 'С she отрицание — wasn’t.'),
      S('Что означает wasn’t?', 'was not', ['was not', 'were not', 'is not', 'will not'], 'Wasn’t — короткая форма от was not.')),
    ...at('Вопросительное слово ставим в начало',
      S('___ was with you? — My sister.', 'Who', ['Who', 'Where', 'Why', 'When'], 'Спрашиваем о человеке — Who.'),
      S('Выбери верный вопрос: «Где ты был летом?»', 'Where were you in summer?', ['Where were you in summer?', 'Where you were in summer?', 'Where was you in summer?', 'Were where you in summer?'], 'Вопросительное слово в начале, затем were и подлежащее.')),
  ],
  17: [
    ...at('There was + один предмет или неисчисляемое',
      S('There ___ a tent near the river.', 'was', PAST, 'A tent — один предмет, поэтому there was.'),
      I('Вставь was или were: There ___ a big rock on the beach.', 'was', 'A big rock — один предмет, поэтому there was.')),
    ...at('There were + много',
      S('There ___ many rocks in the sea.', 'were', PAST, 'Many rocks — много предметов, поэтому there were.'),
      S('There ___ a few tents on the beach.', 'were', PAST, 'A few tents — несколько предметов, поэтому there were.'),
      TF('«There were a sandcastle» — правильное предложение.', false, 'A sandcastle — один предмет: There was a sandcastle.')),
    ...at('there wasn’t / there weren’t',
      S('There ___ any tourists on the beach. (отрицание)', 'weren’t', ['weren’t', 'wasn’t', 'isn’t', 'didn’t'], 'Tourists — много, поэтому there weren’t.'),
      S('Was there a storm? — …', 'No, there wasn’t.', ['No, there wasn’t.', 'No, there weren’t.', 'No, it wasn’t.', 'No, there didn’t.'], 'На вопрос Was there…? отвечаем: No, there wasn’t.')),
    ...at('Was there a sandcastle?',
      S('Выбери верный вопрос: «Там была палатка?»', 'Was there a tent?', ['Was there a tent?', 'There was a tent?', 'Were there a tent?', 'Did there a tent?'], 'A tent — один предмет, в вопросе was ставим вперёд.')),
    ...at('Слова урока: beach',
      S('Что значит rock?', 'скала', ['скала', 'песок', 'пляж', 'шторм'], 'Rock значит «скала».'),
      S('Как по-английски «пляж»?', 'beach', ['beach', 'sand', 'tent', 'rock'], 'Beach значит «пляж».'),
      S('Что значит seaweed?', 'водоросли', ['водоросли', 'песок', 'скала', 'палатка'], 'Seaweed значит «водоросли».')),
  ],
  18: [
    ...at('добавляем -ed',
      S('Past Simple от help — это …', 'helped', ['helped', 'helpd', 'helpied', 'help'], 'Правильный глагол: добавляем -ed.'),
      I('Напиши Past Simple глагола want.', 'wanted', 'Правильный глагол: want → wanted.'),
      S('Yesterday we ___ a museum. (visit)', 'visited', ['visited', 'visit', 'visits', 'visitted'], 'Yesterday — прошлое, добавляем -ed: visited.')),
    ...at('добавляем только -d',
      S('Past Simple от dance — это …', 'danced', ['danced', 'danceed', 'dancied', 'dancd'], 'Dance оканчивается на -e, добавляем только -d.'),
      I('Напиши Past Simple глагола close.', 'closed', 'Close оканчивается на -e, добавляем только -d.')),
    ...at('меняем y на i',
      S('Past Simple от cry — это …', 'cried', ['cried', 'cryed', 'cryd', 'cryied'], 'Перед y согласная: меняем y на i и добавляем -ed.')),
    ...at('оставляем y',
      S('Past Simple от play — это …', 'played', ['played', 'plaied', 'playd', 'plaid'], 'Перед y гласная, поэтому y оставляем: played.')),
    ...at('читается по-разному',
      S('В каком слове окончание -ed читается [t]?', 'watched', ['watched', 'stayed', 'visited', 'wanted'], 'В слове watched окончание читается [t].'),
      S('В каком слове окончание -ed читается [d]?', 'stayed', ['stayed', 'watched', 'visited', 'wanted'], 'В слове stayed окончание читается [d].')),
    ...at('подсказывают, что нужно Past Simple',
      S('Какие слова подсказывают, что нужно Past Simple?', 'last summer', ['last summer', 'every day', 'now', 'usually'], 'Слова last summer, yesterday, ago подсказывают Past Simple.')),
    ...at('Форма одна для всех лиц',
      TF('В Past Simple к глаголу с he добавляют ещё -s: he visiteds.', false, 'Форма одна для всех лиц: he visited.')),
  ],
  19: [
    ...at('go → went',
      S('Past Simple от take.', 'took', ['took', 'taked', 'taken', 'tooked'], 'Неправильный глагол: take → took.'),
      S('Past Simple от make.', 'made', ['made', 'maked', 'maded', 'make'], 'Неправильный глагол: make → made.'),
      S('Past Simple от ride.', 'rode', ['rode', 'rided', 'ride', 'rod'], 'Неправильный глагол: ride → rode.')),
    ...at('buy → bought',
      S('Past Simple от come.', 'came', ['came', 'comed', 'come', 'camed'], 'Неправильный глагол: come → came.'),
      S('Past Simple от give.', 'gave', ['gave', 'gived', 'given', 'gaved'], 'Неправильный глагол: give → gave.'),
      S('Past Simple от run.', 'ran', ['ran', 'runned', 'run', 'raned'], 'Неправильный глагол: run → ran.'),
      I('Напиши Past Simple глагола drink.', 'drank', 'Неправильный глагол: drink → drank.'),
      I('Напиши Past Simple глагола win.', 'won', 'Неправильный глагол: win → won.'),
      S('I ___ a new book yesterday. (find)', 'found', ['found', 'finded', 'find', 'founded'], 'Неправильный глагол: find → found.'),
      S('She ___ a red dress at the party. (wear)', 'wore', ['wore', 'weared', 'wear', 'worn'], 'Неправильный глагол: wear → wore.')),
    ...at('Фразы урока: go sunbathing',
      S('Что значит go hiking?', 'ходить в поход', ['ходить в поход', 'загорать', 'идти купаться', 'идти на пикник'], 'Go hiking значит «ходить в поход».'),
      S('Как сказать «Мы ходили купаться»?', 'We went swimming.', ['We went swimming.', 'We goed swimming.', 'We go swimming.', 'We went swim.'], 'Go swimming в прошедшем времени — went swimming.')),
    ...at('pick — правильный',
      TF('Глагол pick — правильный: pick → picked.', true, 'Pick — правильный глагол, поэтому picked.')),
  ],
  20: [
    ...at('did not (didn’t) + глагол в начальной форме',
      S('We ___ go to the cinema yesterday. (отрицание)', 'didn’t', ['didn’t', 'don’t', 'wasn’t', 'doesn’t'], 'В Past Simple отрицание строим с didn’t.'),
      S('He didn’t ___ his homework. (do)', 'do', ['do', 'did', 'does', 'done'], 'После didn’t глагол стоит в начальной форме: do.'),
      TF('Предложение «She didn’t went home» правильное.', false, 'После didn’t нужна начальная форма: She didn’t go home.'),
      S('Сделай отрицание: «I saw a storm».', 'I didn’t see a storm.', ['I didn’t see a storm.', 'I didn’t saw a storm.', 'I not saw a storm.', 'I don’t saw a storm.'], 'Didn’t + начальная форма: I didn’t see a storm.')),
    ...at('Did + подлежащее + глагол?',
      S('___ they visit the farm last week?', 'Did', ['Did', 'Do', 'Were', 'Does'], 'Вопрос в Past Simple начинаем с Did.'),
      S('Did you ___ a good time? (have)', 'have', ['have', 'had', 'has', 'having'], 'После did глагол в начальной форме: have.')),
    ...at('Короткие ответы: Yes, I did',
      S('Did you go fishing? — …', 'No, I didn’t.', ['No, I didn’t.', 'No, I don’t.', 'No, I wasn’t.', 'No, I didn’t went.'], 'На вопрос с Did отвечаем: No, I didn’t.')),
    ...at('вопросительное слово + did + подлежащее + глагол',
      S('Выбери верный вопрос: «Куда они ходили?»', 'Where did they go?', ['Where did they go?', 'Where they went?', 'Where did they went?', 'Where they did go?'], 'Порядок: вопросительное слово + did + подлежащее + глагол.'),
      S('___ did he visit the farm? — Last week.', 'When', ['When', 'Where', 'What', 'Who'], 'Спрашиваем о времени — When.')),
    ...at('V2 исчезает',
      S('Сделай вопрос из «He went to the lake».', 'Did he go to the lake?', ['Did he go to the lake?', 'Did he went to the lake?', 'He did go to the lake?', 'Went he to the lake?'], 'В вопросе прошедшее время показывает did, а глагол — go.')),
  ],
};

export const at_ = {};
const old = (topic, phrase, ...keys) => keys.forEach((k) => { at_[`english-t${topic}-${k}`] = phrase; });
old('14', 'Be kind', 'p9');
old('15', 'he / she / it was', 'sc1', 'sc2', 'p3', 'p4', 'p5', 'p6', 'p9', 'x10');
old('15', 'two days ago', 'x11');
old('16', 'Глагол ставим перед подлежащим', 'sc1', 'p3', 'p7', 'x11');
old('16', 'Короткие ответы: Yes, I was', 'p9');
old('17', 'There was + один предмет или неисчисляемое', 'sc1', 'p3', 'x11');
old('17', 'There were + много', 'sc2', 'p9');
old('17', 'Were there', 'p4');
old('17', 'Where were the tourists?', 'p8');
old('17', 'Слова урока: beach', 'p7', 'x10');
old('18', 'Форма одна для всех лиц', 'p9');
old('19', 'go → went', 'sc1', 'p4', 'p10');
old('20', 'Did + подлежащее + глагол?', 'sc2', 'p6');
old('20', 'Глагол после didn’t остаётся без -ed и без V2', 'p3', 'p5');
old('20', 'Сам глагол — в начальной форме', 'p4', 'p9');
old('20', 'What did you do last summer?', 'p7');
old('20', 'Короткие ответы: Yes, I did', 'p8');
export { at_ as at };

export const explain = {
  'english-t17-x10': 'Sand значит «песок», а sandcastle — замок из песка.',
  'english-t18-p7': 'Рассказ о прошлом: travel → travelled.',
  'english-t16-p8': 'В вопросе were ставим перед подлежащим: Were you at camp?',
  'english-t16-p9': 'They — множественное число, поэтому в ответе weren’t.',
};
