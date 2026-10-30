import { pick, randInt, shuffle, type Rng } from '../engine/rng';
import { fmt, type Generator } from './math';

/** 1 десяток, 2 десятка, 5 десятков */
export const plural = (n: number, forms: [string, string, string]) => {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  return a > 10 && a < 20 ? forms[2] : b === 1 ? forms[0] : b >= 2 && b <= 4 ? forms[1] : forms[2];
};
const withUnit = (n: number, forms: [string, string, string]) => `${fmt(n)} ${plural(n, forms)}`;
const uniq = <T,>(arr: T[]) => [...new Set(arr)];

// ---------- §1 Как решать задачу ----------
const wordShop: Generator = (rng, d) => {
  const a = randInt(rng, 3, d === 'basic' ? 15 : 40);
  const b = randInt(rng, 2, d === 'basic' ? 12 : 30);
  const k = randInt(rng, 2, 9);
  const m = randInt(rng, 2, 9);
  const total = k * a + m * b;
  return {
    type: 'input',
    question: `Тетрадь стоит ${a} руб., а ручка — ${b} руб. Сколько рублей заплатят за ${k} ${plural(k, ['тетрадь', 'тетради', 'тетрадей'])} и ${m} ${plural(m, ['ручку', 'ручки', 'ручек'])}?`,
    answer: total,
    explanation: [
      `Что известно: цена тетради ${a} руб., цена ручки ${b} руб. Что найти: общую стоимость.`,
      `1) За тетради: ${a} · ${k} = ${a * k} (руб.).`,
      `2) За ручки: ${b} · ${m} = ${b * m} (руб.).`,
      `3) Всего: ${a * k} + ${b * m} = ${total} (руб.). Ответ: ${total} руб.`,
    ],
    hints: ['Сначала найди стоимость всех тетрадей, потом всех ручек.', 'Стоимость = цена · количество. Затем сложи.'],
  };
};

const wordMotion: Generator = (rng, d) => {
  const v = randInt(rng, 3, d === 'basic' ? 20 : 90);
  const t = randInt(rng, 2, 9);
  const s = v * t;
  const kind = randInt(rng, 1, 3);
  if (kind === 1) return { type: 'input', question: `Велосипедист ехал ${t} ${plural(t, ['час', 'часа', 'часов'])} со скоростью ${v} км/ч. Сколько километров он проехал?`, answer: s, explanation: ['Известны скорость и время, ищем расстояние.', 'Расстояние = скорость · время.', `${v} · ${t} = ${s} (км). Ответ: ${s} км.`], hints: ['Какая формула связывает расстояние, скорость и время?'] };
  if (kind === 2) return { type: 'input', question: `Поезд прошёл ${s} км за ${t} ${plural(t, ['час', 'часа', 'часов'])}. С какой скоростью шёл поезд (км/ч)?`, answer: v, explanation: ['Известны расстояние и время, ищем скорость.', 'Скорость = расстояние : время.', `${s} : ${t} = ${v} (км/ч). Ответ: ${v} км/ч.`], hints: ['Скорость показывает, сколько километров проходят за один час.'] };
  return { type: 'input', question: `Расстояние ${s} км автомобиль проехал со скоростью ${v} км/ч. Сколько часов он был в пути?`, answer: t, explanation: ['Известны расстояние и скорость, ищем время.', 'Время = расстояние : скорость.', `${s} : ${v} = ${t} (ч). Ответ: ${t} ч.`], hints: ['Сколько раз скорость «помещается» в расстоянии?'] };
};

const wordDiff: Generator = (rng, d) => {
  const a = randInt(rng, 8, d === 'basic' ? 20 : 45);
  const diff = randInt(rng, 2, 9);
  const kind = rng() < 0.5;
  return {
    type: 'input',
    question: kind
      ? `В классе ${a} мальчиков, а девочек на ${diff} больше. Сколько всего учеников в классе?`
      : `В первой коробке ${a} карандашей, а во второй на ${diff} меньше. Сколько карандашей в двух коробках вместе?`,
    answer: kind ? a + (a + diff) : a + (a - diff),
    explanation: kind
      ? [`1) Девочек: ${a} + ${diff} = ${a + diff}.`, `2) Всего: ${a} + ${a + diff} = ${2 * a + diff}.`, `Ответ: ${2 * a + diff} учеников.`]
      : [`1) Во второй коробке: ${a} − ${diff} = ${a - diff}.`, `2) Вместе: ${a} + ${a - diff} = ${2 * a - diff}.`, `Ответ: ${2 * a - diff} карандашей.`],
    hints: ['Это задача в два действия. Сначала найди второе количество.', '«На … больше» — прибавляем, «на … меньше» — вычитаем.'],
  };
};

