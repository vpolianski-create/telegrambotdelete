import { pick, randInt, shuffle, type Rng } from '../engine/rng';
import { fmt, type Generator } from './math';
import { plural } from './math3';

const SUP2 = '²';
const uniq = <T,>(arr: T[]) => [...new Set(arr)];
const isPrime = (n: number) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const factorize = (n: number) => { const f: number[] = []; for (let p = 2; p * p <= n; p++) while (n % p === 0) { f.push(p); n /= p; } if (n > 1) f.push(n); return f; };

// ---------- §8 Сложение и вычитание ----------
const addColumn: Generator = (rng, d) => {
  const lo = d === 'basic' ? 1000 : 100000;
  const hi = d === 'basic' ? 9999 : 999999;
  const a = randInt(rng, lo, hi);
  const b = randInt(rng, lo, hi);
  const sub = rng() < 0.5;
  const [x, y] = sub && a < b ? [b, a] : [a, b];
  return {
    type: 'input',
    question: `Вычисли: ${fmt(x)} ${sub ? '−' : '+'} ${fmt(y)}`,
    answer: sub ? x - y : x + y,
    explanation: [`Записываем числа в столбик: разряд под разрядом, единицы под единицами.`, sub ? 'Вычитаем по разрядам справа налево. Если цифры не хватает — занимаем единицу в соседнем разряде.' : 'Складываем по разрядам справа налево. Если сумма больше 9 — переносим единицу в следующий разряд.', `${fmt(x)} ${sub ? '−' : '+'} ${fmt(y)} = ${fmt(sub ? x - y : x + y)}.`],
    hints: ['Запиши числа в столбик и начни с единиц.'],
  };
};

const addSmart: Generator = (rng) => {
  const x = randInt(rng, 11, 89);
  const y = randInt(rng, 11, 89);
  const base = pick(rng, [100, 100, 1000]);
  const x2 = base - x;
  const y2 = base - y;
  const list = shuffle(rng, [x, y, x2, y2]);
  return {
    type: 'input',
    question: `Вычисли удобным способом: ${list.map(fmt).join(' + ')}`,
    answer: 2 * base,
    explanation: ['Складываем числа в удобном порядке (переместительный и сочетательный законы).', `${x} + ${x2} = ${base} и ${y} + ${y2} = ${base}.`, `${base} + ${base} = ${2 * base}.`],
    hints: ['Найди два числа, которые вместе дают круглое число.'],
  };
};

const addDiff: Generator = (rng) => {
  const b = randInt(rng, 1000, 8999);
  const diff = randInt(rng, 50, 999);
  return { type: 'input', question: `На сколько число ${fmt(b + diff)} больше числа ${fmt(b)}?`, answer: diff, explanation: ['Чтобы узнать, на сколько одно число больше другого, нужно из большего вычесть меньшее.', `${fmt(b + diff)} − ${fmt(b)} = ${fmt(diff)}.`], hints: ['Из большего числа вычти меньшее.'] };
};

const addProperty: Generator = (rng) => {
  const a = randInt(rng, 40, 99);
  const b = randInt(rng, 3, 20);
  const c = randInt(rng, 3, 20);
  const forms: [string, number, string, number, string][] = [
    [`${a} − (${b} + ${c})`, a - (b + c), `${a} − ${b} − ${c}`, a - b - c, 'Чтобы вычесть сумму, можно вычесть каждое слагаемое по очереди.'],
    [`${a} − (${b} + ${c})`, a - (b + c), `${a} − ${b} + ${c}`, a - b + c, 'Вычитая сумму, нельзя прибавлять второе слагаемое: оба нужно вычесть.'],
    [`${a} − (${b + c} − ${c})`, a - (b + c - c), `${a} − ${b + c} − ${c}`, a - (b + c) - c, 'Вычитая разность, второе число нужно прибавить, а не вычитать.'],
    [`${a} − (${b + c} − ${c})`, a - (b + c - c), `${a} − ${b + c} + ${c}`, a - (b + c) + c, 'Вычитая разность, мы вычитаем уменьшаемое и возвращаем вычитаемое.'],
  ];
  const [l, lv, r, rv, why] = pick(rng, forms);
  return { type: 'truefalse', question: `Верно ли равенство: ${l} = ${r}?`, answer: lv === rv, explanation: [`Левая часть: ${l} = ${lv}.`, `Правая часть: ${r} = ${rv}.`, lv === rv ? `Значения равны, равенство верное. ${why}` : `Значения разные, равенство неверное. ${why}`], hints: ['Вычисли значения обеих частей и сравни их.'] };
};

