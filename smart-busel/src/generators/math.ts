import type { Task } from '../content/schema';
import { pick, randInt, shuffle, type Rng } from '../engine/rng';

export type Generated = Pick<Task, 'type' | 'question' | 'options' | 'answer' | 'explanation' | 'hints'>;
export type Generator = (rng: Rng, difficulty: Task['difficulty']) => Generated;

/** 3847 → «3 847» (неразрывный пробел). Проверка ответа пробелы игнорирует. */
export const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const PLACES = [
  { p: 10, name: 'десятков', digit: 'десятков' },
  { p: 100, name: 'сотен', digit: 'сотен' },
  { p: 1000, name: 'тысяч', digit: 'тысяч' },
] as const;

const roundTo = (n: number, p: number) => Math.round(n / p) * p; // для натуральных .5 → вверх

function pickPlace(rng: Rng, difficulty: Task['difficulty']) {
  return difficulty === 'basic' ? PLACES[0] : pick(rng, difficulty === 'advanced' ? PLACES.slice(1) : PLACES);
}

function numberFor(rng: Rng, p: number, difficulty: Task['difficulty']) {
  const digits = difficulty === 'basic' ? [2, 3] : [4, 5];
  const len = Math.max(pick(rng, digits), String(p).length + 1);
  let n = 0;
  do n = randInt(rng, 10 ** (len - 1), 10 ** len - 1);
  while (n % p === 0);
  return n;
}

function roundSteps(n: number, place: (typeof PLACES)[number]) {
  const next = Math.floor(n / (place.p / 10)) % 10;
  const keep = Math.floor(n / place.p) % 10;
  const ans = roundTo(n, place.p);
  return [
    `Округляем до ${place.name}. Смотрим на цифру справа от разряда ${place.name}: это ${next}.`,
    next >= 5
      ? `${next} — это 5 или больше, значит, к цифре ${keep} прибавляем 1.`
      : `${next} меньше 5, значит, цифры слева остаются без изменений.`,
    `Справа ставим нули: ${fmt(ans)}.`,
  ];
}

const ROUND_HINTS = [
  'Найди разряд, до которого округляем, и посмотри на цифру справа от него.',
  'Если эта цифра 5 или больше — округляем вверх, если меньше 5 — вниз.',
];

const roundNearest: Generator = (rng, difficulty) => {
  const place = pickPlace(rng, difficulty);
  const n = numberFor(rng, place.p, difficulty);
  return {
    type: 'input',
    question: `Округли число ${fmt(n)} до ${place.name}.`,
    answer: roundTo(n, place.p),
    explanation: roundSteps(n, place),
    hints: ROUND_HINTS,
  };
};

const roundChoose: Generator = (rng, difficulty) => {
  const place = pickPlace(rng, difficulty);
  const n = numberFor(rng, place.p, difficulty);
  const ans = roundTo(n, place.p);
  const wrongWay = ans === Math.floor(n / place.p) * place.p ? ans + place.p : Math.floor(n / place.p) * place.p;
  const opts = new Set<number>([ans, wrongWay, ans + place.p, ans - place.p].filter((x) => x > 0));
  for (let k = 2; opts.size < 4; k++) opts.add(ans + place.p * k);
  return {
    type: 'single',
    question: `Какое число получится, если округлить ${fmt(n)} до ${place.name}?`,
    options: shuffle(rng, [...opts].map(fmt)),
    answer: fmt(ans),
    explanation: roundSteps(n, place),
    hints: ROUND_HINTS,
  };
};

const roundMaxMin: Generator = (rng) => {
  const x = randInt(rng, 5, 99) * 10;
  const max = rng() < 0.5;
  return {
    type: 'input',
    question: `Число округлили до десятков и получили ${fmt(x)}. Какое ${max ? 'наибольшее' : 'наименьшее'} натуральное число это могло быть?`,
    answer: max ? x + 4 : x - 5,
    explanation: [
      `До ${fmt(x)} округляются числа от ${fmt(x - 5)} до ${fmt(x + 4)}.`,
      `Число ${fmt(x - 5)} округляется вверх (цифра единиц 5), а ${fmt(x + 4)} — вниз (цифра единиц 4).`,
      `Значит, ${max ? 'наибольшее' : 'наименьшее'} — ${fmt(max ? x + 4 : x - 5)}.`,
    ],
    hints: ['Выпиши числа рядом с ним и проверь, как каждое округляется.', `Цифра единиц ${max ? 'не больше 4' : 'не меньше 5'}.`],
  };
};

const roundEstimate: Generator = (rng) => {
  const nums = [0, 0].map(() => {
    let n = 0;
    do n = randInt(rng, 120, 960);
    while (n % 100 === 0);
    return n;
  });
  const [a, b] = nums;
  return {
    type: 'input',
    question: `Прикинь сумму: округли каждое слагаемое до сотен и сложи. ${fmt(a)} + ${fmt(b)} ≈ ?`,
    answer: roundTo(a, 100) + roundTo(b, 100),
    explanation: [
      `${fmt(a)} ≈ ${fmt(roundTo(a, 100))}, ${fmt(b)} ≈ ${fmt(roundTo(b, 100))}.`,
      `${fmt(roundTo(a, 100))} + ${fmt(roundTo(b, 100))} = ${fmt(roundTo(a, 100) + roundTo(b, 100))}.`,
    ],
    hints: ['Сначала округли каждое число отдельно.', 'Потом сложи круглые числа.'],
  };
};

const pair = (rng: Rng, difficulty: Task['difficulty']) => {
  const d = difficulty === 'basic' ? randInt(rng, 2, 9) : randInt(rng, 11, 29);
  let n = 0;
  do n = difficulty === 'basic' ? randInt(rng, 10, 99) : randInt(rng, 100, 999);
  while (n % d === 0 || n < d);
  return { n, d, q: Math.floor(n / d), r: n % d };
};