const wordLeft: Generator = (rng) => {
  const total = randInt(rng, 55, 120);
  const a = randInt(rng, 5, 25);
  const b = randInt(rng, 5, 25);
  return {
    type: 'input',
    question: `Из мотка верёвки длиной ${total} м отрезали сначала ${a} м, потом ещё ${b} м. Сколько метров верёвки осталось?`,
    answer: total - a - b,
    explanation: [`Первый способ: ${total} − ${a} = ${total - a}, потом ${total - a} − ${b} = ${total - a - b}.`, `Второй способ: сколько отрезали всего — ${a} + ${b} = ${a + b}, осталось ${total} − ${a + b} = ${total - a - b}.`, `Ответ: ${total - a - b} м.`],
    hints: ['Можно вычитать по очереди, а можно сначала сложить то, что отрезали.'],
  };
};

const wordBooks: Generator = (rng) => {
  const a = randInt(rng, 40, 90);
  const diff = randInt(rng, 5, 25);
  return {
    type: 'input',
    question: `Маша прочитала ${a} страниц, а Петя — на ${diff} страниц меньше. Сколько страниц прочитали оба вместе?`,
    answer: 2 * a - diff,
    explanation: [`1) Петя прочитал: ${a} − ${diff} = ${a - diff} (с.).`, `2) Вместе: ${a} + ${a - diff} = ${2 * a - diff} (с.).`, `Ответ: ${2 * a - diff} страниц.`],
    hints: ['Сначала узнай, сколько страниц прочитал Петя.'],
  };
};

// ---------- §2 Натуральные числа ----------
const natHundreds: Generator = (rng, d) => {
  const n = randInt(rng, d === 'basic' ? 1000 : 10000, d === 'basic' ? 9999 : 99999);
  const kind = pick(rng, [10, 100, 1000] as const);
  const name = kind === 10 ? 'десятков' : kind === 100 ? 'сотен' : 'тысяч';
  const ans = Math.floor(n / kind);
  return {
    type: 'input',
    question: `Сколько всего ${name} в числе ${fmt(n)}?`,
    answer: ans,
    explanation: [`Чтобы узнать, сколько всего ${name} в числе, отбрасываем цифры справа до нужного разряда.`, `В числе ${fmt(n)} получается ${fmt(ans)}.`, `Проверка: ${fmt(ans)} · ${kind} = ${fmt(ans * kind)} — это почти всё число.`],
    hints: ['«Всего сотен» — это не цифра разряда, а число, которое получится, если убрать две последние цифры.'],
  };
};

const natWrite: Generator = (rng, d) => {
  const th = randInt(rng, 1, 9);
  const h = d === 'basic' ? 0 : randInt(rng, 0, 9);
  const t = randInt(rng, 0, 9);
  const u = randInt(rng, 0, 9);
  const parts: string[] = [withUnit(th, ['тысяча', 'тысячи', 'тысяч'])];
  if (h) parts.push(withUnit(h, ['сотня', 'сотни', 'сотен']));
  if (t) parts.push(withUnit(t, ['десяток', 'десятка', 'десятков']));
  if (u) parts.push(withUnit(u, ['единица', 'единицы', 'единиц']));
  const n = th * 1000 + h * 100 + t * 10 + u;
  return {
    type: 'input',
    question: `Запиши цифрами число: ${parts.join(' ')}.`,
    answer: n,
    explanation: ['Записываем цифры по разрядам: тысячи, сотни, десятки, единицы.', 'Если какого-то разряда в названии нет, на его месте пишем нуль.', `Получается ${fmt(n)}.`],
    hints: ['Запиши четыре места: тысячи, сотни, десятки, единицы.', 'Пропущенный разряд — это 0.'],
  };
};