// ---------- §9 Умножение и деление ----------
const mulBasic: Generator = (rng, d) => {
  const a = d === 'basic' ? randInt(rng, 120, 999) : randInt(rng, 120, 999);
  const b = d === 'basic' ? randInt(rng, 3, 9) : randInt(rng, 12, 48);
  return { type: 'input', question: `Вычисли: ${fmt(a)} · ${b}`, answer: a * b, explanation: [`Умножаем по разрядам: на ${b} умножаем единицы, десятки, сотни и складываем результаты.`, `${fmt(a)} · ${b} = ${fmt(a * b)}.`], hints: ['Разложи число на разряды: сотни, десятки, единицы.', 'Умножь каждый разряд на второй множитель и сложи.'] };
};

const divExact: Generator = (rng, d) => {
  const b = d === 'basic' ? randInt(rng, 3, 9) : randInt(rng, 12, 25);
  const q = d === 'basic' ? randInt(rng, 12, 150) : randInt(rng, 20, 120);
  return { type: 'input', question: `Вычисли: ${fmt(b * q)} : ${b}`, answer: q, explanation: ['Делим по шагам, начиная с высшего разряда.', `${fmt(b * q)} : ${b} = ${q}.`, `Проверка: ${q} · ${b} = ${fmt(b * q)} ✓`], hints: ['Подбери число, которое при умножении на делитель даёт делимое.'] };
};

const mulSmart: Generator = (rng) => {
  const kind = pick(rng, [[25, 4], [125, 8], [5, 20], [50, 2]] as [number, number][]);
  const x = randInt(rng, 3, 19);
  const [p, q] = kind;
  const pr = p * q;
  return { type: 'input', question: `Вычисли удобным способом: ${p} · ${x} · ${q}`, answer: p * x * q, explanation: ['Меняем порядок множителей (переместительный закон), чтобы получить круглое число.', `${p} · ${q} = ${pr}, потом ${pr} · ${x} = ${fmt(pr * x)}.`], hints: [`${p} · ${q} даёт круглое число.`] };
};

const mulDistrib: Generator = (rng) => {
  const near = pick(rng, [98, 99, 101, 102, 198, 199]);
  const base = near < 150 ? 100 : 200;
  const diff = near - base;
  const k = randInt(rng, 3, 9);
  return { type: 'input', question: `Вычисли, используя распределительный закон: ${k} · ${near}`, answer: k * near, explanation: [`Представим ${near} = ${base} ${diff < 0 ? '−' : '+'} ${Math.abs(diff)}.`, `${k} · ${near} = ${k} · ${base} ${diff < 0 ? '−' : '+'} ${k} · ${Math.abs(diff)} = ${k * base} ${diff < 0 ? '−' : '+'} ${k * Math.abs(diff)} = ${k * near}.`], hints: ['Замени число на «круглое плюс малое» или «круглое минус малое».'] };
};

const mulZero: Generator = (rng) => {
  const a = randInt(rng, 2, 99);
  const list: [string, boolean, string][] = [
    [`${a} · 0 = 0`, true, 'Произведение с нулём всегда равно нулю.'],
    [`0 : ${a} = 0`, true, 'Нуль, делённый на любое число, кроме нуля, равен нулю.'],
    [`${a} : 0 = 0`, false, 'На нуль делить нельзя. Такого действия не существует.'],
    [`${a} : 0 = ${a}`, false, 'На нуль делить нельзя ни в каком случае.'],
    [`${a} · 1 = ${a}`, true, 'Умножение на единицу не меняет число.'],
    [`${a} : 1 = ${a}`, true, 'Деление на единицу не меняет число.'],
    [`${a} + 0 = 0`, false, 'Прибавление нуля не меняет число: получится само число.'],
  ];
  const [q, ans, why] = pick(rng, list);
  return { type: 'truefalse', question: `Верно ли равенство: ${q}?`, answer: ans, explanation: [why], hints: ['Вспомни особые случаи с нулём и единицей.'] };
};

// ---------- §14 Простые и составные ----------
const primeIs: Generator = (rng, d) => {
  const n = randInt(rng, 11, d === 'basic' ? 60 : 130);
  const p = isPrime(n);
  const f = factorize(n);
  return { type: 'truefalse', question: `Число ${n} — простое.`, answer: p, explanation: p ? [`Проверяем делители: ${n} не делится ни на какое число, кроме 1 и ${n}.`, 'Значит, число простое.'] : [`${n} делится на ${f[0]}: ${n} : ${f[0]} = ${n / f[0]}.`, 'У числа есть делитель, кроме 1 и самого числа, поэтому оно составное.'], hints: ['Проверь деление на 2, 3, 5, 7.'] };
};

