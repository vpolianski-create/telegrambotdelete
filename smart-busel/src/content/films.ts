/**
 * Мультуроки — озвученные анимированные объяснения к темам (сделаны скиллом Papermorph).
 * Файлы ролика лежат в `public/films/<тема>/` и попадают в программу как есть, работают без интернета.
 * Тема без ролика ничего не меняет: кнопки «Мультурок» у неё просто нет.
 */
export interface Film {
  /** путь к странице ролика внутри программы (относительно index.html) */
  src: string;
  /** примерная длина, минуты — пишется на кнопке */
  minutes: number;
  /** части ролика по порядку, как в BEATS страницы ролика: номер части — место, с которого открыть */
  beats: string[];
  /** какой части ролика соответствует генератор заданий */
  byGenerator: Record<string, string>;
  /** для обычных заданий — по словам вопроса (проверяются по порядку) */
  byWords: [RegExp, string][];
  /** уточнение для генератора по словам его вопроса (например, «делится на 9» → часть про 9) */
  refine?: Record<string, [RegExp, string][]>;
}

export const FILMS: Record<string, Film> = {
  'math-t12': {
    src: 'films/math-t12/index.html',
    minutes: 4,
    beats: ['intro', 'divisors', 'leftover', 'pairs', 'multiples', 'link', 'gcd', 'gifts', 'lcm', 'buses', 'check', 'wrap'],
    byGenerator: {
      'math.gcdlcm.divisors': 'divisors',
      'math.gcdlcm.gcd': 'gcd',
      'math.gcdlcm.lcm': 'lcm',
      'math.gcdlcm.gcdProblem': 'gifts',
      'math.gcdlcm.lcmProblem': 'buses',
    },
    byWords: [
      [/нод|наибольш/i, 'gcd'],
      [/нок|наименьш/i, 'lcm'],
      [/делител[\s\S]*кратн|кратн[\s\S]*делител/i, 'link'],
      [/кратн/i, 'multiples'],
      [/делител|делится|остат/i, 'divisors'],
    ],
  },
  'math-t13': {
    src: 'films/math-t13/index.html',
    minutes: 4,
    beats: ['intro', 'why', 'tens', 'last', 'three', 'why3', 'nine', 'six', 'four', 'digit', 'wrap'],
    byGenerator: {
      'math.div.can': 'last',
      'math.div.choose': 'last',
      'math.div.digit': 'digit',
      'math.div.six': 'six',
    },
    refine: {
      'math.div.can': [[/на 3\b/, 'three'], [/на 9\b/, 'nine']],
      'math.div.choose': [[/на 3\b/, 'three'], [/на 9\b/, 'nine']],
    },
    byWords: [
      [/на 4\b/, 'four'],
      [/на 6\b/, 'six'],
      [/на 9\b/, 'nine'],
      [/на 3\b/, 'three'],
      [/на (2|5|10)\b/, 'last'],
      [/сумм[а-я]* цифр/i, 'three'],
    ],
  },
  'math-t14': {
    src: 'films/math-t14/index.html',
    minutes: 4,
    beats: ['intro', 'rows', 'defs', 'two', 'sieve', 'check', 'factor', 'tree', 'count', 'gcd', 'wrap'],
    byGenerator: {
      'math.prime.is': 'check',
      'math.prime.choose': 'check',
      'math.prime.factorCount': 'count',
      'math.prime.largest': 'count',
      'math.prime.count': 'sieve',
    },
    byWords: [
      [/нод|взаимно/i, 'gcd'],
      [/чётн/i, 'two'],
      [/разлож|множител/i, 'factor'],
      [/прост|составн/i, 'defs'],
    ],
  },
  'math-t15': {
    src: 'films/math-t15/index.html',
    minutes: 3,
    beats: ['intro', 'what', 'trap', 'order', 'left', 'brackets', 'plan', 'solve', 'words', 'read', 'wrap'],
    byGenerator: {
      'math.expr.value': 'plan',
      'math.expr.first': 'order',
      'math.expr.compose': 'words',
    },
    refine: {
      'math.expr.first': [[/\(/, 'brackets']],
    },
    byWords: [
      [/прочита/i, 'read'],
      [/первым/i, 'order'],
      [/\d \+ \d+ · \d/, 'trap'],
      [/сумм|разност|произведени|частно/i, 'words'],
      [/значени|выражени/i, 'plan'],
    ],
  },
  'math-t17': {
    src: 'films/math-t17/index.html',
    minutes: 4,
    beats: ['intro', 'scales', 'root', 'parts', 'minus', 'sub', 'mult', 'check', 'chain', 'think', 'wrap'],
    byGenerator: {
      'math.eq.simple': 'parts',
      'math.eq.root': 'root',
      'math.eq.twoStep': 'chain',
      'math.eq.word': 'think',
    },
    refine: {
      'math.eq.simple': [[/x − \d/, 'minus'], [/\d − x/, 'sub'], [/· x|x :/, 'mult']],
    },
    byWords: [
      [/корн/i, 'root'],
      [/провер/i, 'check'],
      [/задумал/i, 'think'],
      [/уравнени/i, 'parts'],
    ],
  },
  'math-t19': {
    src: 'films/math-t19/index.html',
    minutes: 3,
    beats: ['intro', 'plan', 'notebook', 'before', 'which', 'boxes', 'solve', 'check', 'ratio', 'ratio2', 'wrap'],
    byGenerator: {
      'math.eqword.simple': 'before',
      'math.eqword.two': 'which',
      'math.eqword.ratio': 'ratio',
    },
    refine: {
      'math.eqword.simple': [[/одинаковых|тарел/i, 'notebook']],
    },
    byWords: [
      [/в \d+ раза? /i, 'ratio'],
      [/на \d+ [а-я]* ?(больше|меньше)/i, 'which'],
      [/купил|одинаков/i, 'notebook'],
      [/уравнени/i, 'plan'],
    ],
  },
  'math-t20': {
    src: 'films/math-t20/index.html',
    minutes: 4,
    beats: ['intro', 'what', 'degree', 'types', 'protractor', 'scale', 'build', 'sum', 'straight', 'half', 'clock', 'wrap'],
    byGenerator: {
      'math.angle.type': 'types',
      'math.angle.picture': 'types',
      'math.angle.adjacent': 'straight',
      'math.angle.sum': 'sum',
      'math.angle.half': 'half',
      'math.angle.clock': 'clock',
    },
    byWords: [
      [/транспортир|измеря/i, 'protractor'],
      [/биссектрис/i, 'half'],
      [/час/i, 'clock'],
      [/острый|тупой|прямой|развёрнут|90°/i, 'types'],
      [/внутри/i, 'sum'],
      [/вершин|сторон|луч/i, 'what'],
    ],
  },
};

export const filmFor = (topicId: string): Film | undefined => FILMS[topicId];

/** Часть ролика, которая объясняет это задание (или ничего — тогда ролик открывается с начала). */
export function filmBeat(film: Film, task: { generator?: string; question: string }): string | undefined {
  if (task.generator && film.byGenerator[task.generator]) {
    const exact = film.refine?.[task.generator]?.find(([re]) => re.test(task.question))?.[1];
    return exact ?? film.byGenerator[task.generator];
  }
  return film.byWords.find(([re]) => re.test(task.question))?.[1];
}

/** Адрес ролика; с частью — открывается сразу на ней (без заставки). */
export function filmUrl(film: Film, beat?: string): string {
  const k = beat ? film.beats.indexOf(beat) : -1;
  return k > 0 ? `${film.src}?beat=${k}` : film.src;
}