const natNeighbors: Generator = (rng, d) => {
  const n = randInt(rng, 100, d === 'basic' ? 9999 : 999999);
  const kind = randInt(rng, 1, 2);
  return {
    type: 'input',
    question: kind === 1 ? `Запиши число, которое следует за числом ${fmt(n)}.` : `Запиши число, которое предшествует числу ${fmt(n)}.`,
    answer: kind === 1 ? n + 1 : n - 1,
    explanation: kind === 1 ? ['Следующее число больше на единицу.', `${fmt(n)} + 1 = ${fmt(n + 1)}.`] : ['Предыдущее число меньше на единицу.', `${fmt(n)} − 1 = ${fmt(n - 1)}.`],
    hints: ['В натуральном ряду соседние числа отличаются на 1.'],
  };
};

const natDigits: Generator = (rng) => {
  const len = randInt(rng, 5, 10);
  let s = String(randInt(rng, 1, 9));
  for (let i = 1; i < len; i++) s += randInt(rng, 0, 9);
  const classes = Math.ceil(len / 3);
  return {
    type: 'input',
    question: `Сколько цифр в записи числа ${fmt(Number(s))}?`,
    answer: len,
    explanation: ['Число записано классами по три цифры: единицы, тысячи, миллионы, миллиарды.', `В числе ${fmt(Number(s))} всего ${classes} ${plural(classes, ['класс', 'класса', 'классов'])}, цифр: ${len}.`],
    hints: ['Посчитай цифры в каждом классе.'],
  };
};

const natLargest: Generator = (rng) => {
  const k = randInt(rng, 3, 5);
  const big = rng() < 0.5;
  const digits = big ? '9876543210'.slice(0, k) : (k === 1 ? '0' : '1' + '023456789'.slice(0, k - 1));
  return {
    type: 'input',
    question: `Запиши ${big ? 'наибольшее' : 'наименьшее'} ${k === 3 ? 'трёхзначное' : k === 4 ? 'четырёхзначное' : 'пятизначное'} число, в записи которого все цифры разные.`,
    answer: Number(digits),
    explanation: big ? ['Чтобы число было наибольшим, берём самые большие цифры и ставим их по убыванию слева направо.', `Получается ${fmt(Number(digits))}.`] : ['Первая цифра не может быть нулём, поэтому начинаем с 1. Дальше ставим самые маленькие цифры по возрастанию: 0, 2, 3…', `Получается ${fmt(Number(digits))}.`],
    hints: big ? ['Начни с самой большой цифры 9.'] : ['Первая цифра не может быть нулём.'],
  };
};

// ---------- §3 Сравнение ----------
const cmpSign: Generator = (rng, d) => {
  const len = d === 'basic' ? randInt(rng, 3, 4) : randInt(rng, 5, 7);
  const a = randInt(rng, 10 ** (len - 1), 10 ** len - 1);
  let b = rng() < 0.2 ? a : randInt(rng, 10 ** (len - 1), 10 ** len - 1);
  if (rng() < 0.3 && a > 100) b = a + pick(rng, [-100, -10, 10, 100]);
  const sign = a > b ? '>' : a < b ? '<' : '=';
  return {
    type: 'single',
    question: `Поставь знак: ${fmt(a)} ◯ ${fmt(b)}`,
    options: ['>', '<', '='],
    answer: sign,
    explanation: [String(a).length === String(b).length ? 'Количество цифр одинаковое, поэтому сравниваем цифры слева направо, начиная с высшего разряда.' : 'Больше то число, в котором больше цифр.', a === b ? 'Все цифры совпали — числа равны.' : `${fmt(a)} ${sign} ${fmt(b)}.`],
    hints: ['Сначала сравни количество цифр.', 'Если оно одинаковое — сравнивай цифры по разрядам слева направо.'],
  };
};