const primeChoose: Generator = (rng, d) => {
  const range = d === 'basic' ? [11, 70] : [30, 150];
  let good = 0;
  while (!isPrime(good)) good = randInt(rng, range[0], range[1]);
  const bad = new Set<number>();
  while (bad.size < 3) { const n = randInt(rng, range[0], range[1]); if (!isPrime(n)) bad.add(n); }
  return { type: 'single', question: 'Какое из чисел простое?', options: shuffle(rng, [good, ...bad]).map(String), answer: String(good), explanation: [`${good} делится только на 1 и на само себя — это простое число.`, ...[...bad].map((b) => `${b} = ${factorize(b).join(' · ')} — составное.`)], hints: ['Простое число не делится ни на что, кроме 1 и себя.'] };
};

const primeFactorCount: Generator = (rng) => {
  let n = 4;
  while (isPrime(n) || n < 12) n = randInt(rng, 12, 100);
  const f = factorize(n);
  return { type: 'input', question: `Разложи число ${n} на простые множители. Сколько всего множителей получилось (повторяющиеся считай каждый раз)?`, answer: f.length, explanation: [`Делим на наименьшие простые числа: ${f.reduce((acc, p) => { acc.rest /= p; acc.steps.push(`${acc.rest * p} : ${p} = ${acc.rest}`); return acc; }, { rest: n, steps: [] as string[] }).steps.join('; ')}.`, `${n} = ${f.join(' · ')}.`, `Множителей: ${f.length}.`], hints: ['Начни делить на 2, потом на 3, на 5…'] };
};

const primeLargest: Generator = (rng) => {
  let n = 4;
  while (isPrime(n) || n < 20) n = randInt(rng, 20, 200);
  const f = factorize(n);
  return { type: 'input', question: `Найди наибольший простой множитель числа ${n}.`, answer: Math.max(...f), explanation: [`Раскладываем: ${n} = ${f.join(' · ')}.`, `Наибольший простой множитель — ${Math.max(...f)}.`], hints: ['Разложи число на простые множители.'] };
};

const primeCount: Generator = (rng) => {
  const a = randInt(rng, 2, 60);
  const b = a + randInt(rng, 10, 25);
  const list = Array.from({ length: b - a + 1 }, (_, i) => a + i).filter(isPrime);
  return { type: 'input', question: `Сколько простых чисел в промежутке от ${a} до ${b} (включая концы)?`, answer: list.length, explanation: [list.length ? `Простые числа в этом промежутке: ${list.join(', ')}.` : 'Простых чисел в этом промежутке нет.', `Всего: ${list.length}.`], hints: ['Проверяй каждое число: нет ли у него делителей, кроме 1 и себя.'] };
};

// ---------- §15 Числовые выражения ----------
interface Expr { text: string; steps: string[]; value: number }
const exprs: ((rng: Rng) => Expr)[] = [
  (r) => { const a = randInt(r, 5, 60), b = randInt(r, 2, 12), c = randInt(r, 2, 9); return { text: `${a} + ${b} · ${c}`, steps: [`Сначала умножение: ${b} · ${c} = ${b * c}.`, `Потом сложение: ${a} + ${b * c} = ${a + b * c}.`], value: a + b * c }; },
  (r) => { const a = randInt(r, 3, 40), b = randInt(r, 2, 30), c = randInt(r, 2, 9); return { text: `(${a} + ${b}) · ${c}`, steps: [`Сначала действие в скобках: ${a} + ${b} = ${a + b}.`, `Потом умножение: ${a + b} · ${c} = ${(a + b) * c}.`], value: (a + b) * c }; },
  (r) => { const c = randInt(r, 2, 9), q = randInt(r, 2, 12), a = randInt(r, q + 1, 90); return { text: `${a} − ${c * q} : ${c}`, steps: [`Сначала деление: ${c * q} : ${c} = ${q}.`, `Потом вычитание: ${a} − ${q} = ${a - q}.`], value: a - q }; },
  (r) => { const a = randInt(r, 3, 15), b = randInt(r, 3, 9), d = randInt(r, 2, 6), q = randInt(r, 2, 9); return { text: `${a} · ${b} − ${d * q} : ${d}`, steps: [`Сначала умножение: ${a} · ${b} = ${a * b}, и деление: ${d * q} : ${d} = ${q}.`, `Потом вычитание: ${a * b} − ${q} = ${a * b - q}.`], value: a * b - q }; },
  (r) => { const c = randInt(r, 2, 9), q = randInt(r, 2, 12), b = randInt(r, 5, 40), d = randInt(r, 2, 30); return { text: `(${c * q + b} − ${b}) : ${c} + ${d}`, steps: [`В скобках: ${c * q + b} − ${b} = ${c * q}.`, `Деление: ${c * q} : ${c} = ${q}.`, `Сложение: ${q} + ${d} = ${q + d}.`], value: q + d }; },
  (r) => { const a = randInt(r, 5, 40), b = randInt(r, 2, 9), c = randInt(r, 6, 20), d = randInt(r, 2, 5); return { text: `${a} + ${b} · (${c} − ${d})`, steps: [`В скобках: ${c} − ${d} = ${c - d}.`, `Умножение: ${b} · ${c - d} = ${b * (c - d)}.`, `Сложение: ${a} + ${b * (c - d)} = ${a + b * (c - d)}.`], value: a + b * (c - d) }; },
  (r) => { const b = randInt(r, 2, 9), q = randInt(r, 2, 9), c = randInt(r, 2, 9); return { text: `${b * q} : ${b} · ${c}`, steps: [`Деление и умножение выполняем слева направо.`, `Сначала ${b * q} : ${b} = ${q}.`, `Потом ${q} · ${c} = ${q * c}.`], value: q * c }; },
];
const exprValue: Generator = (rng, d) => {
  const e = exprs[randInt(rng, 0, d === 'basic' ? 2 : exprs.length - 1)](rng);
  return { type: 'input', question: `Найди значение выражения: ${e.text}`, answer: e.value, explanation: ['Порядок действий: сначала скобки, потом умножение и деление (слева направо), в конце сложение и вычитание.', ...e.steps], hints: ['Сначала найди, какое действие выполняется первым.'] };
};

