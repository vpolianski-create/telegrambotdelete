import { T, S, TF, I, adv } from '../lib.mjs';

const MM = ['much', 'many', 'a lot of'];
const MM2 = ['much', 'many', 'a lot'];
const SAN = ['some', 'any', 'no'];

export const engU5 = [
  T(36, 'Unit 5, Lesson 1. Eatwell plate: здоровая и вредная еда', {
    cards: [
      'Полезная еда (**healthy food**): **vegetables** (овощи), **fruit** (фрукты), **cereal** (злаки, хлопья), **rice** (рис), **beans** (фасоль), **toast** (тост), **broccoli**, **cabbage** (капуста), **lettuce** (салат-латук), **onion** (лук), **beet** (свёкла), **pepper** (перец).',
      'Фрукты: **peach** (персик), **pear** (груша), **grapes** (виноград), **melon** (дыня), **watermelon** (арбуз). Не очень полезное: **crisps** (чипсы), **biscuit** (печенье), **sugar** (сахар), **salt** (соль), **butter** (масло), **snack** (перекус).',
      '**Healthy** — «здоровый, полезный», **unhealthy** — «нездоровый, неполезный». **Junk food** — вредная еда (быстрая, жирная, сладкая). Например: Fruit and vegetables are **healthy**. Crisps are **unhealthy**.',
      'Говорим о еде: **I eat fruit every day. I don’t eat many sweets. She likes rice and beans.** А ещё делимся с другом советом о питании: **You should eat more vegetables.** (подробнее — в уроке про should).',
    ],
    example: ['Раздели еду на healthy и unhealthy.', [
      ['Healthy: apple, rice, broccoli, grapes.', 'Фрукты и овощи полезны.'],
      ['Unhealthy: crisps, biscuits, sugar.', 'Много соли и сахара.'],
      ['Предложение: Crisps are unhealthy, but pears are healthy.', 'Сравниваем с but.'],
    ]],
    check: [
      S('Что значит vegetable?', 'овощ', ['овощ', 'фрукт', 'злак', 'перекус'], ['Vegetables — овощи.']),
      S('Что значит unhealthy?', 'нездоровый, неполезный', ['нездоровый, неполезный', 'здоровый', 'вкусный', 'сладкий'], ['Un- — частица «не».']),
    ],
    practice: [
      S('Как будет «капуста»?', 'cabbage', ['cabbage', 'lettuce', 'onion', 'beet'], ['Cabbage — капуста.']),
      S('Как будет «арбуз»?', 'watermelon', ['watermelon', 'melon', 'grapes', 'peach'], ['Water + melon.']),
      S('Как будет «чипсы»?', 'crisps', ['crisps', 'cereal', 'toast', 'biscuit'], ['Crisps — тонкие ломтики картофеля.']),
      S('Как будет «виноград»?', 'grapes', ['grapes', 'pear', 'peach', 'beans'], ['Grapes — всегда во множественном числе.']),
      S('Какая еда полезная?', 'broccoli', ['broccoli', 'crisps', 'sugar', 'butter'], ['Broccoli — овощ.']),
      adv(S('Что значит snack?', 'перекус', ['перекус', 'завтрак', 'обед', 'салат'], ['A snack — лёгкая закуска.'])),
      adv(TF('Junk food — это вредная еда.', true, ['Junk — мусор.'])),
    ],
    bonus: [
      S('Как будет «фасоль, бобы»?', 'beans', ['beans', 'beet', 'pear', 'rice'], ['Beans — бобовые.']),
      I('Вставь слово: Fruit is ___ . (полезный)', 'healthy', ['Healthy — полезный.'], ['Первая буква — h.']),
    ],
    card: ['🥦', 'Тарелка здоровья', 'Eatwell plate — «тарелка здорового питания». На ней больше овощей и фруктов и меньше сахара и соли.'],
  }),
  T(37, 'Unit 5, Lessons 1, 5. Should / shouldn’t: советы о здоровье', {
    cards: [
      'Чтобы дать **совет**, используем **should** («следует, стоит») и **shouldn’t** («не следует»). После них глагол стоит в начальной форме, а **-s** не добавляем: **You should eat more fruit. She should sleep eight hours. You shouldn’t eat many sweets.**',
      'Вопрос: **Should I eat fruit? — Yes, you should. / No, you shouldn’t.** Спросить о совете: **What should I do to be healthy?** Ответ: **You should walk more and drink water.**',
      'Что **следует делать**: eat fruit and vegetables, drink water, exercise, sleep 8 hours, wash hands, brush teeth twice a day. Что **не следует**: eat a lot of junk food, play video games for more than two hours a day, go to bed late.',
      '**Дневник здоровья** (health diary): записываем, что мы ели и делали вчера: **I ate four portions of fruit and vegetables. I didn’t exercise. I drank 5 glasses of water.** Потом даём себе совет: **I should exercise more.**',
    ],
    example: ['Дай совет другу, который редко ест овощи.', [
      ['Говорим, что нужно: You should eat more vegetables.', 'Should + глагол.'],
      ['Говорим, чего не нужно: You shouldn’t eat many crisps.', 'Shouldn’t + глагол.'],
      ['Добавляем объяснение: They are unhealthy.', 'Because — потому что.'],
    ]],
    check: [
      S('You ___ eat a lot of sweets. (не следует)', 'shouldn’t', ['should', 'shouldn’t', 'don’t'], ['Не следует — shouldn’t.']),
      S('She ___ sleep eight hours.', 'should', ['should', 'shoulds', 'shouldn’t'], ['Should не меняется.']),
    ],
    practice: [
      S('He should ___ more water.', 'drink', ['drink', 'drinks', 'drinking'], ['После should — начальная форма.']),
      S('You ___ watch TV for more than two hours. (совет: не надо)', 'shouldn’t', ['should', 'shouldn’t', 'do'], ['Много телевизора вредно.']),
      S('Выбери верное предложение.', 'She should eat more fruit.', ['She shoulds eat more fruit.', 'She should eats more fruit.', 'She should eat more fruit.'], ['Should + eat.']),
      S('Как ответить на вопрос «Should I wash my hands?» (да)?', 'Yes, you should.', ['Yes, you should.', 'Yes, I do.', 'Yes, you do.'], ['Отвечаем should.']),
      S('Что значит exercise?', 'заниматься физкультурой', ['заниматься физкультурой', 'кушать', 'спать', 'читать'], ['To exercise — тренироваться.']),
      adv(S('Что значит health diary?', 'дневник здоровья', ['дневник здоровья', 'доктор', 'спорт', 'меню'], ['Diary — дневник.'])),
      adv(TF('С he / she / it к should добавляют -s.', false, ['Should не изменяется.'])),
    ],
    bonus: [
      S('Как будет «Тебе следует спать 8 часов»?', 'You should sleep eight hours.', ['You should sleep eight hours.', 'You sleeps eight hours.', 'You should to sleep eight hours.'], ['Should + sleep.']),
      I('Вставь слово: I ___ drink more water. (мне следует)', 'should', ['Should — следует.'], ['Первая буква — s.']),
    ],
    card: ['🩺', 'Совет — should', 'Should — совет, shouldn’t — предостережение. Не добавляй -s и to: just should + глагол.'],
  }),
  T(38, 'Unit 5, Lessons 2–3. Исчисляемые и неисчисляемые: some, any, no', {
    cards: [
      '**Исчисляемые** (countable) можно посчитать: **one apple, two apples, a sandwich, an orange, a book**. **Неисчисляемые** (uncountable) не считают штуками: **milk, water, jam, tea, money, rice, sugar, butter**. Перед исчисляемым ставим **a / an**, перед неисчисляемым — **some**: I’d like **a** sandwich. I’d like **some** jam.',
      '**Some** — в утвердительных предложениях: **There are some biscuits. There is some water.** **Any** — в вопросах и отрицаниях: **Are there any biscuits? There aren’t any biscuits. Is there any water? There isn’t any water.** **No** — «никакой», «нет»: **There are no biscuits** (то же, что there aren’t any biscuits).',
      'Рецепт пирога (**zucchini cake**): **We need some flour, some sugar, two eggs, a zucchini. We don’t need any salt.** Объясняя рецепт, используем слова **First, then, next, after that**.',
      'Вопросы о наличии: **Is there any milk in the fridge? — Yes, there is some. / No, there isn’t any.** **Are there any apples? — Yes, there are some. / No, there aren’t any.** Слова урока: **bean, beet, broccoli, cereal, pepper** и другие овощи и злаки.',
    ],
    example: ['Вставь some или any: «There isn’t ___ water».', [
      ['Предложение отрицательное.', 'Нужно any.'],
      ['There isn’t any water.', 'Any — в отрицании и вопросе.'],
      ['А в утверждении: There is some water.', 'Some — в утверждении.'],
    ]],
    check: [
      S('There are ___ apples on the table.', 'some', SAN, ['Утверждение — some.']),
      S('Are there ___ biscuits?', 'any', SAN, ['Вопрос — any.']),
    ],
    practice: [
      S('There isn’t ___ jam.', 'any', SAN, ['Отрицание — any.']),
      S('I’d like ___ water.', 'some', SAN, ['Просьба — some.']),
      S('There are ___ biscuits. (никаких)', 'no', SAN, ['No = not any.']),
      S('Какое слово неисчисляемое?', 'milk', ['milk', 'apple', 'book', 'sandwich'], ['Молоко не считают штуками.']),
      S('Какое слово исчисляемое?', 'orange', ['orange', 'water', 'jam', 'rice'], ['One orange, two oranges.']),
      adv(S('Как будет «Я хочу бутерброд»?', 'I’d like a sandwich.', ['I’d like some sandwich.', 'I’d like a sandwich.', 'I’d like sandwiches a.'], ['Sandwich — исчисляемое.'])),
      adv(TF('«Is there any milk?» — правильный вопрос.', true, ['Any — в вопросах.'])),
    ],
    bonus: [
      S('Выбери верное предложение.', 'We need some sugar.', ['We need any sugar.', 'We need some sugar.', 'We needs some sugar.'], ['Утверждение — some.']),
      I('Вставь слово: There isn’t ___ cheese.', 'any', ['Отрицание — any.'], ['Первая буква — a.']),
    ],
    card: ['🍰', 'Some и any', 'Some — для утверждений, any — для вопросов и отрицаний. А no — «нет» вместо not any.'],
  }),
  T(39, 'Unit 5, Lesson 3. Much, many, a lot of', {
    cards: [
      '**Many** — «много» с **исчисляемыми** существительными (во множественном числе): **many books, many apples, many tourists**. **Much** — «много» с **неисчисляемыми**: **much water, much sugar, much money**. **A lot of** — «много» с любыми: **a lot of books, a lot of water**.',
      '**Much** и **many** чаще используем в **вопросах и отрицаниях**: **How much water do you drink? How many apples did you eat? There isn’t much milk. I haven’t got many friends.** В утвердительных предложениях лучше **a lot of**: I eat **a lot of** vegetables.',
      'Вопросы **How much?** и **How many?**: **How much sugar do you eat? — Not much. How many fruits do you eat? — A lot of.** Для денег: **How much is it?** («Сколько это стоит?»).',
      'Правило для здоровья: **You shouldn’t eat much sugar.** (sugar — неисчисляемое) **You shouldn’t eat many sweets.** (sweets — исчисляемое). Сначала определи, можно ли предмет посчитать штуками.',
    ],
    example: ['Выбери much или many: «How ___ apples did you buy?»', [
      ['Apples — можно посчитать (исчисляемое).', 'Нужно many.'],
      ['How many apples did you buy?', 'How many + множественное число.'],
      ['Ответ: I bought a lot of apples.', 'A lot of — для утверждения.'],
    ]],
    check: [
      S('How ___ water do you drink?', 'much', MM, ['Water — неисчисляемое.']),
      S('How ___ books have you got?', 'many', MM, ['Books — исчисляемое.']),
    ],
    practice: [
      S('I eat a ___ of vegetables.', 'lot', ['lot', 'much', 'many'], ['A lot of — много.']),
      S('There isn’t ___ milk.', 'much', MM2, ['Milk — неисчисляемое.']),
      S('There aren’t ___ tourists.', 'many', MM2, ['Tourists — исчисляемое.']),
      S('How ___ sugar do you eat?', 'much', MM, ['Sugar — неисчисляемое.']),
      S('How ___ is it? (цена)', 'much', MM, ['How much — о цене.']),
      adv(S('Какое предложение верное?', 'I eat a lot of fruit.', ['I eat much fruit.', 'I eat a lot of fruit.', 'I eat many fruit.'], ['В утверждении — a lot of.'])),
      adv(TF('С неисчисляемыми существительными используем many.', false, ['Нужно much.'])),
    ],
    bonus: [
      S('Выбери верное: You shouldn’t eat ___ sweets.', 'many', MM2, ['Sweets — исчисляемое.']),
      I('Вставь слово: Do you drink ___ of water? (много)', 'a lot', ['A lot of — для утверждения и вопроса.'], ['Два слова.']),
    ],
    card: ['🔢', 'Много — много способов', 'Many — с тем, что считаем. Much — с тем, что не считаем. A lot of — подходит почти всегда.'],
  }),
  T(40, 'Unit 5, Lessons 2, 4–5. Мой день: привычки и дневник', {
    cards: [
      'Расскажи о **вчерашнем дне** в **Past Simple**: **I got up at 7. I brushed my teeth. I ate cereal and toast for breakfast. I went to school. I played football. I didn’t eat junk food.** Помни: ate, went, got — неправильные глаголы.',
      'А о **привычках** — в **Present Simple** с наречиями: **I always brush my teeth in the morning. I rarely eat sweets. I never play video games before bed. I sometimes go running.** Таблица «Yes, always / often / sometimes / No, rarely / never» помогает ответить на вопросы анкеты.',
      'Вопросы анкеты: **Do you eat fruit and vegetables? Do you drink water? Do you brush your teeth twice a day? Do you sleep eight hours? Do you exercise? Do you play video games?** Отвечаем: **Yes, always.** / **No, never.**',
      'Дневник: **Day: Monday. Fruit and vegetables: 4 portions. Water: 5 glasses. Sleep: 9 hours. Exercise: 30 minutes.** Потом вывод: **I had a healthy day.** Или: **I should drink more water.**',
    ],
    example: ['Расскажи, что ты вчера ел.', [
      ['Ставим слово yesterday: Yesterday I …', 'Past Simple.'],
      ['Выбираем еду и глагол: ate an apple and drank water.', 'Eat — ate, drink — drank.'],
      ['Заключаем: I had a healthy day.', 'Have — had.'],
    ]],
    check: [
      S('Past Simple от eat.', 'ate', ['eated', 'ate', 'eaten'], ['Eat — ate.']),
      S('Past Simple от drink.', 'drank', ['drinked', 'drank', 'drunk'], ['Drink — drank.']),
    ],
    practice: [
      S('Yesterday I ___ to school. (go)', 'went', ['go', 'went', 'goed'], ['Go — went.']),
      S('I ___ brush my teeth in the morning. (всегда)', 'always', ['always', 'never', 'yesterday'], ['Always — всегда.']),
      S('Как спросить «Ты ешь фрукты?»', 'Do you eat fruit?', ['Do you eat fruit?', 'Are you eat fruit?', 'Does you eat fruit?'], ['Do + you.']),
      S('Как ответить «Нет, никогда»?', 'No, never.', ['No, never.', 'Yes, always.', 'Yes, often.', 'No, always.'], ['Never — никогда.']),
      S('Past Simple от have.', 'had', ['haved', 'had', 'has'], ['Have — had.']),
      adv(S('Выбери верное предложение о вчера.', 'I didn’t play video games.', ['I didn’t played video games.', 'I didn’t play video games.', 'I not play video games.'], ['Didn’t + play.'])),
      adv(TF('«I rarely eat sweets» — это о привычке.', true, ['Rarely — редко, Present Simple.'])),
    ],
    bonus: [
      S('Что значит portion?', 'порция', ['порция', 'часть дня', 'стакан', 'таблетка'], ['4 portions of fruit — 4 порции фруктов.']),
      I('Напиши Past Simple глагола get.', 'got', ['Get — got.'], ['Три буквы.']),
    ],
    card: ['📔', 'Дневник здоровья', 'Каждый вечер записывай, что ел, пил и сколько двигался. Через неделю увидишь, что можно улучшить.'],
  }),
  T(41, 'Грамматический справочник: местоимения-дополнения (object pronouns)', {
    cards: [
      'Местоимения-**подлежащие** (**кто?**): I, you, he, she, it, we, they. Местоимения-**дополнения** (**кого? кому?**): **me, you, him, her, it, us, them**. Например: She knows **me**. I’ll call **you**. Tell **him** the truth. I see **her**.',
      'Подлежащее стоит **перед** глаголом, дополнение — **после** глагола: **I like them.** (я люблю их). **They like me.** (они любят меня). Take **it**. They invited **us**. Listen to **them**.',
      'После предлогов тоже используем дополнение: **with me, for him, to her, about us, at them**. Например: Play with **me**. This present is for **you**. Look at **them**.',
      'Выбери правильное слово: **Sasha is my friend. I like ___ .** Sasha — он, значит him. **Anna and Tom are in the park. I can see ___ .** Они — them. Не путай **he / him**, **she / her**, **we / us**.',
    ],
    example: ['Заменить слово местоимением: «I see Anna».', [
      ['Anna — это она. После глагола нужно дополнение.', 'She → her.'],
      ['I see her.', 'Местоимение вместо имени.'],
      ['А если подлежащее: She sees me.', 'Me — дополнение от I.'],
    ]],
    check: [
      S('Sasha is my friend. I like ___ .', 'him', ['he', 'him', 'his', 'her'], ['Он → him.']),
      S('Anna is here. I see ___ .', 'her', ['she', 'her', 'him', 'them'], ['Она → her.']),
    ],
    practice: [
      S('Tom and Ann are my friends. I like ___ .', 'them', ['they', 'them', 'him', 'us'], ['Они → them.']),
      S('Call ___ ! (мне)', 'me', ['I', 'me', 'my', 'mine'], ['Я → me.']),
      S('He invited ___ to the party. (нас)', 'us', ['we', 'us', 'our', 'them'], ['Мы → us.']),
      S('Take this book. Take ___ .', 'it', ['it', 'its', 'he', 'them'], ['Предмет → it.']),
      S('Look at ___ ! (его)', 'him', ['he', 'him', 'his', 'her'], ['После at — him.']),
      adv(S('This present is for ___ . (тебя)', 'you', ['you', 'your', 'yours', 'I'], ['You не меняется.'])),
      adv(TF('«Me» — это местоимение-подлежащее.', false, ['Me — дополнение (I → me).'])),
    ],
    bonus: [
      S('Вместо «Ann and I» после глагола скажем …', 'us', ['we', 'us', 'our', 'them'], ['Мы → us.']),
      I('Вставь слово: She knows ___ . (меня)', 'me', ['Я → me.'], ['Две буквы.']),
    ],
    card: ['👥', 'Я — меня', 'I → me, he → him, she → her, we → us, they → them. Так меняются местоимения после глагола и предлога.'],
  }),
];
