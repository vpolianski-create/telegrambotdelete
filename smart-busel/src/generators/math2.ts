import { pick, randInt, shuffle, type Rng } from '../engine/rng';
import { fmt, type Generator } from './math';

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const pow = (b: number, e: number) => `${b}${String(e).replace(/\d/g, (d) => SUP[d])}`;
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;

// ---------- степень ----------
const powerCompute: Generator = (rng, difficulty) => {
  const b = difficulty === 'basic' ? randInt(rng, 2, 9) : randInt(rng, 2, 10);
  const e = difficulty === 'basic' ? randInt(rng, 2, 3) : randInt(rng, 3, 5);
  const ok = b ** e <= 100000;
  const base = ok ? b : 3;
  const exp = ok ? e : 4;
  const steps = Array(exp).fill(base).join(' · ');
  return {
    type: 'input',
    question: `Вычисли ${pow(base, exp)}.`,
    answer: base ** exp,
    explanation: [
      `Степень — это произведение одинаковых множителей: ${pow(base, exp)} = ${steps}.`,
      `Считаем по шагам: ${steps} = ${fmt(base ** exp)}.`,
    ],
    hints: ['Показатель степени говорит, сколько раз повторяется основание как множитель.', `Запиши произведение: ${Array(exp).fill(base).join(' · ')}.`],
  };
};

const powerWrite: Generator = (rng) => {
  const b = randInt(rng, 2, 9);
  const e = randInt(rng, 2, 6);
  const wrong = new Set([pow(e, b), `${b} · ${e}`, pow(b, e + 1)]);
  wrong.delete(pow(b, e));
  const prod = Array(e).fill(b).join(' · ');
  return {
    type: 'single',
    question: `Запиши произведение ${prod} в виде степени.`,
    options: shuffle(rng, [pow(b, e), ...[...wrong].slice(0, 3)]),
    answer: pow(b, e),
    explanation: [`Множитель ${b} повторяется ${e} раз(а).`, `Основание — ${b}, показатель — ${e}: ${pow(b, e)}.`],
    hints: ['Основание — это повторяющийся множитель.', 'Показатель — это количество множителей.'],
  };
};

const powerCompare: Generator = (rng) => {
  const a = randInt(rng, 2, 6);
  const ea = randInt(rng, 2, 4);
  const b = randInt(rng, 2, 6);
  const eb = randInt(rng, 2, 4);
  const x = a ** ea;
  const y = b ** eb;
  return {
    type: 'single',
    question: `Сравни: ${pow(a, ea)} и ${pow(b, eb)}.`,
    options: ['>', '<', '='],
    answer: x > y ? '>' : x < y ? '<' : '=',
    explanation: [`${pow(a, ea)} = ${x}, ${pow(b, eb)} = ${y}.`, `${x} ${x > y ? '>' : x < y ? '<' : '='} ${y}.`],
    hints: ['Сначала вычисли каждую степень.', 'Потом сравни два числа.'],
  };
};

const powerSquare: Generator = (rng) => {
  const a = randInt(rng, 3, 15);
  return {
    type: 'input',
    question: `Сторона квадрата равна ${a} см. Чему равна его площадь (в см²)?`,
    answer: a * a,
    explanation: ['Площадь квадрата = сторона · сторона = сторона во 2-й степени.', `${pow(a, 2)} = ${a} · ${a} = ${a * a}.`],
    hints: ['Площадь квадрата — это сторона, умноженная на саму себя.'],
  };
};

// ---------- НОД и НОК ----------
const divisorsOf = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);

const countDivisors: Generator = (rng) => {
  const n = pick(rng, [12, 16, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48]);
  const ds = divisorsOf(n);
  return {
    type: 'input',
    question: `Сколько всего делителей у числа ${n}?`,
    answer: ds.length,
    explanation: [`Выписываем пары: числа, на которые ${n} делится без остатка.`, `Делители ${n}: ${ds.join(', ')}.`, `Всего их ${ds.length}.`],
    hints: ['Начни с 1 и проверяй числа по порядку.', 'Делители идут парами: если 2 делит число, то и частное — тоже делитель.'],
  };
};

const pairWithGcd = (rng: Rng, difficulty: string) => {
  const coprimes: [number, number][] = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [2, 7], [3, 7]];
  const [x, y] = pick(rng, coprimes);
  const g = difficulty === 'basic' ? randInt(rng, 2, 6) : randInt(rng, 4, 15);
  return { a: g * x, b: g * y, g };
};

