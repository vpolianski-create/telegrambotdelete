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
};

export const filmFor = (topicId: string): Film | undefined => FILMS[topicId];

/** Часть ролика, которая объясняет это задание (или ничего — тогда ролик открывается с начала). */
export function filmBeat(film: Film, task: { generator?: string; question: string }): string | undefined {
  if (task.generator && film.byGenerator[task.generator]) return film.byGenerator[task.generator];
  return film.byWords.find(([re]) => re.test(task.question))?.[1];
}

/** Адрес ролика; с частью — открывается сразу на ней (без заставки). */
export function filmUrl(film: Film, beat?: string): string {
  const k = beat ? film.beats.indexOf(beat) : -1;
  return k > 0 ? `${film.src}?beat=${k}` : film.src;
}