const cmpOrder: Generator = (rng, d) => {
  const nums = uniq(Array.from({ length: 3 }, () => randInt(rng, d === 'basic' ? 100 : 1000, d === 'basic' ? 999 : 99999)));
  while (nums.length < 3) nums.push(randInt(rng, 100, 99999));
  const asc = rng() < 0.5;
  const sorted = [...nums].sort((x, y) => (asc ? x - y : y - x));
  const ans = sorted.map(fmt).join(' ; ');
  const opts = new Set<string>([ans]);
  while (opts.size < 4) opts.add(shuffle(rng, nums).map(fmt).join(' ; '));
  return {
    type: 'single',
    question: `Расположи числа в порядке ${asc ? 'возрастания (от меньшего к большему)' : 'убывания (от большего к меньшему)'}:`,
    options: shuffle(rng, [...opts]),
    answer: ans,
    explanation: ['Сравниваем числа по количеству цифр, а если оно одинаковое — по цифрам слева направо.', `${asc ? 'Наименьшее' : 'Наибольшее'} — ${fmt(sorted[0])}, затем ${fmt(sorted[1])}, потом ${fmt(sorted[2])}.`],
    hints: ['Найди сначала самое маленькое (или самое большое) число.'],
  };
};

const cmpBetween: Generator = (rng, d) => {
  const a = randInt(rng, 3, d === 'basic' ? 50 : 900);
  const b = a + randInt(rng, 3, d === 'basic' ? 20 : 200);
  const incl = d !== 'basic' && rng() < 0.5;
  return {
    type: 'input',
    question: incl ? `Сколько натуральных чисел от ${fmt(a)} до ${fmt(b)} включительно?` : `Сколько натуральных чисел лежит между числами ${fmt(a)} и ${fmt(b)}?`,
    answer: incl ? b - a + 1 : b - a - 1,
    explanation: incl ? ['«Включительно» значит, что крайние числа тоже считаем.', `Всего ${fmt(b)} − ${fmt(a)} + 1 = ${fmt(b - a + 1)}.`] : ['«Между» значит, что крайние числа не считаются.', `Всего ${fmt(b)} − ${fmt(a)} − 1 = ${fmt(b - a - 1)}.`],
    hints: ['Проверь на маленьком примере: сколько чисел между 3 и 6? (4 и 5, то есть два).'],
  };
};

const cmpGreatest: Generator = (rng) => {
  const len = randInt(rng, 4, 6);
  const set = new Set<number>();
  while (set.size < 4) set.add(randInt(rng, 10 ** (len - 1), 10 ** len - 1));
  const nums = [...set];
  const big = rng() < 0.5;
  const ans = big ? Math.max(...nums) : Math.min(...nums);
  return {
    type: 'single',
    question: `Какое из чисел ${big ? 'наибольшее' : 'наименьшее'}?`,
    options: nums.map(fmt),
    answer: fmt(ans),
    explanation: ['У всех чисел одинаковое количество цифр, поэтому сравниваем по разрядам слева направо.', `${big ? 'Наибольшее' : 'Наименьшее'} — ${fmt(ans)}.`],
    hints: ['Сравни первые цифры. Если они равны — вторые, и так далее.'],
  };
};

// ---------- §4 Геометрические фигуры ----------
const geoSegments: Generator = (rng) => {
  const n = randInt(rng, 3, 7);
  const c = (n * (n - 1)) / 2;
  return {
    type: 'input',
    question: `На прямой отметили ${n} ${plural(n, ['точку', 'точки', 'точек'])}. Сколько всего отрезков с концами в этих точках можно получить?`,
    answer: c,
    explanation: ['Каждый отрезок задают две точки. Считаем по порядку: от первой точки — ' + (n - 1) + ', от второй (новые) — ' + (n - 2) + ', и так далее.', `Всего ${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ')} = ${c}.`],
    hints: ['Сначала посчитай отрезки, у которых один конец в самой левой точке.'],
  };
};

const geoLines: Generator = (rng) => {
  const n = randInt(rng, 3, 6);
  const c = (n * (n - 1)) / 2;
  return {
    type: 'input',
    question: `Отмечено ${n} ${plural(n, ['точка', 'точки', 'точек'])}, никакие три из них не лежат на одной прямой. Сколько различных прямых можно провести через пары этих точек?`,
    answer: c,
    explanation: ['Через две точки проходит ровно одна прямая.', `Пар точек: ${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ')} = ${c}.`, 'Так как три точки никогда не лежат на одной прямой, все прямые разные.'],
    hints: ['Сколько прямых можно провести через одну пару точек?'],
  };
};