const gcdGen: Generator = (rng, difficulty) => {
  const { a, b, g } = pairWithGcd(rng, difficulty);
  return {
    type: 'input',
    question: `Найди наибольший общий делитель чисел ${a} и ${b}.`,
    answer: g,
    explanation: [`Делители ${a}: ${divisorsOf(a).join(', ')}.`, `Делители ${b}: ${divisorsOf(b).join(', ')}.`, `Общие делители, и среди них наибольший — ${g}.`],
    hints: ['Выпиши все делители каждого числа.', 'Найди общие и выбери наибольший.'],
  };
};

const lcmGen: Generator = (rng, difficulty) => {
  const a = difficulty === 'basic' ? randInt(rng, 2, 9) : randInt(rng, 6, 15);
  let b = a;
  while (b === a) b = difficulty === 'basic' ? randInt(rng, 2, 9) : randInt(rng, 6, 15);
  const l = lcm(a, b);
  const mult = (n: number) => Array.from({ length: Math.min(8, Math.ceil(l / n) + 1) }, (_, i) => n * (i + 1)).join(', ');
  return {
    type: 'input',
    question: `Найди наименьшее общее кратное чисел ${a} и ${b}.`,
    answer: l,
    explanation: [`Кратные ${a}: ${mult(a)}…`, `Кратные ${b}: ${mult(b)}…`, `Первое число, которое встречается в обоих рядах — ${l}.`],
    hints: ['Выписывай числа, кратные большему из двух чисел, пока одно не разделится на меньшее.', 'Кратные получаются умножением на 1, 2, 3…'],
  };
};

const lcmProblem: Generator = (rng) => {
  const pairs: [number, number][] = [[6, 8], [4, 6], [10, 15], [12, 18], [6, 9], [8, 12], [5, 8]];
  const [a, b] = pick(rng, pairs);
  return {
    type: 'input',
    question: `Два автобуса одновременно отправились с остановки. Первый ходит каждые ${a} минут, второй — каждые ${b} минут. Через сколько минут они снова отправятся одновременно?`,
    answer: lcm(a, b),
    explanation: [`Нужно число, которое делится и на ${a}, и на ${b}, — и самое маленькое.`, `Это наименьшее общее кратное: НОК(${a}, ${b}) = ${lcm(a, b)}.`],
    hints: ['Подумай, какие минуты подходят для первого автобуса, а какие для второго.'],
  };
};

const gcdProblem: Generator = (rng) => {
  const { a, b, g } = pairWithGcd(rng, 'advanced');
  return {
    type: 'input',
    question: `У Маши ${a} конфет и ${b} печений. Какое наибольшее число одинаковых подарков она может составить, если использует всё и в каждом подарке одинаковое количество конфет и печений?`,
    answer: g,
    explanation: [`Число подарков должно быть делителем и ${a}, и ${b}.`, `Наибольший такой делитель — НОД(${a}, ${b}) = ${g}.`],
    hints: ['Число подарков делит оба числа без остатка.'],
  };
};

// ---------- признаки делимости ----------
const digitSum = (n: number) => String(n).split('').reduce((s, c) => s + Number(c), 0);
const RULES: Record<number, { test(n: number): boolean; rule: string }> = {
  2: { test: (n) => n % 2 === 0, rule: 'на 2 делятся числа, которые оканчиваются чётной цифрой (0, 2, 4, 6, 8)' },
  3: { test: (n) => digitSum(n) % 3 === 0, rule: 'на 3 делятся числа, у которых сумма цифр делится на 3' },
  5: { test: (n) => n % 5 === 0, rule: 'на 5 делятся числа, которые оканчиваются на 0 или 5' },
  9: { test: (n) => digitSum(n) % 9 === 0, rule: 'на 9 делятся числа, у которых сумма цифр делится на 9' },
  10: { test: (n) => n % 10 === 0, rule: 'на 10 делятся числа, которые оканчиваются на 0' },
};
const explainDiv = (n: number, d: number) => {
  const yes = RULES[d].test(n);
  const detail = [3, 9].includes(d) ? `Сумма цифр: ${String(n).split('').join(' + ')} = ${digitSum(n)}.` : `Последняя цифра числа ${fmt(n)} — ${n % 10}.`;
  return [`Правило: ${RULES[d].rule}.`, detail, yes ? `Условие выполнено — ${fmt(n)} делится на ${d}.` : `Условие не выполнено — ${fmt(n)} не делится на ${d}.`];
};

