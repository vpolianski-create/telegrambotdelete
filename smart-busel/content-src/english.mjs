import { T, S, TF, I, adv, buildSubject } from './lib.mjs';
import { engU1 } from './parts/eng-u1.mjs';
import { engU2 } from './parts/eng-u2.mjs';
import { engU3 } from './parts/eng-u3.mjs';
import { engU4 } from './parts/eng-u4.mjs';
import { engU5 } from './parts/eng-u5.mjs';

const AIA = ['am', 'is', 'are'];

const oldSections = [
  ['Грамматика: основы', [
    T(1, 'Глагол to be (am, is, are)', {
      cards: [
        'Глагол **to be** («быть») самый частый в английском. В настоящем времени он имеет три формы: **am**, **is**, **are**. Выбор зависит от того, о ком мы говорим.',
        '**I am** (я есть, я…), **he / she / it is**, **we / you / they are**. Например: I am a pupil. She is my sister. They are at school.',
        'В русском языке мы пропускаем «есть»: «Я ученик». В английском предложение **без глагола не бывает**: I **am** a pupil. Короткие формы: I’m, he’s, she’s, we’re, they’re.',
        'Вопрос: глагол ставим **вперёд**: **Are** you ready? Is he at home? Отрицание: добавляем **not**: She **is not** (isn’t) tired. Краткие ответы: Yes, I am. / No, he isn’t.',
      ],
      example: ['Вставим am, is или are: «My friends ___ funny».', [
        ['Кто «мои друзья»? Это несколько человек, как «they».', 'Форма глагола зависит от подлежащего.'],
        ['С they используем are.', 'We, you, they — are.'],
        ['Ответ: My friends are funny.', 'Читаем получившееся предложение: оно звучит правильно.'],
      ]],
      check: [
        S('I ___ eleven.', 'am', AIA, ['С местоимением I всегда am.']),
        S('She ___ my friend.', 'is', AIA, ['С he, she, it используем is.']),
      ],
      practice: [
        S('We ___ friends.', 'are', AIA, ['We — это are.']),
        S('He ___ a doctor.', 'is', AIA, ['He — это is.']),
        S('They ___ at school.', 'are', AIA, ['They — это are.']),
        S('It ___ a big dog.', 'is', AIA, ['It — это is.']),
        S('You ___ very kind.', 'are', AIA, ['You — это are.']),
        S('Как правильно задать вопрос?', 'Are you from Belarus?', ['You are from Belarus?', 'Are you from Belarus?', 'Is you from Belarus?'], ['В вопросе to be ставим перед подлежащим.', 'С you используем are.']),
        adv(I('Вставь нужную форму: My brother ___ tall.', 'is', ['My brother — это «он» (he), значит, is.'], ['Замени «my brother» на he.'])),
        adv(TF('Предложение «He are my brother» правильное.', false, ['С he нужно is: He is my brother.'])),
        adv(S('Выбери верное отрицание: «Мы не дома».', 'We are not at home.', ['We is not at home.', 'We are not at home.', 'We am not at home.'], ['С we используем are, а not ставим после глагола.'])),
      ],
      bonus: [
        I('Вставь am, is или are: My parents ___ at work.', 'are', ['My parents — это «они» (they), значит, are.'], ['Замени «my parents» на they.']),
        S('Выбери верный краткий ответ на вопрос «Is she a teacher?» (да).', 'Yes, she is.', ['Yes, she am.', 'Yes, she is.', 'Yes, she are.'], ['Отвечаем с тем же глаголом: Yes, she is.']),
      ],
      card: ['🗣️', 'Самый частый глагол', 'Глагол to be — один из самых частых в английском: им пользуются в каждой минуте разговора.'],
    }),
    T(2, 'have got / has got', {
      cards: [
        '**have got** означает «иметь, у меня есть». Мы говорим: **I have got** a dog. С he, she, it — **has got**: She **has got** a cat.',
        '**I, you, we, they** → **have got**. **He, she, it** → **has got**. Короткие формы: I’ve got, she’s got, they’ve got.',
        'Отрицание: **haven’t got** / **hasn’t got**: I haven’t got a brother. He hasn’t got a bike.',
        'Вопрос: **Have you got…? Has she got…?** Короткие ответы: Yes, I have. / No, I haven’t. Yes, she has. / No, she hasn’t.',
      ],
      example: ['Составим предложение: «У Тома есть велосипед».', [
        ['Подлежащее: Tom, это «он», he.', 'Для he используем has got.'],
        ['Tom has got a bike.', 'Глагол has got ставим после подлежащего.'],
        ['Вопрос: Has Tom got a bike? Ответ: Yes, he has.', 'Для вопроса has идёт вперёд.'],
      ]],
      check: [
        S('I ___ got a sister.', 'have', ['have', 'has', 'am'], ['С I используем have got.']),
        S('She ___ got a dog.', 'has', ['have', 'has', 'is'], ['С she используем has got.']),
      ],
      practice: [
        S('They ___ got a big house.', 'have', ['have', 'has', 'are'], ['They — have got.']),
        S('My brother ___ got a bike.', 'has', ['have', 'has', 'is'], ['My brother — это he, значит, has got.']),
        S('We ___ got a car. (отрицание, короткая форма)', 'haven’t', ['hasn’t', 'haven’t', 'isn’t'], ['С we: haven’t got.']),
        S('Как правильно задать вопрос?', 'Has she got a cat?', ['Have she got a cat?', 'Has she got a cat?', 'Does she got a cat?'], ['С she — Has she got…?']),
        TF('Предложение «He have got a ball» правильное.', false, ['С he нужно has: He has got a ball.']),
        S('Выбери краткий ответ: «Have you got a pen?» (нет)', 'No, I haven’t.', ['No, I haven’t.', 'No, I hasn’t.', 'No, I am not.'], ['Отвечаем с have.']),
        adv(I('Вставь have или has: Our teacher ___ got a new car.', 'has', ['Our teacher — это she/he, значит, has got.'], ['Замени teacher на she/he.'])),
        adv(S('Кому подходит «has got»?', 'he, she, it', ['I, you', 'we, they', 'he, she, it', 'все'], ['С he, she, it используем has got.'])),
      ],
      bonus: [
        I('Вставь have или has: My friends ___ got a dog.', 'have', ['My friends — это they, значит, have got.'], ['Замени friends на they.']),
        TF('«I’ve got» — это краткая форма «I have got».', true, ['Так говорят чаще всего.']),
      ],
      card: ['🐕', 'Кто у кого есть', 'Конструкцией have got англичане говорят о том, что у них есть: от питомцев и друзей до идей.'],
    }),
    T(3, 'Артикли a / an / the', {
      cards: [
        'В английском перед существительным часто стоит **артикль**. **a / an** — неопределённый артикль («какой-то, один»). **the** — определённый («этот самый»).',
        '**a** ставят перед согласным звуком: a book, a dog, a pupil. **an** — перед гласным звуком: an apple, an egg, an orange. Важно правильно слушать звук: an hour (h не произносится), a university (начинается на «ю»).',
        '**the** используем, когда ясно, о чём речь: The cat is on the sofa (мы знаем, какая кошка), когда предмет единственный: the sun, the moon, the Earth, или когда упоминали его раньше: I have a dog. The dog is big.',
        'Артикля нет: перед **именами** (Tom), перед **множественным числом в общем смысле** (I like cats), перед названиями **языков, дней и месяцев**, перед большинством названий стран (Belarus).',
      ],
      example: ['Выберем артикль: «I have ___ apple and ___ banana».', [
        ['Apple начинается с гласного звука, значит, an.', 'Перед гласным — an.'],
        ['Banana начинается с согласного, значит, a.', 'Перед согласным — a.'],
        ['Ответ: I have an apple and a banana.', 'Проверяем звук, а не букву.'],
      ]],
      check: [
        S('I have ___ egg.', 'an', ['a', 'an', 'the'], ['Egg начинается с гласного звука.']),
        S('She is ___ pupil.', 'a', ['a', 'an', 'the'], ['Pupil начинается с согласного звука.']),
      ],
      practice: [
        S('He has ___ orange.', 'an', ['a', 'an', 'the'], ['Orange начинается с гласного.']),
        S('___ sun is hot.', 'The', ['A', 'An', 'The'], ['Солнце одно, поэтому the.']),
        S('I have a dog. ___ dog is big.', 'The', ['A', 'An', 'The'], ['Мы уже упоминали собаку.']),
        S('It is ___ hour.', 'an', ['a', 'an', 'the'], ['В слове hour первая буква не читается, звук гласный.']),
        TF('Перед именем Tom нужен артикль the.', false, ['Перед именами артикль не ставят.']),
        S('Как правильно: «Я люблю кошек» в общем смысле?', 'I like cats.', ['I like the cats.', 'I like cats.', 'I like a cats.'], ['Во множественном числе в общем смысле артикль не нужен.']),
        adv(S('Выбери верное: «Это университет».', 'It is a university.', ['It is an university.', 'It is a university.', 'It is the university only.'], ['University начинается на «ю», то есть на согласный звук.'])),
        adv(S('Выбери верное: «Луна светит ярко».', 'The moon is bright.', ['A moon is bright.', 'The moon is bright.', 'Moon is bright.'], ['Луна одна, поэтому the.'])),
      ],
      bonus: [
        I('Вставь a, an или the: Look at ___ blue sky!', 'the', ['Небо одно, значит, the.'], ['Небо одно для всех.']),
        TF('Перед словом apple нужно писать a.', false, ['Перед apple нужен an.']),
      ],
      card: ['🅰️', 'Маленькое слово', 'Артикли a, an и the — самые частые слова английского языка. Их учат всю жизнь, и это нормально.'],
    }),
    T(4, 'Множественное число существительных', {
      cards: [
        'Чтобы получить **множественное число**, к слову обычно добавляют **-s**: book → books, dog → dogs, pen → pens.',
        'Если слово оканчивается на **s, x, ch, sh, o**, добавляем **-es**: bus → buses, box → boxes, watch → watches, brush → brushes, tomato → tomatoes. Исключение: photo → photos.',
        'Если слово оканчивается на **согласную + y**, то **y** меняется на **ies**: city → cities, baby → babies. Но если перед y гласная, то просто -s: boy → boys, day → days. Слова на -f/-fe: knife → knives, wolf → wolves, leaf → leaves.',
        '**Исключения**: man → men, woman → women, child → children, foot → feet, tooth → teeth, mouse → mice. А слова sheep и fish не изменяются: one sheep, two sheep.',
      ],
      example: ['Образуем множественное число слов: box, city, child.', [
        ['Box оканчивается на x, добавляем -es: boxes.', 'После s, x, ch, sh, o обычно -es.'],
        ['City оканчивается на согласную + y: меняем y на ies: cities.', 'Перед y стоит согласная t.'],
        ['Child — исключение: children.', 'Такие слова нужно запомнить.'],
      ]],
      check: [
        S('Множественное число слова book:', 'books', ['bookes', 'books', 'bookies'], ['Добавляем -s.']),
        S('Множественное число слова box:', 'boxes', ['boxs', 'boxes', 'boxies'], ['После x добавляем -es.']),
      ],
      practice: [
        S('Множественное число слова city:', 'cities', ['citys', 'cities', 'cityes'], ['Согласная + y → ies.']),
        S('Множественное число слова boy:', 'boys', ['boies', 'boys', 'boyes'], ['Перед y гласная, поэтому просто -s.']),
        S('Множественное число слова child:', 'children', ['childs', 'children', 'childes'], ['Это исключение.']),
        S('Множественное число слова man:', 'men', ['mans', 'men', 'mens'], ['Исключение.']),
        S('Множественное число слова tooth:', 'teeth', ['tooths', 'teeth', 'toothes'], ['Исключение.']),
        TF('Слово sheep во множественном числе не меняется.', true, ['One sheep, two sheep.']),
        adv(I('Напиши множественное число слова watch.', 'watches', ['Watch оканчивается на ch, добавляем -es.'], ['После ch добавляем -es.'])),
        adv(I('Напиши множественное число слова baby.', 'babies', ['Согласная + y → ies.'], ['y меняем на ies.'])),
        adv(S('Множественное число слова knife:', 'knives', ['knifes', 'knives', 'knifs'], ['f/fe → ves.'])),
      ],
      bonus: [
        I('Напиши множественное число слова mouse.', 'mice', ['Исключение: mouse → mice.'], ['Это исключение.']),
        TF('Слово foot во множественном числе: foots.', false, ['Правильно: feet.']),
      ],
      card: ['🐭', 'Мышь и мыши', 'Mouse во множественном числе — mice. Таких «неправильных» слов в английском немного, и их стоит запомнить.'],
    }),
    T(5, 'There is / There are', {
      cards: [
        '**There is** (there’s) означает «есть, имеется» для **одного** предмета: There is a book on the table. **There are** — для **нескольких**: There are two books on the table.',
        'Для **неисчисляемых** слов (water, milk, bread) тоже используем **there is**: There is some milk in the glass.',
        'Отрицание: **There isn’t** a cat in the room. **There aren’t** any pens in my bag. Вместо some в отрицании и вопросе используем **any**.',
        'Вопрос: **Is there** a cat in the room? **Are there** any pens in your bag? Ответы: Yes, there is. / No, there isn’t. Yes, there are. / No, there aren’t.',
      ],
      example: ['Выберем: «___ three apples on the plate».', [
        ['Apples — это много предметов, значит, множественное число.', 'Три яблока — несколько.'],
        ['Используем there are.', 'There are + множественное число.'],
        ['Ответ: There are three apples on the plate.', 'Проверяем число.'],
      ]],
      check: [
        S('There ___ a book on the table.', 'is', ['is', 'are', 'am'], ['A book — один предмет.']),
        S('There ___ two cats in the garden.', 'are', ['is', 'are', 'am'], ['Two cats — несколько.']),
      ],
      practice: [
        S('There ___ some milk in the glass.', 'is', ['is', 'are', 'am'], ['Milk — неисчисляемое слово.']),
        S('___ there a park near your house?', 'Is', ['Are', 'Is', 'Do'], ['Park — один предмет.']),
        S('___ there any pens in your bag?', 'Are', ['Is', 'Are', 'Do'], ['Pens — множественное число.']),
        S('Выбери верное отрицание: «В комнате нет кошки».', 'There isn’t a cat in the room.', ['There aren’t a cat in the room.', 'There isn’t a cat in the room.', 'There not a cat in the room.'], ['A cat — один предмет, значит, isn’t.']),
        TF('Предложение «There is two books» правильное.', false, ['Нужно: There are two books.']),
        S('Выбери краткий ответ: «Is there a lamp in the room?» (да)', 'Yes, there is.', ['Yes, there is.', 'Yes, there are.', 'Yes, it is.'], ['Отвечаем с there is.']),
        adv(I('Вставь is или are: There ___ a lot of children in the yard.', 'are', ['A lot of children — множественное число.'], ['Children — это множественное число.'])),
        adv(S('Какое слово используют в отрицательных предложениях и вопросах вместо some?', 'any', ['a', 'any', 'the', 'many'], ['В вопросах и отрицаниях — any.'])),
      ],
      bonus: [
        I('Вставь is или are: There ___ water in the bottle.', 'is', ['Water — неисчисляемое, значит, is.'], ['Water нельзя посчитать на штуки.']),
        TF('Вопрос «Are there any apples?» построен правильно.', true, ['Apples — множественное число, any — в вопросе.']),
      ],
      card: ['🏠', 'Что у нас есть', 'Конструкция there is / there are нужна, чтобы описать комнату, город или картинку: что и где находится.'],
    }),
    T(6, 'Притяжательные местоимения и ’s', {
      cards: [
        'Чтобы показать, кому что принадлежит, используем **притяжательные местоимения**: **my** (мой), **your** (твой, ваш), **his** (его), **her** (её), **its** (его, её — для предмета), **our** (наш), **their** (их).',
        'Они стоят **перед существительным**: my book, her bag, our school. Не путай **its** (притяжательное) и **it’s** (= it is).',
        'Для людей и животных используем **’s**: Tom’s book (книга Тома), my mother’s car (машина моей мамы). Если слово во множественном числе оканчивается на s, ставим только апостроф: the boys’ room (комната мальчиков).',
        'Выбирая местоимение, думай, **кому** принадлежит: Anna and her brother. Tom and his dog. The dog and its bone.',
      ],
      example: ['Выберем слово: «This is Mary. ___ bag is red».', [
        ['Mary — девочка, значит, нужно «её».', 'Выбираем по тому, кто владелец.'],
        ['Её — her.', 'Для женского рода — her.'],
        ['Ответ: Her bag is red.', 'Her стоит перед существительным.'],
      ]],
      check: [
        S('This is Tom. ___ bike is new.', 'His', ['His', 'Her', 'Its'], ['Tom — мальчик, значит, his.']),
        S('We love ___ school.', 'our', ['my', 'our', 'their'], ['We → our.']),
      ],
      practice: [
        S('Anna has a cat. ___ cat is white.', 'Her', ['His', 'Her', 'Their'], ['Anna — девочка, значит, her.']),
        S('They have a house. ___ house is big.', 'Their', ['Our', 'Their', 'His'], ['They → their.']),
        S('Выбери верное: «книга Тома».', 'Tom’s book', ['Tom book’s', 'Tom’s book', 'Toms’ book'], ['Для людей добавляем ’s.']),
        S('Выбери верное: «Это моя сестра».', 'This is my sister.', ['This is I sister.', 'This is my sister.', 'This is me sister.'], ['My стоит перед существительным.']),
        TF('Her bag — это «его сумка».', false, ['Her значит «её».']),
        S('The dog has a bone. ___ bone is big.', 'Its', ['Its', 'It’s', 'His'], ['Its — притяжательное для животных и предметов.']),
        adv(S('Выбери верное: «комната мальчиков» (много мальчиков).', 'the boys’ room', ['the boy’s room', 'the boys’ room', 'the boys room’s'], ['Во множественном числе на -s — апостроф после s.'])),
        adv(I('Вставь слово: I love ___ mother. (my / your)', 'my', ['I → my.'], ['Я → мой.'])),
      ],
      bonus: [
        S('Вставь слово: You have a bag. ___ bag is blue.', 'Your', ['My', 'Your', 'His'], ['You → your.']),
        TF('Its и it’s — это одно и то же.', false, ['Its — притяжательное, it’s = it is.']),
      ],
      card: ['👜', 'Чьё это?', 'Притяжательные местоимения помогают сказать, чьё что: my bag, his book, our school. Без них не обойтись.'],
    }),
  ]],
  ['Грамматика: глаголы и вопросы', [
    T(7, 'Present Simple (утверждение)', {
      cards: [
        '**Present Simple** используем для **привычек**, **расписаний** и **фактов**: I go to school every day. The sun rises in the east.',
        'С **I, you, we, they** глагол остаётся без изменений: I play, they live. С **he, she, it** к глаголу добавляем **-s**: he plays, she lives.',
        'Если глагол оканчивается на **s, sh, ch, x, o**, добавляем **-es**: go → goes, watch → watches, wash → washes. Если на **согласную + y**, то y → ies: study → studies (но play → plays).',
        'Частые слова-подсказки: **always** (всегда), **usually** (обычно), **often** (часто), **sometimes** (иногда), **never** (никогда), **every day** (каждый день). Они стоят перед глаголом: She often reads.',
      ],
      example: ['Составим предложение: «Она читает книги каждый день».', [
        ['Подлежащее she. Глагол read.', 'Present Simple — привычка.'],
        ['С she добавляем -s: reads.', 'С he, she, it нужно -s.'],
        ['She reads books every day.', 'Время (every day) можно ставить в конце.'],
      ]],
      check: [
        S('He ___ football every Sunday.', 'plays', ['play', 'plays', 'playing'], ['С he — plays.']),
        S('They ___ English at school.', 'study', ['study', 'studies', 'studying'], ['С they — без -s.']),
      ],
      practice: [
        S('She ___ to school by bus.', 'goes', ['go', 'goes', 'going'], ['go → goes.']),
        S('My mother ___ in a hospital.', 'works', ['work', 'works', 'working'], ['С mother (she) — works.']),
        S('We ___ up at 7 o’clock.', 'get', ['get', 'gets', 'getting'], ['С we — без -s.']),
        S('Tom ___ his homework after lunch.', 'does', ['do', 'does', 'doing'], ['С Tom (he) — does.']),
        TF('Предложение «She watch TV» правильное.', false, ['Правильно: She watches TV.']),
        S('Где поставить слово often? «She ___ reads ___.»', 'She often reads.', ['She reads often.', 'She often reads.', 'Often she reads.'], ['Often стоит перед глаголом.']),
        adv(I('Напиши форму глагола study с he: He ___ English.', 'studies', ['Согласная + y → ies.'], ['y меняем на ies.'])),
        adv(I('Напиши форму глагола watch с she: She ___ cartoons.', 'watches', ['После ch добавляем -es.'], ['После ch -es.'])),
        adv(S('Какое слово подходит к Present Simple?', 'every day', ['now', 'at the moment', 'every day', 'yesterday'], ['Every day — привычка.'])),
      ],
      bonus: [
        I('Вставь глагол: The sun ___ (rise) in the east.', 'rises', ['С sun (it) добавляем -s.'], ['С it нужно -s.']),
        TF('С you в Present Simple глагол получает -s.', false, ['С you — без -s.']),
      ],
      card: ['⏰', 'Привычки', 'Present Simple рассказывает о привычках: что мы делаем всегда, часто или никогда.'],
    }),
    T(8, 'Present Simple: отрицание и вопросы', {
      cards: [
        'Чтобы сделать **отрицание**, используем **don’t** (do not) с I, you, we, they и **doesn’t** (does not) с he, she, it. После них глагол стоит **без -s**: I don’t like milk. She doesn’t like milk.',
        'Чтобы задать **вопрос**, ставим **Do** или **Does** в начало: **Do** you like pizza? **Does** he play chess? После does глагол тоже без -s.',
        'Краткие ответы: Yes, I do. / No, I don’t. Yes, she does. / No, she doesn’t. Не повторяем глагол: Yes, she does (а не Yes, she likes).',
        'Вопросы с вопросительными словами: **Where do you live? What does she do? When does the lesson start?** Вопросительное слово ставим перед do/does.',
      ],
      example: ['Сделаем отрицание: «He plays tennis».', [
        ['Подлежащее he, значит, нужно doesn’t.', 'С he, she, it — doesn’t.'],
        ['После doesn’t глагол без -s: play.', '-s уже «ушло» в does.'],
        ['Ответ: He doesn’t play tennis.', 'Проверяем: нет ни -s, ни другого времени.'],
      ]],
      check: [
        S('I ___ like carrots.', 'don’t', ['don’t', 'doesn’t', 'isn’t'], ['С I — don’t.']),
        S('She ___ like carrots.', 'doesn’t', ['don’t', 'doesn’t', 'isn’t'], ['С she — doesn’t.']),
      ],
      practice: [
        S('___ you play chess?', 'Do', ['Does', 'Do', 'Are'], ['С you — Do.']),
        S('___ your brother play chess?', 'Does', ['Do', 'Does', 'Is'], ['С brother (he) — Does.']),
        S('He doesn’t ___ milk.', 'like', ['likes', 'like', 'liking'], ['После doesn’t глагол без -s.']),
        S('Выбери верный краткий ответ: «Does she live in Minsk?» (да)', 'Yes, she does.', ['Yes, she lives.', 'Yes, she does.', 'Yes, she do.'], ['Отвечаем с does.']),
        TF('Предложение «She doesn’t likes tea» правильное.', false, ['После doesn’t нужен глагол без -s: She doesn’t like tea.']),
        S('Выбери верный вопрос: «Где ты живёшь?»', 'Where do you live?', ['Where you live?', 'Where do you live?', 'Where are you live?'], ['Вопросительное слово + do + подлежащее.']),
        adv(I('Вставь do или does: ___ they go to school by bus?', 'Do', ['С they — Do.'], ['С they используем do.'])),
        adv(S('Выбери верное: «Мама не работает в субботу».', 'My mother doesn’t work on Saturday.', ['My mother don’t work on Saturday.', 'My mother doesn’t works on Saturday.', 'My mother doesn’t work on Saturday.'], ['Doesn’t + глагол без -s.'])),
      ],
      bonus: [
        I('Вставь don’t или doesn’t: My friends ___ play football.', 'don’t', ['My friends — they, значит, don’t.'], ['Friends — это они.']),
        TF('После do или does глагол всегда стоит без -s.', true, ['Это главное правило.']),
      ],
      card: ['❓', 'Do и does', 'Do и does — маленькие помощники, которые строят вопросы и отрицания в Present Simple.'],
    }),
    T(9, 'Can / can’t', {
      cards: [
        '**Can** значит «мочь, уметь»: I can swim. (Я умею плавать.) Can также используют для разрешения: Can I go out? (Можно мне выйти?)',
        'С **can** глагол стоит **без to и без -s**: She can sing. He can play the guitar. Для всех лиц форма одна: I can, he can, they can.',
        'Отрицание: **can’t** (cannot): I can’t swim. Вопрос: **Can** you swim? Короткие ответы: Yes, I can. / No, I can’t.',
        'Просьбы и предложения: **Can you help me?** (Ты можешь мне помочь?) **Can I have some water?** (Можно мне воды?) **Can** — вежливое и короткое слово.',
      ],
      example: ['Скажем, что Анна умеет петь, но не умеет плавать.', [
        ['Anna can sing.', 'Can + глагол без to и без -s.'],
        ['Anna can’t swim.', 'Отрицание — can’t.'],
        ['Вопрос: Can Anna sing? — Yes, she can.', 'Can идёт вперёд.'],
      ]],
      check: [
        S('He ___ play the guitar.', 'can', ['can', 'cans', 'is can'], ['Can не меняется.']),
        S('Как будет «Я не умею плавать»?', 'I can’t swim.', ['I can’t swim.', 'I don’t can swim.', 'I not can swim.'], ['Can’t + глагол.']),
      ],
      practice: [
        S('___ you speak English?', 'Can', ['Do', 'Can', 'Are'], ['Can you…?']),
        S('She can ___ very well.', 'dance', ['dance', 'dances', 'dancing'], ['После can глагол без -s.']),
        S('Выбери краткий ответ: «Can he swim?» (нет)', 'No, he can’t.', ['No, he can’t.', 'No, he doesn’t.', 'No, he isn’t.'], ['Отвечаем с can.']),
        TF('Предложение «She cans sing» правильное.', false, ['Can не принимает -s: She can sing.']),
        S('Как вежливо попросить воды?', 'Can I have some water?', ['Can I have some water?', 'I can have water?', 'Do I can water?'], ['Can I have…?']),
        S('Какое слово означает «умею, могу»?', 'can', ['must', 'can', 'will', 'am'], ['Can — мочь, уметь.']),
        adv(I('Вставь can или can’t: A fish ___ fly. (рыба не умеет летать)', 'can’t', ['Рыбы не летают.'], ['Отрицание — can’t.'])),
        adv(S('Выбери верное: «Они могут помочь нам».', 'They can help us.', ['They can to help us.', 'They can help us.', 'They cans help us.'], ['После can нет to.'])),
      ],
      bonus: [
        I('Вставь can или can’t: Birds ___ fly.', 'can', ['Птицы умеют летать.'], ['Птицы летают.']),
        TF('После can ставят to: I can to swim.', false, ['После can to не нужен.']),
      ],
      card: ['🏊', 'Что я умею', 'С помощью can можно рассказать о своих умениях: I can swim, I can draw, I can play chess.'],
    }),
    T(10, 'Предлоги места', {
      cards: [
        'Предлоги места показывают, **где** находится предмет: **in** (в), **on** (на), **under** (под), **next to** (рядом с), **behind** (за, позади), **in front of** (перед), **between** (между), **near** (около).',
        '**in** — внутри: The book is in the bag. **on** — на поверхности: The cup is on the table. **under** — под: The cat is under the chair.',
        '**next to** и **near** — рядом: The school is next to the park. **behind** и **in front of** — сзади и спереди: The garden is behind the house. **between** — между двумя: The bank is between the shop and the café.',
        'Помни: **at** используем для точек: at school, at home, at the bus stop. **in** — для городов и стран: in Minsk, in Belarus.',
      ],
      example: ['Выберем предлог: «The ball is ___ the box» (мяч внутри коробки).', [
        ['Мяч внутри коробки, значит, in.', 'In — внутри.'],
        ['Ответ: The ball is in the box.', 'Проверяем смысл.'],
        ['Если мяч лежит сверху — on the box; под коробкой — under the box.', 'Меняем предлог — меняется положение.'],
      ]],
      check: [
        S('The book is ___ the bag. (внутри)', 'in', ['in', 'on', 'under'], ['Внутри — in.']),
        S('The cat is ___ the table. (под)', 'under', ['in', 'on', 'under'], ['Под — under.']),
      ],
      practice: [
        S('The cup is ___ the table. (на)', 'on', ['in', 'on', 'under'], ['На поверхности — on.']),
        S('The bank is ___ the shop and the café. (между)', 'between', ['behind', 'between', 'near'], ['Между двумя — between.']),
        S('The school is ___ the park. (рядом с)', 'next to', ['next to', 'under', 'in'], ['Рядом — next to.']),
        S('The garden is ___ the house. (позади)', 'behind', ['behind', 'in front of', 'on'], ['Позади — behind.']),
        S('Выбери верное: «Я живу в Минске».', 'I live in Minsk.', ['I live on Minsk.', 'I live in Minsk.', 'I live at Minsk.'], ['Города — in.']),
        TF('Предложение «The bird is in the tree» означает «Птица на дереве».', true, ['In the tree — на дереве, среди ветвей.']),
        adv(S('Какой предлог означает «перед»?', 'in front of', ['behind', 'in front of', 'between', 'under'], ['Перед — in front of.'])),
        adv(S('Выбери верное: «Я в школе».', 'I am at school.', ['I am in school only.', 'I am at school.', 'I am on school.'], ['At school — в школе (как место занятий).'])),
      ],
      bonus: [
        I('Вставь предлог: The picture is ___ the wall. (на стене)', 'on', ['На вертикальной поверхности — on.'], ['На — on.']),
        TF('Behind означает «перед».', false, ['Behind — позади, перед — in front of.']),
      ],
      card: ['📍', 'Где это?', 'Предлоги места позволяют объяснить, где что находится. Это очень нужно, когда спрашиваешь дорогу.'],
    }),
    T(11, 'Вопросительные слова', {
      cards: [
        'Чтобы узнать подробности, используем **вопросительные слова**: **What** (что, какой), **Where** (где, куда), **Who** (кто), **When** (когда), **Why** (почему), **How** (как), **Whose** (чей), **How many** (сколько — для счётных), **How much** (сколько — для неисчисляемых).',
        'Вопросительное слово ставим **в начало**: What is your name? Where do you live? Who is your friend? When does the lesson start?',
        'Ответы: **Why** — **Because**: Why are you happy? Because it is Friday. **How old** — возраст: How old are you? I’m eleven.',
        'Вопрос с **How many** используем для предметов, которых можно сосчитать: How many books have you got? **How much** — для воды, молока, денег: How much milk is there?',
      ],
      example: ['Составим вопрос к предложению «Tom lives in Minsk». Спросим про место.', [
        ['Спрашиваем «где»: Where.', 'Выбираем вопросительное слово.'],
        ['Для he/she/it используем does, после него глагол без -s: Where does Tom live?', 'Вопрос готов.'],
        ['Ответ на этот вопрос: Tom lives in Minsk.', 'Вопрос и ответ согласованы.'],
      ]],
      check: [
        S('___ is your name?', 'What', ['Where', 'What', 'When'], ['What — что, какой.']),
        S('___ do you live?', 'Where', ['Where', 'Who', 'Why'], ['Где ты живёшь?']),
      ],
      practice: [
        S('___ is your friend? — Anna.', 'Who', ['Who', 'When', 'Where'], ['Who — кто.']),
        S('___ is your birthday? — In May.', 'When', ['Why', 'When', 'How'], ['When — когда.']),
        S('___ are you happy? — Because it’s Friday.', 'Why', ['Why', 'Who', 'What'], ['Because — ответ на why.']),
        S('___ old are you? — I’m eleven.', 'How', ['How', 'What', 'Who'], ['How old — сколько лет.']),
        S('___ books have you got? — Ten.', 'How many', ['How much', 'How many', 'How old'], ['Books можно посчитать.']),
        S('___ milk is there in the fridge?', 'How much', ['How many', 'How much', 'How old'], ['Milk нельзя посчитать на штуки.']),
        adv(S('___ bag is this? — It’s Tom’s.', 'Whose', ['Who', 'Whose', 'What'], ['Whose — чей.'])),
        adv(TF('На вопрос Why мы отвечаем словом Because.', true, ['Because — потому что.'])),
      ],
      bonus: [
        S('Как спросить «Сколько тебе лет?»', 'How old are you?', ['What age you?', 'How old are you?', 'How many old you?'], ['How old are you?']),
        I('Вставь слово: ___ do you go to school? — By bus. (Как?)', 'How', ['Как — how.'], ['Как — how.']),
      ],
      card: ['🔎', 'Шесть помощников', 'What, where, who, when, why и how задают вопросы почти обо всём. Их знает каждый, кто говорит по-английски.'],
    }),
    T(12, 'Present Continuous', {
      cards: [
        '**Present Continuous** рассказывает о том, что происходит **сейчас**, в момент речи: I am reading now. She is playing in the garden.',
        'Как строится: **am / is / are + глагол с -ing**. I am working. He is watching TV. They are running. Слова-подсказки: **now** (сейчас), **at the moment** (в данный момент), **today**.',
        'Правила написания -ing: обычно просто добавляем -ing (play → playing). Если слово оканчивается на немое **-e**, то е убираем: make → making, write → writing. Если слово короткое с одной гласной и согласной, согласная удваивается: run → running, sit → sitting.',
        'Вопрос: **Is** he reading? **Are** they playing? Отрицание: He **isn’t** reading. They **aren’t** playing. Различай: **Present Simple** — привычка (I read every day), **Present Continuous** — сейчас (I am reading now).',
      ],
      example: ['Скажем, что мама сейчас готовит ужин.', [
        ['Подлежащее mother (she). Глагол cook.', 'Действие происходит сейчас.'],
        ['С she используем is, к глаголу добавляем -ing: is cooking.', 'Present Continuous: is + V-ing.'],
        ['My mother is cooking dinner now.', 'Слово now подтверждает время.'],
      ]],
      check: [
        S('I ___ reading a book now.', 'am', ['am', 'is', 'are'], ['С I — am.']),
        S('They ___ playing football.', 'are', ['am', 'is', 'are'], ['С they — are.']),
      ],
      practice: [
        S('She is ___ now.', 'sleeping', ['sleep', 'sleeps', 'sleeping'], ['Is + V-ing.']),
        S('We are ___ a film.', 'watching', ['watch', 'watches', 'watching'], ['Are + V-ing.']),
        S('Как правильно пишется make с -ing?', 'making', ['makeing', 'making', 'makking'], ['Немое e убираем.']),
        S('Как правильно пишется run с -ing?', 'running', ['runing', 'running', 'runeing'], ['Согласная удваивается.']),
        TF('Предложение «He is play now» правильное.', false, ['Нужно: He is playing now.']),
        S('Какие слова подходят к Present Continuous?', 'now, at the moment', ['every day', 'now, at the moment', 'always', 'usually'], ['Now — сейчас.']),
        adv(I('Вставь am, is или are: The children ___ playing in the yard.', 'are', ['Children — they, значит, are.'], ['Они — are.'])),
        adv(S('Выбери верное: «Что ты делаешь сейчас?»', 'What are you doing now?', ['What you doing now?', 'What are you doing now?', 'What do you doing now?'], ['What are you doing?'])),
      ],
      bonus: [
        I('Напиши форму sit с -ing: He is ___ on the chair.', 'sitting', ['Согласная удваивается: sitting.'], ['Согласная удваивается.']),
        TF('Present Simple и Present Continuous — это одно и то же время.', false, ['Первое — привычка, второе — действие сейчас.']),
      ],
      card: ['🎬', 'Прямо сейчас', 'Present Continuous — время «прямо сейчас». Им описывают, что люди делают в эту минуту.'],
    }),
    T(13, 'Числа, дни недели, месяцы, время', {
      cards: [
        '**Дни недели**: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. **Месяцы**: January, February, March, April, May, June, July, August, September, October, November, December. Названия пишем с **большой буквы**.',
        'С днями используем предлог **on** (on Monday), с месяцами и годами — **in** (in May, in 2026), с временем — **at** (at 7 o’clock). Времена года: spring, summer, autumn, winter.',
        '**Порядковые числа**: first (1st), second (2nd), third (3rd), fourth (4th), fifth (5th)… twelfth, twentieth. Дату говорят так: the fifth of May.',
        '**Время**: 7:00 — **seven o’clock**, 7:15 — **a quarter past seven**, 7:30 — **half past seven**, 7:45 — **a quarter to eight**. Вопрос: What time is it? — It’s half past seven.',
      ],
      example: ['Скажем по-английски, что урок начинается в 8:30.', [
        ['8:30 — это «половина девятого»: half past eight.', 'Half past + час, который уже начался.'],
        ['Предлог времени — at: at half past eight.', 'С точным временем используем at.'],
        ['The lesson starts at half past eight.', 'Предложение в Present Simple (расписание).'],
      ]],
      check: [
        S('Какой день идёт после Monday?', 'Tuesday', ['Sunday', 'Tuesday', 'Friday'], ['Понедельник, вторник…']),
        S('Как по-английски «в мае»?', 'in May', ['on May', 'in May', 'at May'], ['С месяцами — in.']),
      ],
      practice: [
        S('Как по-английски «в понедельник»?', 'on Monday', ['in Monday', 'on Monday', 'at Monday'], ['С днями — on.']),
        S('Какой месяц идёт после March?', 'April', ['February', 'April', 'May'], ['Март, апрель…']),
        S('Как сказать «7:30»?', 'half past seven', ['half to seven', 'half past seven', 'seven past half'], ['Half past seven.']),
        S('Как сказать «7:45»?', 'a quarter to eight', ['a quarter past seven', 'a quarter to eight', 'half past eight'], ['Без пятнадцати восемь.']),
        S('Порядковое число 3-е:', 'third', ['three', 'third', 'threeth'], ['First, second, third.']),
        TF('Названия месяцев в английском пишутся с большой буквы.', true, ['January, May, December.']),
        adv(S('Как по-английски «зима»?', 'winter', ['spring', 'summer', 'winter', 'autumn'], ['Winter — зима.'])),
        adv(I('Вставь предлог: I get up ___ seven o’clock.', 'at', ['С временем — at.'], ['С точным временем — at.'])),
      ],
      bonus: [
        S('Как спросить время?', 'What time is it?', ['What time is it?', 'Which time it is?', 'How time is it?'], ['What time is it?']),
        TF('Saturday и Sunday — выходные дни (the weekend).', true, ['Weekend — выходные.']),
      ],
      card: ['📆', 'Названия дней', 'Названия дней недели в английском связаны с Солнцем, Луной и богами. Sunday — день Солнца, Monday — день Луны.'],
    }),
  ]],
];

// Темы 1–13 написаны раньше; в учебнике (ч. 1) они используются внутри юнитов. Берём их по номеру.
const old = oldSections.flatMap(([, topics]) => topics);
const o = (...ns) => ns.map((n) => old.find((t) => t.n === n));

export const subject = buildSubject({ id: 'english', title: 'Английский язык', language: 'en', color: '#0b7285', icon: '🔤', review: false }, [
  ['Повторение: то, что знаешь из начальной школы', o(1, 2, 4, 6, 9, 10, 12)],
  ['Unit 1. In Summer', [...engU1.slice(0, 3), ...o(5), ...engU1.slice(3, 4), ...o(11), ...engU1.slice(4)]],
  ['Unit 2. Be Active!', [...engU2.slice(0, 3), ...o(3), ...engU2.slice(3)]],
  ['Unit 3. What’s on TV?', [...engU3.slice(0, 2), ...o(13), ...engU3.slice(2, 3), ...o(7, 8), ...engU3.slice(3)]],
  ['Unit 4. Festivals and Celebrations', engU4],
  ['Unit 5. Be Healthy!', engU5],
]);
