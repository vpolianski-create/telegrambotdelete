import { pick, randInt, shuffle } from '../engine/rng';
import type { Generator } from './math';

const ROMAN: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
export const toRoman = (n: number) => {
  let out = '';
  for (const [v, s] of [[40, 'XL'], [10, 'X'], ...ROMAN.slice(1)] as [number, string][]) while (n >= v) { out += s; n -= v; }
  return out;
};
/** Век до н. э.: годы 1–100 до н. э. — это I век до н. э. */
export const centuryBC = (yearBC: number) => Math.ceil(yearBC / 100);

const yearsBetween: Generator = (rng) => {
  const a = randInt(rng, 10, 50) * 100;
  const b = a - randInt(rng, 2, 15) * 100;
  return {
    type: 'input',
    question: `Одно событие произошло в ${a} г. до н. э., другое — в ${b} г. до н. э. Сколько лет прошло между ними?`,
    answer: a - b,
    explanation: ['Годы до нашей эры считают «в обратную сторону»: чем число больше, тем событие древнее.', `Чтобы найти промежуток, из большего числа вычитаем меньшее: ${a} − ${b} = ${a - b}.`],
    hints: ['Вычти из большего года меньший.'],
  };
};

const whichEarlier: Generator = (rng) => {
  const a = randInt(rng, 5, 40) * 100 + pick(rng, [0, 50]);
  let b = a;
  while (b === a) b = randInt(rng, 5, 40) * 100 + pick(rng, [0, 50]);
  const earlier = Math.max(a, b);
  const opts = [`${a} г. до н. э.`, `${b} г. до н. э.`];
  return {
    type: 'single',
    question: 'Какое событие произошло раньше?',
    options: shuffle(rng, opts),
    answer: `${earlier} г. до н. э.`,
    explanation: ['До нашей эры счёт идёт к нулю: чем больше число, тем раньше.', `${earlier} больше, значит, ${earlier} г. до н. э. — раньше.`],
    hints: ['Представь ленту времени: она идёт к году 1 от нашей эры.'],
  };
};

const centuryGen: Generator = (rng) => {
  const year = randInt(rng, 101, 3500);
  const c = centuryBC(year);
  const nums = new Set<number>([c, c + 1, c + 2]);
  for (let k = c - 1; nums.size < 4; k = k > 1 ? k - 1 : c + nums.size) nums.add(k);
  return {
    type: 'single',
    question: `К какому веку до н. э. относится ${year} год до н. э.?`,
    options: shuffle(rng, [...nums].map(toRoman)),
    answer: toRoman(c),
    explanation: [`Век — это 100 лет. I век до н. э. — это годы с 100 по 1 до н. э.`, `Номер века находим так: ${year} : 100 = ${Math.floor(year / 100)} (ост. ${year % 100}).`, year % 100 === 0 ? `Остаток нулевой, значит, век ${toRoman(c)}.` : `Остаток не нулевой — прибавляем 1: ${Math.floor(year / 100) + 1} век, то есть ${toRoman(c)}.`],
    hints: ['Раздели год на 100 с остатком.', 'Если остаток не нулевой, номер века на единицу больше.'],
  };
};

export const historyGenerators: Record<string, Generator> = {
  'history.era.between': yearsBetween,
  'history.era.earlier': whichEarlier,
  'history.era.century': centuryGen,
};