const divCan: Generator = (rng, difficulty) => {
  const d = pick(rng, difficulty === 'basic' ? [2, 5, 10, 3] : [3, 9, 2, 5]);
  const n = randInt(rng, difficulty === 'basic' ? 100 : 1000, difficulty === 'basic' ? 999 : 99999);
  return {
    type: 'truefalse',
    question: `Число ${fmt(n)} делится на ${d} без остатка.`,
    answer: RULES[d].test(n),
    explanation: explainDiv(n, d),
    hints: [`Вспомни признак делимости на ${d}.`],
  };
};

const divChoose: Generator = (rng, difficulty) => {
  const d = pick(rng, difficulty === 'basic' ? [2, 5, 10] : [3, 9]);
  const lo = difficulty === 'basic' ? 100 : 1000;
  const hi = difficulty === 'basic' ? 999 : 9999;
  const good = new Set<number>();
  const bad = new Set<number>();
  for (let k = 0; k < 4000 && (good.size < 1 || bad.size < 3); k++) {
    const n = randInt(rng, lo, hi);
    if (RULES[d].test(n)) good.add(n);
    else bad.add(n);
  }
  const g = [...good][0];
  const opts = shuffle(rng, [g, ...[...bad].slice(0, 3)]).map(fmt);
  return {
    type: 'single',
    question: `Какое из чисел делится на ${d}?`,
    options: opts,
    answer: fmt(g),
    explanation: explainDiv(g, d),
    hints: [`Проверь каждое число по признаку делимости на ${d}.`],
  };
};

const divDigit: Generator = (rng) => {
  const d = pick(rng, [3, 9]);
  const a = randInt(rng, 1, 9);
  const b = randInt(rng, 1, 9);
  const best = Array.from({ length: 10 }, (_, k) => k).find((k) => RULES[d].test(Number(`${a}${k}${b}`)))!;
  const n = Number(`${a}${best}${b}`);
  return {
    type: 'input',
    question: `Какую наименьшую цифру нужно поставить вместо *, чтобы число ${a}*${b} делилось на ${d}?`,
    answer: best,
    explanation: [`Сумма известных цифр: ${a} + ${b} = ${a + b}.`, `Нужно, чтобы сумма цифр делилась на ${d}. Подходит ${best}: ${a} + ${best} + ${b} = ${a + best + b}.`, `Проверка: ${n} делится на ${d} ✓`],
    hints: ['Сложи известные цифры.', `Подбирай цифру от 0 до 9, чтобы сумма делилась на ${d}.`],
  };
};

const divSix: Generator = (rng) => {
  const n = randInt(rng, 100, 9999);
  const yes = n % 6 === 0;
  return {
    type: 'truefalse',
    question: `Число ${fmt(n)} делится на 6.`,
    answer: yes,
    explanation: ['Число делится на 6, если оно делится и на 2, и на 3.', `Последняя цифра ${n % 10} — ${n % 2 === 0 ? 'чётная, значит, на 2 делится' : 'нечётная, значит, на 2 не делится'}.`, `Сумма цифр ${digitSum(n)} ${digitSum(n) % 3 === 0 ? 'делится' : 'не делится'} на 3.`, yes ? 'Оба условия выполнены.' : 'Хотя бы одно условие не выполнено.'],
    hints: ['6 = 2 · 3, проверь оба признака.'],
  };
};