const exprFirst: Generator = (rng) => {
  const a = randInt(rng, 5, 30), b = randInt(rng, 2, 12), c = randInt(rng, 2, 9), dd = randInt(rng, 2, 9);
  const t = randInt(rng, 1, 4);
  const pack = (text: string, ans: string, others: string[]) => ({ type: 'single' as const, question: `Какое действие в выражении ${text} нужно выполнить первым?`, options: shuffle(rng, uniq([ans, ...others])), answer: ans, explanation: ['Сначала выполняют действия в скобках, потом умножение и деление, потом сложение и вычитание.', `Первым выполняем ${ans}.`], hints: ['Ищи скобки. Если их нет — умножение или деление.'] });
  if (t === 1) return pack(`${a} + ${b} · ${c}`, `${b} · ${c}`, [`${a} + ${b}`, `${a} + ${c}`, `${a} · ${c}`]);
  if (t === 2) return pack(`(${a} + ${b}) · ${c}`, `${a} + ${b}`, [`${b} · ${c}`, `${a} · ${c}`, `${a} + ${c}`]);
  if (t === 3) return pack(`${a + b} − ${b} : ${c}`, `${b} : ${c}`, [`${a + b} − ${b}`, `${a + b} − ${c}`, `${a + b} : ${c}`]);
  return pack(`${a} − (${b} + ${c}) · ${dd}`, `${b} + ${c}`, [`${a} − ${b}`, `(${b} + ${c}) · ${dd}`, `${c} · ${dd}`]);
};

const exprCompose: Generator = (rng) => {
  const a = randInt(rng, 5, 40), b = randInt(rng, 2, 30), c = randInt(rng, 2, 9);
  const k = randInt(rng, 1, 3);
  if (k === 1) return { type: 'input', question: `Из суммы чисел ${a} и ${b} вычти ${Math.min(c, a + b)}. Чему равен результат?`, answer: a + b - Math.min(c, a + b), explanation: [`Сумма чисел ${a} и ${b}: ${a} + ${b} = ${a + b}.`, `Вычитаем: ${a + b} − ${Math.min(c, a + b)} = ${a + b - Math.min(c, a + b)}.`, `Выражение: (${a} + ${b}) − ${Math.min(c, a + b)}.`], hints: ['«Сумма» — это сложение.'] };
  if (k === 2) return { type: 'input', question: `Число ${a} умножили на сумму чисел ${b} и ${c}. Чему равно получившееся число?`, answer: a * (b + c), explanation: [`Сумма: ${b} + ${c} = ${b + c}.`, `Произведение: ${a} · ${b + c} = ${a * (b + c)}.`, `Выражение: ${a} · (${b} + ${c}).`], hints: ['Сначала найди сумму, потом умножь.'] };
  return { type: 'input', question: `К произведению чисел ${b} и ${c} прибавили ${a}. Чему равна получившаяся сумма?`, answer: b * c + a, explanation: [`Произведение: ${b} · ${c} = ${b * c}.`, `Сумма: ${b * c} + ${a} = ${b * c + a}.`, `Выражение: ${b} · ${c} + ${a}.`], hints: ['Сначала найди произведение.'] };
};

