/** Согласование существительных с числами в сгенерированных заданиях: «2 карандаша», «5 карандашей». */
const NOUNS: [string, string, string][] = [
  ['карандаш', 'карандаша', 'карандашей'],
  ['книга', 'книги', 'книг'],
  ['конфета', 'конфеты', 'конфет'],
  ['коробка', 'коробки', 'коробок'],
  ['мальчик', 'мальчика', 'мальчиков'],
  ['девочка', 'девочки', 'девочек'],
  ['марка', 'марки', 'марок'],
  ['минута', 'минуты', 'минут'],
  ['пассажир', 'пассажира', 'пассажиров'],
  ['печенье', 'печенья', 'печений'],
  ['страница', 'страницы', 'страниц'],
  ['ученик', 'ученика', 'учеников'],
  ['человек', 'человека', 'человек'],
  ['яблоко', 'яблока', 'яблок'],
  ['яйцо', 'яйца', 'яиц'],
  ['день', 'дня', 'дней'],
  ['тарелка', 'тарелки', 'тарелок'],
  ['единичный отрезок', 'единичных отрезка', 'единичных отрезков'],
];

export const pluralForm = (n: number, f: [string, string, string]) => {
  const m100 = n % 100;
  const m10 = n % 10;
  if (m100 >= 11 && m100 <= 14) return f[2];
  if (m10 === 1) return f[0];
  if (m10 >= 2 && m10 <= 4) return f[1];
  return f[2];
};

const ALL = NOUNS.flatMap((f) => f).sort((a, b) => b.length - a.length);
const RE = new RegExp(`(\\d[\\d\\u00a0\\u202f ]*?)(\\s)(${ALL.join('|')})(?![а-яё])`, 'g');
const FORMS = new Map<string, [string, string, string]>();
for (const f of NOUNS) for (const w of f) if (!FORMS.has(w)) FORMS.set(w, f);

export const fixPlurals = (s: string): string =>
  s.replace(RE, (all, num: string, sp: string, word: string) => {
    const digits = num.replace(/[^\d]/g, '');
    const f = FORMS.get(word);
    if (!digits || !f) return all;
    return `${num}${sp}${pluralForm(Number(digits), f)}`;
  });

export function fixTaskText<T extends { question: string; answer?: unknown; explanation?: string[]; hints?: string[]; options?: unknown[] }>(t: T): T {
  return {
    ...t,
    question: fixPlurals(t.question),
    ...(typeof t.answer === 'string' ? { answer: fixPlurals(t.answer) } : {}),
    ...(t.explanation ? { explanation: t.explanation.map(fixPlurals) } : {}),
    ...(t.hints ? { hints: t.hints.map(fixPlurals) } : {}),
    ...(t.options ? { options: t.options.map((o) => (typeof o === 'string' ? fixPlurals(o) : o)) } : {}),
  };
}
