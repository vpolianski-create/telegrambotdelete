import { T, S, TF, I, adv } from '../lib.mjs';

const WB = ['was', 'were'];
const DID = ['do', 'does', 'did'];

export const engU1 = [
  T(14, 'Unit 1, Lesson 1. Back to school: правила и фразы для урока', {
    cards: [
      'В классе нам нужны **вежливые фразы** (classroom language). Не понял слово: **Sorry, I don’t understand.** Хочешь узнать перевод: **What is “правило” in English?** / **What is it in Russian?** Нужна помощь: **Excuse me! Can you help me, please?** Как пишется слово: **How do you spell it?**',
      'Опоздал на урок: **Sorry, I’m late. May I take a seat?** Нужно выйти: **Can I go out?** Нет карандаша: **Could you give me a pencil, please?** Слова **please** и **sorry** делают просьбу вежливой.',
      'Новые слова урока: **rule** (правило), **polite** (вежливый), **hard** (усердно; трудно), **raise** (поднимать), **understand** (понимать). Например: **Raise your hand** — «Подними руку».',
      'Правила класса пишем **короткими приказами**: **Speak English. Be kind. Do your homework. Listen, think, and learn.** Запрет: **No phones.** Приказ начинается с глагола, а слово **please** добавляем для вежливости.',
    ],
    example: ['Что сказать, если ты опоздал на урок?', [
      ['Сначала извиняемся: Sorry, I’m late.', 'Слово sorry — «извините».'],
      ['Потом просим разрешения: May I take a seat?', 'May I … ? — вежливая просьба.'],
      ['Получилось: Sorry, I’m late. May I take a seat?', 'Так говорят на уроке.'],
    ]],
    check: [
      S('Ты не понял слово. Что скажешь?', 'Sorry, I don’t understand.', ['Sorry, I don’t understand.', 'Can I go out?', 'How do you spell it?', 'Sorry, I’m late.'], ['Don’t understand — «не понимаю».']),
      S('Что значит rule?', 'правило', ['правило', 'урок', 'вежливый', 'понимать'], ['Rule — правило, например, правило класса.']),
    ],
    practice: [
      S('Как спросить, как пишется слово?', 'How do you spell it?', ['How do you spell it?', 'What is it in Russian?', 'Can I go out?', 'Raise your hand.'], ['Spell — называть по буквам.']),
      S('Как попросить разрешения выйти?', 'Can I go out?', ['Can I go out?', 'I am polite.', 'Speak English.', 'No phones.'], ['Go out — выйти.']),
      S('Как вежливо попросить карандаш?', 'Could you give me a pencil, please?', ['Could you give me a pencil, please?', 'Give pencil.', 'I have a pencil.', 'Pencil is mine.'], ['Could you … , please? — вежливая просьба.']),
      S('Что значит polite?', 'вежливый', ['вежливый', 'трудный', 'опоздавший', 'правильный'], ['Be polite — будь вежлив.']),
      S('Какое слово пропущено: ___ your hand.', 'Raise', ['Raise', 'Rule', 'Hard', 'Late'], ['Raise — поднимать.']),
      adv(S('Какое правило значит «Не пользуйся телефонами»?', 'No phones.', ['No phones.', 'Be kind.', 'Speak a lot.', 'Do your homework.'], ['No + существительное — запрет.'])),
      adv(TF('Правило «Be kind» значит «Будь добрым».', true, ['Kind — добрый.'])),
    ],
    bonus: [
      S('Как спросить: «Как будет «правила» по-английски?»', 'What is “правила” in English?', ['What is “правила” in English?', 'How do you spell it?', 'Sorry, I’m late.', 'Can you help me?'], ['Так спрашивают перевод слова.']),
      TF('Фраза «Excuse me! Can you help me, please?» значит «Извините, вы можете мне помочь?»', true, ['Это вежливая просьба о помощи.']),
    ],
    card: ['🏫', 'Вежливый класс', 'Слова please и sorry делают просьбу вежливой. Они очень часто нужны на уроке английского.'],
  }),
  T(15, 'Unit 1, Lesson 2. Past Simple глагола to be: was / were', {
    cards: [
      'Рассказывая о прошлом, глагол **to be** меняет форму: **am / is → was**, **are → were**. **I was**, **he / she / it was**, **we / you / they were**. Например: I **was** happy. They **were** at the seaside.',
      'Слова-подсказки о прошлом: **yesterday** (вчера), **last summer / last Sunday** (прошлым летом / в прошлое воскресенье), **two days ago** (два дня назад), **in 2024**. Например: He **was** late **yesterday**.',
      'Слова урока: **abroad** (за границей), **mountain** (гора), **country** (местность за городом), **summer camp** (лагерь), **seaside** (побережье). Например: I **was** at summer camp. My parents **were** abroad.',
      'Есть ещё **будущее**: **will be**: They **will be** in Brest next Sunday. Сравни: сейчас — am / is / are, раньше — was / were, потом — will be.',
    ],
    example: ['Вставь was или were: «My friends ___ at the seaside last summer».', [
      ['«My friends» — это они (they). Время прошлое: last summer.', 'Нужна форма прошедшего времени.'],
      ['С they используем were.', 'We, you, they — were.'],
      ['My friends were at the seaside last summer.', 'Предложение звучит правильно.'],
    ]],
    check: [
      S('I ___ at school yesterday.', 'was', WB, ['С I в прошлом используем was.']),
      S('We ___ at the seaside last summer.', 'were', WB, ['С we используем were.']),
    ],
    practice: [
      S('She ___ in the mountains last July.', 'was', WB, ['С she — was.']),
      S('They ___ abroad in August.', 'were', WB, ['С they — were.']),
      S('It ___ a sunny day yesterday.', 'was', WB, ['С it — was.']),
      S('You ___ at camp two weeks ago.', 'were', WB, ['С you — were.']),
      S('Which sentence is about the past?', 'He was in the country in summer.', ['He is in the country now.', 'He was in the country in summer.', 'He will be in the country soon.'], ['Was — прошедшее время.']),
      adv(S('Как будет «Мой брат был в лагере»?', 'My brother was at summer camp.', ['My brother is at summer camp.', 'My brother were at summer camp.', 'My brother was at summer camp.'], ['Мой брат = he, значит was.'])),
      adv(I('Вставь was или were: Maxim and Sasha ___ happy.', 'were', ['Maxim and Sasha — это they, значит were.'], ['Замени имена на they.'])),
    ],
    bonus: [
      TF('Предложение «We was at the lake» правильное.', false, ['С we нужно were: We were at the lake.']),
      S('Что значит ago?', 'тому назад', ['тому назад', 'вчера', 'за границей', 'лагерь'], ['Two years ago — два года назад.']),
    ],
    card: ['⏳', 'Was и were', 'Только у глагола to be в прошедшем времени две формы: was и were. У остальных глаголов форма одна на все лица.'],
  }),
  T(16, 'Unit 1, Lesson 3. Was / were: вопросы и отрицания', {
    cards: [
      'Вопрос с **was / were** строим **перестановкой**: **Were you** at summer camp? **Was he** late? **Were they** abroad? Глагол ставим **перед** подлежащим.',
      'Короткие ответы: **Yes, I was. / No, I wasn’t. Yes, we were. / No, we weren’t. Yes, he / she / it was. / No, he / she / it wasn’t.** Вопрос про подлежащее you отвечаем с I или we: Were you …? — Yes, I was.',
      'Отрицание — добавляем **not**: **was not = wasn’t**, **were not = weren’t**. Например: Maxim **wasn’t** at home. He was at summer camp. The leaders **weren’t** angry.',
      'Вопрос с вопросительным словом: **Where were you** in summer? — I was at the seaside. **Who was** with you? **Why were** you late? Вопросительное слово ставим в начало, а дальше — как в вопросе.',
    ],
    example: ['Задай вопрос: «Anna was at the park yesterday».', [
      ['Меняем местами was и Anna.', 'Вопрос начинается с глагола.'],
      ['Was Anna at the park yesterday?', 'Знак вопроса в конце.'],
      ['Краткий ответ: Yes, she was. / No, she wasn’t.', 'Ответ с she и was.'],
    ]],
    check: [
      S('___ you abroad last summer?', 'Were', WB.map((x) => x[0].toUpperCase() + x.slice(1)), ['С you используем were.']),
      S('Выбери отрицание: «Он не был дома».', 'He wasn’t at home.', ['He isn’t at home.', 'He wasn’t at home.', 'He weren’t at home.'], ['Wasn’t — was not.']),
    ],
    practice: [
      S('___ Maxim at summer camp?', 'Was', ['Was', 'Were', 'Did'], ['Maxim — это he, значит was.']),
      S('They ___ at the cinema yesterday. (отрицание)', 'weren’t', ['wasn’t', 'weren’t', 'isn’t'], ['They — weren’t.']),
      S('Какой ответ верный? Was she happy? — …', 'No, she wasn’t.', ['No, she isn’t.', 'No, she wasn’t.', 'No, she weren’t.'], ['Отвечаем той же формой was.']),
      S('___ were you in the summer? — At the seaside.', 'Where', ['Where', 'Who', 'When'], ['Спрашиваем про место.']),
      S('Which sentence is a question?', 'Were we late?', ['We were late.', 'Were we late?', 'We weren’t late.'], ['В вопросе were стоит перед we.']),
      adv(S('Составь вопрос: you / were / at camp / ?', 'Were you at camp?', ['You were at camp?', 'Were you at camp?', 'Was you at camp?'], ['Были ли вы в лагере?'])),
      adv(TF('Краткий ответ на вопрос «Were they in the mountains?» может быть «No, they weren’t».', true, ['Были ли они в горах? Нет.'])),
    ],
    bonus: [
      S('Как спросить «Почему ты опоздал?»', 'Why were you late?', ['Why were you late?', 'Why you were late?', 'Why was you late?'], ['Why + were + you.']),
      I('Вставь was или were: ___ the leaders friendly? — Yes, they ___.', 'were', ['Лидеры = they, значит were.'], ['Замени the leaders на they.']),
    ],
    card: ['❓', 'Вопрос наоборот', 'В вопросе с was / were глагол стоит перед подлежащим: He was → Was he? Это правило работает и для am / is / are.'],
  }),
  T(17, 'Unit 1, Lesson 4. There was / There were', {
    cards: [
      'Фразу **there is / there are** («есть, находится») в прошлом меняем на **there was / there were** («был, были, находился»). **There was** + один предмет или неисчисляемое: There **was** a tent on the beach. **There were** + много: There **were** many tourists at the seaside.',
      'Отрицание: **there wasn’t / there weren’t**: There **wasn’t** a storm. There **weren’t** any rocks. Вопрос: **Was there …? Were there …?** — **Was there** a sandcastle? Yes, there was. / No, there wasn’t.',
      'Вопросы с **Wh-**: **What was** there on the beach? **Where were** the tourists? Слова урока: **beach** (пляж), **tourist**, **tent**, **rock** (скала), **sand**, **sandcastle**, **seaweed**, **storm**.',
      'После there was / were рассказываем, что **можно было увидеть**: There was a lot of sand. There were tents and a few rocks. Так удобно описывать фотографию прошлого лета.',
    ],
    example: ['Вставь was или were: «There ___ three tents on the beach».', [
      ['Tents — много предметов (множественное число).', 'Нужно were.'],
      ['There were three tents on the beach.', 'There were + множественное число.'],
      ['Отрицание: There weren’t three tents.', 'Меняем were на weren’t.'],
    ]],
    check: [
      S('There ___ a sandcastle on the beach.', 'was', WB, ['Sandcastle — один предмет, значит was.']),
      S('There ___ many tourists at the seaside.', 'were', WB, ['Tourists — много, значит were.']),
    ],
    practice: [
      S('There ___ a storm last night.', 'was', WB, ['A storm — один.']),
      S('___ there any rocks on the beach?', 'Were', ['Was', 'Were', 'Did'], ['Rocks — много, значит were.']),
      S('There ___ any seaweed. (отрицание)', 'wasn’t', ['wasn’t', 'weren’t', 'isn’t'], ['Seaweed — неисчисляемое, значит wasn’t.']),
      S('Как будет «Был ли там пляж?»', 'Was there a beach?', ['Was there a beach?', 'Were there a beach?', 'Is there a beach?'], ['A beach — один, значит was.']),
      S('What does “tent” mean?', 'палатка', ['палатка', 'пляж', 'шторм', 'скала'], ['Tent — палатка.']),
      adv(S('Where ___ the tourists? — They were at the beach.', 'were', ['was', 'were', 'did'], ['Tourists — много, значит were.'])),
      adv(TF('«There was two tents» — правильное предложение.', false, ['Tents — много: There were two tents.'])),
    ],
    bonus: [
      S('Что значит sand?', 'песок', ['песок', 'скала', 'ракушка', 'водоросли'], ['Sandcastle — замок из песка.']),
      I('Вставь was или were: There ___ a lot of sand.', 'was', ['A lot of sand — неисчисляемое: was.'], ['Песок не считаем штуками.']),
    ],
    card: ['🏖️', 'Пляжные слова', 'Sand — песок, sandcastle — замок из песка, seaweed — водоросли, rock — скала. Это слова из твоего учебника.'],
  }),
  T(18, 'Unit 1, Lesson 5. Past Simple: правильные глаголы (-ed)', {
    cards: [
      'Рассказывая о том, что **случилось**, ставим глагол в **Past Simple**. У **правильных глаголов** добавляем **-ed**: **visit → visited**, **stay → stayed**, **cook → cooked**, **travel → travelled / traveled**. Форма одна для всех лиц: I **visited**, he **visited**, they **visited**.',
      'Правила написания: если глагол оканчивается на **-e**, добавляем только **-d**: **live → lived**, **like → liked**. Если на **согласную + y** — меняем **y на i**: **study → studied**. Если на **гласную + y**, оставляем y: **stay → stayed**.',
      'Окончание **-ed** читается по-разному: **[t]** (watched), **[d]** (stayed, travelled), **[ɪd]** после t и d (visited, wanted). Слова урока: **travel**, **visit**, **stay**, **take photos of**, **cook over a campfire**, **watch birds**, **hotel**.',
      'Пример рассказа: Last summer we **travelled** to the mountains. We **stayed** in a hotel. We **watched** birds and **cooked** over a campfire. Слова **last summer, yesterday, ago** подсказывают, что нужно Past Simple.',
    ],
    example: ['Поставь глагол study в Past Simple.', [
      ['Глагол оканчивается на согласную + y.', 'study — s-t-u-d-y.'],
      ['Меняем y на i и добавляем -ed.', 'study → studied.'],
      ['Yesterday I studied English.', 'Слово yesterday подтверждает Past Simple.'],
    ]],
    check: [
      S('Past Simple от visit — это …', 'visited', ['visit', 'visited', 'visiting', 'visits'], ['Правильный глагол: добавляем -ed.']),
      S('Past Simple от live — это …', 'lived', ['liveed', 'lived', 'lives'], ['После -e добавляем только -d.']),
    ],
    practice: [
      S('Last summer we ___ in a hotel. (stay)', 'stayed', ['stay', 'stayed', 'stayd'], ['После гласной + y оставляем y.']),
      S('Они вчера ___ птиц. (watch)', 'watched', ['watch', 'watched', 'watchd'], ['Правильный глагол: добавляем -ed.']),
      S('I ___ English yesterday. (study)', 'studied', ['studyed', 'studied', 'studys'], ['Согласная + y → ied.']),
      S('We ___ over a campfire. (cook)', 'cooked', ['cooked', 'cook', 'cooking'], ['Добавляем -ed.']),
      S('Она путешествовала в горы. She ___ to the mountains.', 'travelled', ['travels', 'travelled', 'travel'], ['Прошедшее время.']),
      adv(S('В каком слове окончание -ed читается [ɪd]?', 'visited', ['watched', 'visited', 'stayed'], ['После t и d окончание -ed читается [ɪd].'])),
      adv(TF('У правильных глаголов в Past Simple форма разная для he и they.', false, ['Форма одна для всех лиц: visited.'])),
    ],
    bonus: [
      S('Выбери слово, которое подсказывает Past Simple.', 'yesterday', ['now', 'yesterday', 'tomorrow', 'always'], ['Yesterday — вчера.']),
      I('Напиши Past Simple глагола like.', 'liked', ['После -e добавляем -d.'], ['like → like + d.']),
    ],
    card: ['🏕️', 'Рассказ о лете', 'Чтобы рассказать о лете, используй глаголы с -ed: visited, stayed, cooked, watched. Получится настоящий рассказ.'],
  }),
  T(19, 'Unit 1, Lessons 6–7. Неправильные глаголы (Irregular verbs)', {
    cards: [
      'У **неправильных глаголов** вторая форма (**V2**) не заканчивается на -ed — её надо **запомнить**: **go → went**, **see → saw**, **eat → ate**, **have → had**, **take → took**, **make → made**, **swim → swam**, **ride → rode**, **write → wrote**, **read → read** (читается [red]).',
      'Ещё из учебника: **buy → bought**, **catch → caught**, **come → came**, **do → did**, **drink → drank**, **fall → fell**, **feed → fed**, **find → found**, **fly → flew**, **get → got**, **give → gave**, **hear → heard**, **know → knew**, **leave → left**, **run → ran**, **say → said**, **sing → sang**, **sleep → slept**, **spend → spent**, **think → thought**, **wear → wore**, **win → won**.',
      'Предложения: Last summer we **went** to the seaside. I **swam** in the sea. Sasha **caught** a big fish. We **ate** berries and **picked** mushrooms (pick — правильный). Мы используем V2 и в рассказе дня: In the morning I **got** up, then I **had** breakfast.',
      'Фразы урока: **go sunbathing** (загорать), **go hiking** (ходить в поход), **go swimming** (идти купаться), **go for a picnic** (идти на пикник). Прошедшее: **went** sunbathing, **went** hiking, **went** swimming, **went** for a picnic. Слова: **berries**, **flowers**, **mushrooms**, **river**, **woods**.',
    ],
    example: ['Расскажи о вчерашнем дне, используя V2.', [
      ['Выбираем глаголы: get up, have breakfast, go to school.', 'Все они неправильные.'],
      ['V2: got up, had breakfast, went to school.', 'Берём формы из списка.'],
      ['Yesterday I got up at 7, had breakfast, and went to school.', 'Связный рассказ в прошлом.'],
    ]],
    check: [
      S('Past Simple от go — это …', 'went', ['goed', 'went', 'gone', 'goes'], ['Go → went.']),
      S('Past Simple от eat — это …', 'ate', ['eated', 'ate', 'eaten', 'eats'], ['Eat → ate.']),
    ],
    practice: [
      S('Past Simple от see.', 'saw', ['seed', 'saw', 'seen'], ['See → saw.']),
      S('Past Simple от have.', 'had', ['haved', 'had', 'has'], ['Have → had.']),
      S('Last summer we ___ to the Berezina River. (go)', 'went', ['go', 'went', 'goed'], ['Go → went.']),
      S('Sasha ___ a big fish. (catch)', 'caught', ['catched', 'caught', 'catch'], ['Catch → caught.']),
      S('We ___ in the lake. (swim)', 'swam', ['swimmed', 'swam', 'swum'], ['Swim → swam.']),
      S('Что значит go sunbathing?', 'загорать', ['загорать', 'плавать', 'ходить в поход', 'собирать грибы'], ['Sunbathing — принимать солнечные ванны.']),
      adv(S('Past Simple от write.', 'wrote', ['writed', 'wrote', 'written'], ['Write → wrote.'])),
      adv(TF('Past Simple от read пишется так же, как инфинитив: read.', true, ['Пишется read, но читается [red].'])),
    ],
    bonus: [
      I('Напиши Past Simple глагола buy.', 'bought', ['Buy → bought.'], ['Оканчивается на -ught.']),
      S('Past Simple от think.', 'thought', ['thinked', 'thought', 'thunk'], ['Think → thought.']),
    ],
    card: ['🧠', 'Неправильные глаголы', 'Неправильные глаголы нужно запоминать по одному. Самые частые: go – went, have – had, see – saw, make – made.'],
  }),
  T(20, 'Unit 1, Lesson 8. Past Simple: отрицание и вопросы', {
    cards: [
      'Для отрицания и вопросов в Past Simple нужен помощник **did**. Отрицание: **did not (didn’t) + глагол в начальной форме**: I **didn’t go** to the seaside. She **didn’t have** a bike. Глагол после didn’t остаётся **без -ed** и без V2!',
      'Вопрос: **Did + подлежащее + глагол?** **Did you go** fishing? **Did she visit** a museum? Короткие ответы: **Yes, I did. / No, I didn’t.** Помощник **did** один для всех лиц.',
      'Вопросительные слова: **What did you do** last summer? **Where did they go**? **When did he visit** the farm? Порядок: вопросительное слово + did + подлежащее + глагол. Сам глагол — в начальной форме.',
      'Сравни: He **went** to the lake. → He **didn’t go** to the lake. → **Did** he **go** to the lake? Во втором и третьем предложениях V2 исчезает, потому что прошедшее время показывает **did**.',
    ],
    example: ['Поставь предложение в отрицание: «We went to the beach».', [
      ['Вставляем didn’t и меняем went на go.', 'Went — это V2, после didn’t нужна начальная форма.'],
      ['We didn’t go to the beach.', 'Отрицание готово.'],
      ['Вопрос: Did we go to the beach? — No, we didn’t.', 'Did — в начале.'],
    ]],
    check: [
      S('She ___ visit a museum. (отрицание)', 'didn’t', ['don’t', 'didn’t', 'doesn’t'], ['В прошедшем времени помощник — did.']),
      S('___ you go fishing last summer?', 'Did', DID.map((x) => x[0].toUpperCase() + x.slice(1)), ['Вопрос в прошедшем времени начинаем с Did.']),
    ],
    practice: [
      S('I didn’t ___ to school yesterday.', 'go', ['go', 'went', 'goes'], ['После didn’t — начальная форма.']),
      S('Did he ___ a fish? (catch)', 'catch', ['catch', 'caught', 'catches'], ['После did — начальная форма.']),
      S('Выбери верное предложение.', 'We didn’t see any storms.', ['We didn’t saw any storms.', 'We didn’t see any storms.', 'We not saw any storms.'], ['После didn’t — see.']),
      S('Где вопрос? ', 'Did you ride a horse?', ['You rode a horse?', 'Did you ride a horse?', 'Did you rode a horse?'], ['Did + you + ride.']),
      S('What did you do last summer? — I ___ to the seaside.', 'went', ['go', 'went', 'goed'], ['Отвечаем в прошедшем: went.']),
      adv(S('Как правильно ответить на вопрос «Did she have a fun summer?» (да)?', 'Yes, she did.', ['Yes, she has.', 'Yes, she did.', 'Yes, she had.'], ['Отвечаем с did.'])),
      adv(TF('Предложение «Did you went to the lake?» правильное.', false, ['После did: Did you go to the lake?'])),
    ],
    bonus: [
      S('Составь вопрос: you / what / did / do ?', 'What did you do?', ['What did you do?', 'What you did do?', 'What do you did?'], ['What + did + you + do.']),
      I('Вставь didn’t: They ___ eat mushrooms.', 'didn’t', ['Отрицание в Past Simple.'], ['Did not = didn’t.']),
    ],
    card: ['🔁', 'Did — главный помощник', 'Как только появился did или didn’t, глагол возвращается в начальную форму. Запомни: V2 только в утверждении.'],
  }),
  T(21, 'Unit 1. Словарь лета (In Summer)', {
    cards: [
      'Места и природа: **seaside** (побережье), **beach** (пляж), **lake** (озеро), **river** (река), **mountain** (гора), **woods** (лес), **country** (местность за городом), **sand** (песок), **rock** (скала), **storm** (шторм), **seaweed** (водоросли).',
      'Занятия: **go hiking**, **go sunbathing**, **go swimming**, **go for a picnic**, **cook over a campfire**, **watch birds**, **take photos (of)**, **have fun** (веселиться), **pick** (собирать), **travel**, **visit**, **stay**.',
      'Что берём или находим: **tent** (палатка), **hotel** (гостиница), **camp** (лагерь), **berries** (ягоды), **flowers** (цветы), **mushrooms** (грибы), **sandcastle** (замок из песка). Люди: **tourist**.',
      'Слова-помощники: **yesterday**, **last**, **ago**, **abroad** (за границей), **after**, **fall** (падать), **buy**, **say**, **spend** (проводить время), **understand**. Полный список слов юнита можно потренировать в разделе «Слова».',
    ],
    example: ['Составь рассказ из 3 предложений о лете.', [
      ['Выбираем место: Last summer we were at the seaside.', 'Was / were — о месте.'],
      ['Добавляем занятия: We went swimming and built a sandcastle.', 'Went и built — неправильные глаголы.'],
      ['Заканчиваем: We had fun!', 'Have fun — веселиться.'],
    ]],
    check: [
      S('Что значит mushroom?', 'гриб', ['гриб', 'ягода', 'цветок', 'река'], ['Mushrooms — грибы.']),
      S('Как будет «палатка»?', 'tent', ['tent', 'hotel', 'camp', 'beach'], ['Tent — палатка.']),
    ],
    practice: [
      S('Что значит go hiking?', 'ходить в поход', ['ходить в поход', 'загорать', 'плавать', 'ходить на пикник'], ['Hiking — пешие походы.']),
      S('Как будет «ягода»?', 'berry', ['berry', 'flower', 'rock', 'storm'], ['Berries — ягоды.']),
      S('Как будет «озеро»?', 'lake', ['lake', 'river', 'beach', 'woods'], ['Lake — озеро.']),
      S('Что значит have fun?', 'веселиться', ['веселиться', 'отдыхать на пляже', 'падать', 'путешествовать'], ['Fun — веселье.']),
      S('Что значит abroad?', 'за границей', ['за границей', 'в лесу', 'у моря', 'дома'], ['I was abroad — я был за границей.']),
      adv(S('Как будет «наблюдать за птицами»?', 'watch birds', ['watch birds', 'pick berries', 'take photos', 'cook over a campfire'], ['Watch — наблюдать.'])),
      adv(S('Как будет «турист»?', 'tourist', ['tourist', 'tent', 'hotel', 'sand'], ['Tourist — путешественник.'])),
    ],
    bonus: [
      S('Что значит spend (a summer)?', 'проводить время', ['проводить время', 'путешествовать', 'терять', 'понимать'], ['Spend — тратить, проводить.']),
      TF('Seaweed — это «водоросли».', true, ['Seaweed лежит на берегу моря.']),
    ],
    card: ['☀️', 'Летний словарь', 'Слова юнита «In Summer» помогут рассказать о каникулах. Потренируй их в разделе «Слова».'],
  }),
];