// ---------- §16 Выражения с переменными ----------
const varValue: Generator = (rng, d) => {
  const a = randInt(rng, 2, 12);
  const k = randInt(rng, 2, 9);
  const b = randInt(rng, 1, 15);
  const f = randInt(rng, 1, d === 'basic' ? 2 : 4);
  if (f === 1) return { type: 'input', question: `Найди значение выражения ${k}a + ${b} при a = ${a}.`, answer: k * a + b, explanation: [`Подставляем a = ${a}: ${k} · ${a} + ${b}.`, `${k} · ${a} = ${k * a}, потом ${k * a} + ${b} = ${k * a + b}.`], hints: ['Запись «ka» означает «k умножить на a».'] };
  if (f === 2) { const bb = Math.min(b, k * a); return { type: 'input', question: `Найди значение выражения ${k}x − ${bb} при x = ${a}.`, answer: k * a - bb, explanation: [`Подставляем x = ${a}: ${k} · ${a} − ${bb}.`, `${k} · ${a} = ${k * a}, потом ${k * a} − ${bb} = ${k * a - bb}.`], hints: ['Сначала умножение, потом вычитание.'] }; }
  if (f === 3) return { type: 'input', question: `Найди значение выражения (n + ${b}) · ${k} при n = ${a}.`, answer: (a + b) * k, explanation: [`Подставляем n = ${a}: (${a} + ${b}) · ${k}.`, `В скобках: ${a + b}. Умножаем: ${a + b} · ${k} = ${(a + b) * k}.`], hints: ['Сначала скобки.'] };
  return { type: 'input', question: `Найди значение выражения m · m + ${b} при m = ${a}.`, answer: a * a + b, explanation: [`Подставляем m = ${a}: ${a} · ${a} + ${b}.`, `${a} · ${a} = ${a * a}, потом ${a * a} + ${b} = ${a * a + b}.`], hints: ['m · m — это m во второй степени.'] };
};

const varWord: Generator = (rng) => {
  const k = randInt(rng, 3, 9);
  const t = randInt(rng, 1, 5);
  const o = (ans: string, ...others: string[]) => shuffle(rng, uniq([ans, ...others]));
  if (t === 1) return { type: 'single', question: `В одной коробке a карандашей. Выбери выражение для числа карандашей в ${k} таких коробках.`, options: o(`${k}a`, `a + ${k}`, `a − ${k}`, `a : ${k}`), answer: `${k}a`, explanation: [`Одинаковые коробки — значит, умножение.`, `${k} коробок по a карандашей: ${k} · a, то есть ${k}a.`], hints: ['«В несколько раз больше» — это умножение.'] };
  if (t === 2) return { type: 'single', question: `У Пети a марок, а у Васи на ${k} марок больше. Выбери выражение для числа марок у Васи.`, options: o(`a + ${k}`, `a − ${k}`, `${k}a`, `a : ${k}`), answer: `a + ${k}`, explanation: ['«На несколько больше» — это сложение.', `Марок у Васи: a + ${k}.`], hints: ['Слова «на … больше» подсказывают сложение.'] };
  if (t === 3) return { type: 'single', question: `Книга стоит b руб. Покупатель дал c руб. Выбери выражение для суммы сдачи.`, options: o('c − b', 'b − c', 'b + c', 'b · c'), answer: 'c − b', explanation: ['Сдача — это то, что останется после оплаты.', 'Из того, что дали (c), вычитаем цену (b): c − b.'], hints: ['Сдача равна «дал минус цена».'] };
  if (t === 4) return { type: 'single', question: `Тетрадь стоит a руб., ручка — b руб. Выбери выражение для стоимости ${k} тетрадей и 2 ручек.`, options: o(`${k}a + 2b`, `${k + 2}ab`, `${k}a + b`, `(${k} + 2)(a + b)`), answer: `${k}a + 2b`, explanation: [`За тетради: ${k} · a = ${k}a.`, 'За ручки: 2 · b = 2b.', `Всего: ${k}a + 2b.`], hints: ['Найди отдельно стоимость тетрадей и ручек, потом сложи.'] };
  return { type: 'single', question: `Пете a лет, а папа старше него на ${k * 3} лет. Выбери выражение для суммы возрастов Пети и папы.`, options: o(`2a + ${k * 3}`, `a + ${k * 3}`, `2a − ${k * 3}`, `${k * 3}a`), answer: `2a + ${k * 3}`, explanation: [`Папе: a + ${k * 3} лет.`, `Вместе: a + (a + ${k * 3}) = 2a + ${k * 3}.`], hints: ['Сначала выясни, сколько лет папе.'] };
};

const varSimplify: Generator = (rng) => {
  const a = randInt(rng, 2, 9);
  const b = randInt(rng, 2, 9);
  const minus = rng() < 0.4 && a > b;
  const res = minus ? a - b : a + b;
  const ans = `${res}x`;
  return { type: 'single', question: `Упрости выражение: ${a}x ${minus ? '−' : '+'} ${b}x`, options: shuffle(rng, uniq([ans, `${a * b}x`, `${res}`, `${res}x${SUP2}`])), answer: ans, explanation: ['Слагаемые с одинаковой буквенной частью можно объединять: складываем (или вычитаем) числовые коэффициенты.', `${a}x ${minus ? '−' : '+'} ${b}x = (${a} ${minus ? '−' : '+'} ${b})x = ${res}x.`], hints: [`Подумай: ${a} иксов ${minus ? 'без' : 'и ещё'} ${b} иксов — сколько иксов получится?`] };
};