const geoRays: Generator = (rng) => {
  const n = randInt(rng, 1, 5);
  return {
    type: 'input',
    question: `На прямой отметили ${n} ${plural(n, ['точку', 'точки', 'точек'])}. На сколько лучей эти точки разбивают прямую?`,
    answer: 2 * n,
    explanation: ['Каждая отмеченная точка делит прямую на два луча, идущие в разные стороны.', `Всего лучей: ${n} · 2 = ${2 * n}.`],
    hints: ['Сколько лучей получится, если отметить одну точку?'],
  };
};

// ---------- §5 Длина отрезка ----------
const lenConvert: Generator = (rng, d) => {
  const kinds = d === 'basic' ? [0, 1] : [0, 1, 3, 4];
  const k = pick(rng, kinds);
  if (k === 0) { const a = randInt(rng, 2, 9); const b = randInt(rng, 1, 9); return { type: 'input', question: `Выразите в сантиметрах: ${a} дм ${b} см.`, answer: a * 10 + b, explanation: ['1 дм = 10 см.', `${a} дм = ${a * 10} см, и ещё ${b} см: ${a * 10} + ${b} = ${a * 10 + b} (см).`], hints: ['Сколько сантиметров в одном дециметре?'] }; }
  if (k === 1) { const a = randInt(rng, 2, 9); const b = randInt(rng, 5, 95); return { type: 'input', question: `Выразите в сантиметрах: ${a} м ${b} см.`, answer: a * 100 + b, explanation: ['1 м = 100 см.', `${a} м = ${a * 100} см, и ещё ${b} см: ${a * 100} + ${b} = ${a * 100 + b} (см).`], hints: ['1 м = 100 см.'] }; }
  if (k === 3) { const a = randInt(rng, 2, 9); const b = randInt(rng, 50, 950); return { type: 'input', question: `Выразите в метрах: ${a} км ${b} м.`, answer: a * 1000 + b, explanation: ['1 км = 1 000 м.', `${a} км = ${fmt(a * 1000)} м, и ещё ${b} м: ${fmt(a * 1000 + b)} (м).`], hints: ['1 км = 1 000 м.'] }; }
  const a = randInt(rng, 2, 9) * 100;
  return { type: 'input', question: `Выразите в метрах: ${fmt(a * 10)} дм.`, answer: a, explanation: ['1 м = 10 дм, значит, чтобы перейти от дециметров к метрам, делим на 10.', `${fmt(a * 10)} : 10 = ${fmt(a)} (м).`], hints: ['В одном метре 10 дециметров.'] };
};

const lenMm: Generator = (rng) => {
  const a = randInt(rng, 2, 9);
  const b = randInt(rng, 1, 9);
  return { type: 'input', question: `Выразите в миллиметрах: ${a} см ${b} мм.`, answer: a * 10 + b, explanation: ['1 см = 10 мм.', `${a} см = ${a * 10} мм, и ещё ${b} мм: ${a * 10 + b} (мм).`], hints: ['Сколько миллиметров в одном сантиметре?'] };
};

const lenSegments: Generator = (rng, d) => {
  const ab = randInt(rng, 3, 40);
  const bc = randInt(rng, 3, 40);
  if (d === 'basic' || rng() < 0.5) return { type: 'input', question: `Точка B лежит на отрезке AC. AB = ${ab} см, BC = ${bc} см. Найди длину отрезка AC (в см).`, answer: ab + bc, explanation: ['Если точка лежит на отрезке, то длина всего отрезка равна сумме длин его частей.', `AC = AB + BC = ${ab} + ${bc} = ${ab + bc} (см).`], hints: ['Длина всего отрезка = сумма длин частей.'] };
  return { type: 'input', question: `Точка B лежит на отрезке AC. AC = ${ab + bc} см, AB = ${ab} см. Найди длину отрезка BC (в см).`, answer: bc, explanation: ['Длина всего отрезка равна сумме длин частей, поэтому одну часть находим вычитанием.', `BC = AC − AB = ${ab + bc} − ${ab} = ${bc} (см).`], hints: ['Из длины всего отрезка вычти длину известной части.'] };
};