const REM_HINTS = [
  'Найди наибольшее число, которое делится на делитель и не больше делимого.',
  'Остаток — это разность между делимым и этим числом.',
];

const divRemainder: Generator = (rng, difficulty) => {
  const { n, d, q, r } = pair(rng, difficulty);
  return {
    type: 'input',
    question: `Найди остаток при делении ${fmt(n)} на ${d}.`,
    answer: r,
    explanation: [
      `Ищем наибольшее число, кратное ${d} и не больше ${fmt(n)}: ${d} · ${q} = ${fmt(d * q)}.`,
      `Остаток: ${fmt(n)} − ${fmt(d * q)} = ${r}.`,
      `Проверка: остаток ${r} меньше делителя ${d} ✓`,
    ],
    hints: REM_HINTS,
  };
};

const divQuotient: Generator = (rng, difficulty) => {
  const { n, d, q, r } = pair(rng, difficulty);
  return {
    type: 'input',
    question: `Найди неполное частное при делении ${fmt(n)} на ${d}.`,
    answer: q,
    explanation: [
      `Подбираем, сколько раз ${d} помещается в ${fmt(n)}: ${d} · ${q} = ${fmt(d * q)}, а ${d} · ${q + 1} = ${fmt(d * (q + 1))} — уже больше.`,
      `Значит, ${fmt(n)} : ${d} = ${q} (ост. ${r}). Неполное частное — ${q}.`,
    ],
    hints: REM_HINTS,
  };
};

const divDividend: Generator = (rng) => {
  const d = randInt(rng, 3, 9);
  const q = randInt(rng, 3, 12);
  const r = randInt(rng, 1, d - 1);
  return {
    type: 'input',
    question: `Неполное частное равно ${q}, делитель равен ${d}, остаток равен ${r}. Чему равно делимое?`,
    answer: d * q + r,
    explanation: [
      'Делимое = делитель · неполное частное + остаток.',
      `${d} · ${q} + ${r} = ${d * q} + ${r} = ${d * q + r}.`,
    ],
    hints: ['Вспомни проверку деления с остатком.', 'Умножь делитель на неполное частное и прибавь остаток.'],
  };
};

const divCanBe: Generator = (rng) => {
  const d = randInt(rng, 3, 9);
  const ok = rng() < 0.5;
  const r = ok ? randInt(rng, 0, d - 1) : randInt(rng, d, d + 3);
  return {
    type: 'truefalse',
    question: `При делении на ${d} остаток может быть равен ${r}.`,
    answer: ok,
    explanation: [
      'Остаток всегда меньше делителя.',
      ok ? `${r} < ${d}, значит, так может быть.` : `${r} не меньше ${d}, значит, так быть не может: можно было бы взять ещё одну порцию.`,
    ],
    hints: ['Сравни остаток с делителем.'],
  };
};

const PACK = [
  (d: number, n: number) => ({ q: `В одну лодку садится ${d} человек. Сколько лодок нужно для ${n} человек?`, unit: 'лодок' }),
  (d: number, n: number) => ({ q: `В коробку помещается ${d} яиц. Сколько коробок нужно, чтобы разложить ${n} яиц?`, unit: 'коробок' }),
  (d: number, n: number) => ({ q: `На одну полку встаёт ${d} книг. Сколько полок нужно для ${n} книг?`, unit: 'полок' }),
];

const divPack: Generator = (rng) => {
  const d = randInt(rng, 5, 9);
  let n = 0;
  do n = randInt(rng, 30, 99);
  while (n % d === 0);
  const { q } = pick(rng, PACK)(d, n);
  const full = Math.floor(n / d);
  return {
    type: 'input',
    question: q,
    answer: full + 1,
    explanation: [
      `${n} : ${d} = ${full} (ост. ${n % d}).`,
      `${full} полных, но ещё ${n % d} остались — для них нужна ещё одна.`,
      `Всего: ${full} + 1 = ${full + 1}.`,
    ],
    hints: ['Раздели с остатком.', 'Если остаток не нулевой, нужна ещё одна.'],
  };
};

const DAYS = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'];

const divWeekday: Generator = (rng) => {
  const start = randInt(rng, 0, 6);
  const k = randInt(rng, 20, 100);
  const rem = k % 7;
  const ans = DAYS[(start + rem) % 7];
  return {
    type: 'single',
    question: `Сегодня ${DAYS[start]}. Какой день недели будет через ${k} дней?`,
    options: shuffle(rng, DAYS),
    answer: ans,
    explanation: [
      'Дни недели повторяются каждые 7 дней.',
      `${k} : 7 = ${Math.floor(k / 7)} (ост. ${rem}). Целые недели не меняют день.`,
      rem === 0 ? `Остаток 0, день тот же: ${ans}.` : `Остаток ${rem}: считаем ${rem} дн. вперёд от дня «${DAYS[start]}» — получится ${ans}.`,
    ],
    hints: [`В неделе 7 дней. Раздели ${k} на 7 с остатком.`, 'Целые недели не важны — нужен только остаток.'],
  };
};

export const mathGenerators: Record<string, Generator> = {
  'math.round.nearest': roundNearest,
  'math.round.choose': roundChoose,
  'math.round.maxMin': roundMaxMin,
  'math.round.estimate': roundEstimate,
  'math.divRem.remainder': divRemainder,
  'math.divRem.quotient': divQuotient,
  'math.divRem.dividend': divDividend,
  'math.divRem.canBe': divCanBe,
  'math.divRem.pack': divPack,
  'math.divRem.weekday': divWeekday,
};