// ---------- §18 Формулы ----------
const formulaApply: Generator = (rng, d) => {
  const t = randInt(rng, 1, 6);
  const a = randInt(rng, 2, d === 'basic' ? 12 : 30);
  const b = randInt(rng, 2, d === 'basic' ? 12 : 30);
  if (t === 1) return { type: 'input', question: `Путь вычисляют по формуле s = v · t. Найди s при v = ${a * 3} км/ч и t = ${b % 9 + 2} ч.`, answer: a * 3 * (b % 9 + 2), explanation: [`Подставляем: s = ${a * 3} · ${b % 9 + 2}.`, `s = ${a * 3 * (b % 9 + 2)} (км).`], hints: ['Подставь числа вместо букв.'] };
  if (t === 2) return { type: 'input', question: `Периметр квадрата P = 4 · a. Найди P при a = ${a} см.`, answer: 4 * a, explanation: [`Подставляем: P = 4 · ${a} = ${4 * a} (см).`, 'У квадрата четыре равные стороны.'], hints: ['У квадрата четыре равные стороны.'] };
  if (t === 3) return { type: 'input', question: `Площадь прямоугольника S = a · b. Найди S при a = ${a} см, b = ${b} см.`, answer: a * b, explanation: [`Подставляем: S = ${a} · ${b} = ${a * b} (см²).`], hints: ['Площадь прямоугольника — произведение его сторон.'] };
  if (t === 4) return { type: 'input', question: `Периметр прямоугольника P = 2 · (a + b). Найди P при a = ${a} см, b = ${b} см.`, answer: 2 * (a + b), explanation: [`Подставляем: P = 2 · (${a} + ${b}).`, `Сначала скобки: ${a + b}. Потом ${2} · ${a + b} = ${2 * (a + b)} (см).`], hints: ['Сначала выполни действие в скобках.'] };
  if (t === 5) return { type: 'input', question: `Стоимость покупки C = n · p, где n — количество, p — цена. Найди C при n = ${a} шт. и p = ${b} руб.`, answer: a * b, explanation: [`Подставляем: C = ${a} · ${b} = ${a * b} (руб.).`], hints: ['Стоимость = количество · цена.'] };
  return { type: 'input', question: `Формула y = 3x + 5. Найди y при x = ${a}.`, answer: 3 * a + 5, explanation: [`Подставляем: y = 3 · ${a} + 5.`, `Умножение: ${3 * a}. Сложение: ${3 * a} + 5 = ${3 * a + 5}.`], hints: ['Сначала умножение, потом сложение.'] };
};

const formulaFind: Generator = (rng) => {
  const t = randInt(rng, 1, 4);
  const v = randInt(rng, 4, 60);
  const tt = randInt(rng, 2, 9);
  const a = randInt(rng, 3, 40);
  const b = randInt(rng, 3, 40);
  if (t === 1) return { type: 'input', question: `По формуле s = v · t найди скорость v, если s = ${v * tt} км и t = ${tt} ч.`, answer: v, explanation: ['Неизвестный множитель = произведение : известный множитель.', `v = ${v * tt} : ${tt} = ${v}.`], hints: ['Чтобы найти множитель, раздели произведение на другой множитель.'] };
  if (t === 2) return { type: 'input', question: `По формуле s = v · t найди время t, если s = ${v * tt} км и v = ${v} км/ч.`, answer: tt, explanation: ['Неизвестный множитель = произведение : известный множитель.', `t = ${v * tt} : ${v} = ${tt}.`], hints: ['Раздели расстояние на скорость.'] };
  if (t === 3) return { type: 'input', question: `Периметр прямоугольника P = 2 · (a + b). Найди b, если P = ${2 * (a + b)} см и a = ${a} см.`, answer: b, explanation: [`Подставим: ${2 * (a + b)} = 2 · (${a} + b).`, `Значит, ${a} + b = ${2 * (a + b)} : 2 = ${a + b}.`, `b = ${a + b} − ${a} = ${b}.`], hints: ['Сначала найди, чему равна сумма сторон a + b.'] };
  return { type: 'input', question: `Площадь прямоугольника S = a · b. Найди b, если S = ${a * b} см² и a = ${a} см.`, answer: b, explanation: ['Неизвестный множитель = произведение : известный множитель.', `b = ${a * b} : ${a} = ${b}.`], hints: ['Раздели площадь на известную сторону.'] };
};