// ---------- §6 Координатный луч ----------
const rayCoord: Generator = (rng, d) => {
  const u = pick(rng, d === 'basic' ? [1, 2, 5] : [2, 3, 4, 5, 10]);
  const k = randInt(rng, 2, 12);
  return {
    type: 'input',
    question: `На координатном луче единичный отрезок равен ${u} см. Точка A отстоит от начала отсчёта O на ${u * k} см. Какова координата точки A?`,
    answer: k,
    explanation: ['Координата показывает, сколько единичных отрезков укладывается между началом отсчёта и точкой.', `${u * k} : ${u} = ${k}. Значит, A(${k}).`],
    hints: ['Сколько раз единичный отрезок помещается в расстоянии OA?'],
  };
};

const rayStep: Generator = (rng) => {
  const u = randInt(rng, 2, 6);
  const k = randInt(rng, 3, 12);
  return { type: 'input', question: `Единичный отрезок координатного луча равен ${u} см. На каком расстоянии от начала отсчёта (в см) находится точка с координатой ${k}?`, answer: u * k, explanation: [`Координата ${k} означает ${k} единичных отрезков от начала отсчёта.`, `${u} · ${k} = ${u * k} (см).`], hints: ['Умножь длину единичного отрезка на координату.'] };
};

const rayDistance: Generator = (rng, d) => {
  const a = randInt(rng, 1, d === 'basic' ? 20 : 90);
  const b = a + randInt(rng, 2, d === 'basic' ? 15 : 60);
  const flip = rng() < 0.5;
  return {
    type: 'input',
    question: `На координатном луче отмечены точки ${flip ? `B(${b}) и A(${a})` : `A(${a}) и B(${b})`}. Найди длину отрезка AB (в единичных отрезках).`,
    answer: b - a,
    explanation: ['Чтобы найти длину отрезка на координатном луче, из большей координаты вычитаем меньшую.', `${b} − ${a} = ${b - a}.`],
    hints: ['Из большей координаты вычти меньшую.'],
  };
};

const rayMid: Generator = (rng) => {
  const a = randInt(rng, 1, 30);
  const b = a + 2 * randInt(rng, 2, 20);
  return { type: 'input', question: `Точка C — середина отрезка AB. A(${a}), B(${b}). Найди координату точки C.`, answer: (a + b) / 2, explanation: [`Длина отрезка AB равна ${b} − ${a} = ${b - a}.`, `Половина длины: ${b - a} : 2 = ${(b - a) / 2}.`, `Середина отстоит от A на ${(b - a) / 2}: ${a} + ${(b - a) / 2} = ${(a + b) / 2}.`], hints: ['Найди длину AB и раздели пополам.'] };
};

const rayRight: Generator = (rng) => {
  const a = randInt(rng, 1, 40);
  let b = a;
  while (b === a) b = randInt(rng, 1, 40);
  return { type: 'single', question: `На координатном луче отмечены точки M(${a}) и N(${b}). Какая точка лежит правее?`, options: ['M', 'N'], answer: a > b ? 'M' : 'N', explanation: ['На координатном луче чем больше число, тем правее лежит точка.', `${Math.max(a, b)} больше ${Math.min(a, b)}, значит, правее ${a > b ? 'M' : 'N'}.`], hints: ['Луч направлен вправо: числа растут слева направо.'] };
};

export const math3Generators: Record<string, Generator> = {
  'math.word.shop': wordShop,
  'math.word.motion': wordMotion,
  'math.word.diff': wordDiff,
  'math.word.left': wordLeft,
  'math.word.books': wordBooks,
  'math.nat.hundreds': natHundreds,
  'math.nat.write': natWrite,
  'math.nat.neighbors': natNeighbors,
  'math.nat.digits': natDigits,
  'math.nat.largest': natLargest,
  'math.cmp.sign': cmpSign,
  'math.cmp.order': cmpOrder,
  'math.cmp.between': cmpBetween,
  'math.cmp.greatest': cmpGreatest,
  'math.geo.segments': geoSegments,
  'math.geo.lines': geoLines,
  'math.geo.rays': geoRays,
  'math.len.convert': (rng, d) => (rng() < 0.3 ? lenMm(rng, d) : lenConvert(rng, d === 'basic' ? 'basic' : d)),
  'math.len.segments': lenSegments,
  'math.ray.coord': rayCoord,
  'math.ray.step': rayStep,
  'math.ray.distance': rayDistance,
  'math.ray.mid': rayMid,
  'math.ray.right': rayRight,
};