// ---------- уравнения ----------
const eqSimple: Generator = (rng) => {
  const kind = randInt(rng, 1, 5);
  const x = randInt(rng, 2, 40);
  const a = randInt(rng, 2, 30);
  if (kind === 1) return { type: 'input', question: `Реши уравнение: x + ${a} = ${x + a}`, answer: x, explanation: ['x — неизвестное слагаемое. Чтобы его найти, из суммы вычитаем известное слагаемое.', `x = ${x + a} − ${a} = ${x}.`, `Проверка: ${x} + ${a} = ${x + a} ✓`], hints: ['Неизвестное слагаемое = сумма − известное слагаемое.'] };
  if (kind === 2) return { type: 'input', question: `Реши уравнение: x − ${a} = ${x}`, answer: x + a, explanation: ['x — неизвестное уменьшаемое. Чтобы его найти, к разности прибавляем вычитаемое.', `x = ${x} + ${a} = ${x + a}.`, `Проверка: ${x + a} − ${a} = ${x} ✓`], hints: ['Уменьшаемое = разность + вычитаемое.'] };
  if (kind === 3) return { type: 'input', question: `Реши уравнение: ${x + a} − x = ${a}`, answer: x, explanation: ['x — неизвестное вычитаемое. Чтобы его найти, из уменьшаемого вычитаем разность.', `x = ${x + a} − ${a} = ${x}.`, `Проверка: ${x + a} − ${x} = ${a} ✓`], hints: ['Вычитаемое = уменьшаемое − разность.'] };
  const m = randInt(rng, 2, 9);
  if (kind === 4) return { type: 'input', question: `Реши уравнение: ${m} · x = ${m * x}`, answer: x, explanation: ['x — неизвестный множитель. Чтобы его найти, произведение делим на известный множитель.', `x = ${m * x} : ${m} = ${x}.`, `Проверка: ${m} · ${x} = ${m * x} ✓`], hints: ['Множитель = произведение : известный множитель.'] };
  return { type: 'input', question: `Реши уравнение: x : ${m} = ${x}`, answer: x * m, explanation: ['x — неизвестное делимое. Чтобы его найти, частное умножаем на делитель.', `x = ${x} · ${m} = ${x * m}.`, `Проверка: ${x * m} : ${m} = ${x} ✓`], hints: ['Делимое = частное · делитель.'] };
};

const eqTwoStep: Generator = (rng) => {
  const x = randInt(rng, 2, 20);
  const a = randInt(rng, 2, 9);
  const b = randInt(rng, 1, 30);
  return {
    type: 'input',
    question: `Реши уравнение: ${a} · x + ${b} = ${a * x + b}`,
    answer: x,
    explanation: [`Сначала найдём слагаемое ${a} · x: ${a * x + b} − ${b} = ${a * x}.`, `Теперь ${a} · x = ${a * x}, значит x = ${a * x} : ${a} = ${x}.`, `Проверка: ${a} · ${x} + ${b} = ${a * x + b} ✓`],
    hints: ['Сначала найди, чему равно произведение a · x.', 'Потом найди неизвестный множитель.'],
  };
};

const eqRoot: Generator = (rng) => {
  const x = randInt(rng, 3, 30);
  const a = randInt(rng, 2, 20);
  const ok = rng() < 0.5;
  const k = ok ? x : x + pick(rng, [-2, -1, 1, 2, 3]);
  return {
    type: 'truefalse',
    question: `Число ${k} является корнем уравнения x + ${a} = ${x + a}.`,
    answer: k === x,
    explanation: [`Подставим ${k} вместо x: ${k} + ${a} = ${k + a}.`, `Правая часть равна ${x + a}. ${k + a === x + a ? 'Равенство верное — это корень.' : 'Равенство неверное — это не корень.'}`],
    hints: ['Корень — число, при подстановке которого получается верное равенство.'],
  };
};

const eqWord2: Generator = (rng) => {
  const x = randInt(rng, 5, 30);
  const m = randInt(rng, 2, 6);
  const a = randInt(rng, 1, m * x - 1);
  return {
    type: 'input',
    question: `Я задумал число. Если его умножить на ${m} и вычесть ${a}, получится ${m * x - a}. Какое число я задумал?`,
    answer: x,
    explanation: [`Пусть задуманное число — x. Тогда ${m} · x − ${a} = ${m * x - a}.`, `Уменьшаемое: ${m} · x = ${m * x - a} + ${a} = ${m * x}.`, `x = ${m * x} : ${m} = ${x}.`],
    hints: ['Запиши уравнение.', 'Иди от конца к началу: сделай обратные действия.'],
  };
};

export const math2Generators: Record<string, Generator> = {
  'math.power.compute': powerCompute,
  'math.power.write': powerWrite,
  'math.power.compare': powerCompare,
  'math.power.square': powerSquare,
  'math.gcdlcm.divisors': countDivisors,
  'math.gcdlcm.gcd': gcdGen,
  'math.gcdlcm.lcm': lcmGen,
  'math.gcdlcm.lcmProblem': lcmProblem,
  'math.gcdlcm.gcdProblem': gcdProblem,
  'math.div.can': divCan,
  'math.div.choose': divChoose,
  'math.div.digit': divDigit,
  'math.div.six': divSix,
  'math.eq.simple': eqSimple,
  'math.eq.twoStep': eqTwoStep,
  'math.eq.root': eqRoot,
  'math.eq.word': eqWord2,
};