const formulaCube: Generator = (rng, d) => {
  const a = randInt(rng, 2, d === 'basic' ? 5 : 9);
  return { type: 'input', question: `Объём куба вычисляют по формуле V = a · a · a. Найди объём куба с ребром ${a} см (в см³).`, answer: a ** 3, explanation: [`V = ${a} · ${a} · ${a}.`, `${a} · ${a} = ${a * a}, потом ${a * a} · ${a} = ${a ** 3} (см³).`], hints: ['Ребро берём три раза как множитель.'] };
};

// ---------- §19 Задачи уравнениями ----------
const eqWordSimple: Generator = (rng) => {
  const x = randInt(rng, 6, 60);
  const a = randInt(rng, 3, 30);
  const m = randInt(rng, 2, 9);
  const t = randInt(rng, 1, 4);
  if (t === 1) return { type: 'input', question: `У Максима было несколько марок. Когда ему подарили ${a} марок, у него стало ${x + a}. Сколько марок было сначала?`, answer: x, explanation: ['Пусть сначала было x марок.', `Составим уравнение: x + ${a} = ${x + a}.`, `x = ${x + a} − ${a} = ${x}.`, `Проверка: ${x} + ${a} = ${x + a} ✓. Ответ: ${x} марок.`], hints: ['Обозначь неизвестное число буквой x и составь уравнение.'] };
  if (t === 2) return { type: 'input', question: `В автобусе ехало несколько пассажиров. На остановке вышли ${a}, и осталось ${x}. Сколько пассажиров ехало сначала?`, answer: x + a, explanation: ['Пусть сначала ехало x пассажиров.', `Составим уравнение: x − ${a} = ${x}.`, `x = ${x} + ${a} = ${x + a}.`, `Проверка: ${x + a} − ${a} = ${x} ✓. Ответ: ${x + a} пассажиров.`], hints: ['Что осталось + что вышло = сколько было.'] };
  if (t === 3) return { type: 'input', question: `В ${m} одинаковых коробках лежит поровну конфет, всего ${m * x} конфет. Сколько конфет в одной коробке?`, answer: x, explanation: ['Пусть в одной коробке x конфет.', `Составим уравнение: ${m} · x = ${m * x}.`, `x = ${m * x} : ${m} = ${x}.`, `Проверка: ${m} · ${x} = ${m * x} ✓. Ответ: ${x} конфет.`], hints: ['Количество коробок умножить на конфеты в одной = всего конфет.'] };
  return { type: 'input', question: `Несколько яблок разложили поровну на ${m} тарелок, на каждой оказалось по ${x} яблок. Сколько яблок было всего?`, answer: m * x, explanation: ['Пусть всего было y яблок.', `Составим уравнение: y : ${m} = ${x}.`, `y = ${x} · ${m} = ${m * x}.`, `Проверка: ${m * x} : ${m} = ${x} ✓. Ответ: ${m * x} яблок.`], hints: ['Делимое = частное · делитель.'] };
};

const eqWordTwo: Generator = (rng, d) => {
  const x = randInt(rng, 8, 60);
  const diff = randInt(rng, 2, 20);
  const ask = d !== 'basic' && rng() < 0.5;
  return { type: 'input', question: `В двух коробках вместе ${2 * x + diff} карандашей. В первой на ${diff} карандашей больше, чем во второй. Сколько карандашей ${ask ? 'в первой' : 'во второй'} коробке?`, answer: ask ? x + diff : x, explanation: ['Пусть во второй коробке x карандашей, тогда в первой x + ' + diff + '.', `Уравнение: x + (x + ${diff}) = ${2 * x + diff}, то есть 2x + ${diff} = ${2 * x + diff}.`, `2x = ${2 * x + diff} − ${diff} = ${2 * x}, значит x = ${x}.`, ask ? `В первой: ${x} + ${diff} = ${x + diff}.` : `Во второй: ${x}.`, `Проверка: ${x} + ${x + diff} = ${2 * x + diff} ✓`], hints: ['Обозначь буквой меньшее количество.'] };
};

const eqWordRatio: Generator = (rng) => {
  const x = randInt(rng, 2, 9);
  const m = randInt(rng, 2, 5);
  return { type: 'input', question: `Арбуз в ${m} ${m < 5 ? 'раза' : 'раз'} тяжелее дыни, вместе они весят ${x * (m + 1)} кг. Сколько килограммов весит дыня?`, answer: x, explanation: ['Пусть дыня весит x кг, тогда арбуз — ' + m + 'x кг.', `Уравнение: x + ${m}x = ${x * (m + 1)}, то есть ${m + 1}x = ${x * (m + 1)}.`, `x = ${x * (m + 1)} : ${m + 1} = ${x}.`, `Проверка: ${x} + ${m * x} = ${x * (m + 1)} ✓`], hints: ['Всего получается (m + 1) одинаковых частей.'] };
};

// ---------- §20 Углы ----------
const angleType: Generator = (rng) => {
  const pool = [20, 35, 45, 60, 75, 90, 100, 120, 135, 150, 170, 180];
  const m = pick(rng, pool);
  const ans = m < 90 ? 'острый' : m === 90 ? 'прямой' : m < 180 ? 'тупой' : 'развёрнутый';
  return { type: 'single', question: `Какой это угол: ${m}°?`, options: ['острый', 'прямой', 'тупой', 'развёрнутый'], answer: ans, explanation: ['Острый угол меньше 90°, прямой равен 90°, тупой больше 90°, но меньше 180°, развёрнутый равен 180°.', `${m}° — это ${ans} угол.`], hints: ['Сравни градусную меру с 90° и 180°.'] };
};

const angleAdjacent: Generator = (rng) => {
  const x = randInt(rng, 10, 170);
  return { type: 'input', question: `Два угла — смежные, вместе они образуют развёрнутый угол. Один из них равен ${x}°. Найди второй (в градусах).`, answer: 180 - x, explanation: ['Сумма смежных углов равна развёрнутому углу, то есть 180°.', `180° − ${x}° = ${180 - x}°.`], hints: ['Развёрнутый угол равен 180°.'] };
};

const angleSum: Generator = (rng, d) => {
  const a = randInt(rng, 15, 85);
  const b = randInt(rng, 15, 85);
  if (d === 'basic' || rng() < 0.5) return { type: 'input', question: `Луч OB лежит внутри угла AOC. ∠AOB = ${a}°, ∠BOC = ${b}°. Найди ∠AOC (в градусах).`, answer: a + b, explanation: ['Луч, проведённый внутри угла, делит его на части. Величина всего угла равна сумме величин частей.', `∠AOC = ${a}° + ${b}° = ${a + b}°.`], hints: ['Складываем части угла.'] };
  return { type: 'input', question: `Луч OB лежит внутри угла AOC. ∠AOC = ${a + b}°, ∠AOB = ${a}°. Найди ∠BOC (в градусах).`, answer: b, explanation: ['Величина всего угла равна сумме величин его частей.', `∠BOC = ${a + b}° − ${a}° = ${b}°.`], hints: ['Из целого вычитаем известную часть.'] };
};

const angleHalf: Generator = (rng) => {
  const h = randInt(rng, 10, 85);
  return { type: 'input', question: `Луч-биссектриса делит угол, равный ${2 * h}°, на два равных угла. Найди величину каждого (в градусах).`, answer: h, explanation: ['Биссектриса делит угол пополам.', `${2 * h}° : 2 = ${h}°.`], hints: ['Раздели угол на две равные части.'] };
};

const angleClock: Generator = (rng) => {
  const h = randInt(rng, 1, 11);
  const ang = Math.min(30 * h, 360 - 30 * h);
  return { type: 'input', question: `Какой угол (в градусах) образуют стрелки часов в ${h}:00? Считай меньший из двух углов.`, answer: ang, explanation: ['Круг циферблата — 360°, между соседними часовыми делениями 360° : 12 = 30°.', `В ${h}:00 между стрелками ${Math.min(h, 12 - h)} ${plural(Math.min(h, 12 - h), ['деление', 'деления', 'делений'])}: ${Math.min(h, 12 - h)} · 30° = ${ang}°.`], hints: ['Сколько градусов между двумя соседними цифрами на циферблате?'] };
};

export const math4Generators: Record<string, Generator> = {
  'math.addsub.column': addColumn,
  'math.addsub.smart': addSmart,
  'math.addsub.diff': addDiff,
  'math.addsub.property': addProperty,
  'math.muldiv.mul': mulBasic,
  'math.muldiv.div': divExact,
  'math.muldiv.smart': mulSmart,
  'math.muldiv.distrib': mulDistrib,
  'math.muldiv.zero': mulZero,
  'math.prime.is': primeIs,
  'math.prime.choose': primeChoose,
  'math.prime.factorCount': primeFactorCount,
  'math.prime.largest': primeLargest,
  'math.prime.count': primeCount,
  'math.expr.value': exprValue,
  'math.expr.first': exprFirst,
  'math.expr.compose': exprCompose,
  'math.var.value': varValue,
  'math.var.word': varWord,
  'math.var.simplify': varSimplify,
  'math.formula.apply': formulaApply,
  'math.formula.find': formulaFind,
  'math.formula.cube': formulaCube,
  'math.eqword.simple': eqWordSimple,
  'math.eqword.two': eqWordTwo,
  'math.eqword.ratio': eqWordRatio,
  'math.angle.type': angleType,
  'math.angle.adjacent': angleAdjacent,
  'math.angle.sum': angleSum,
  'math.angle.half': angleHalf,
  'math.angle.clock': angleClock,
};
