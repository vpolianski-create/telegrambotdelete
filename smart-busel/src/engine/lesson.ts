import type { Entry, GeneratorRef, Task } from '../content/schema';
import { shuffle, type Rng } from './rng';

export interface LessonItem {
  task: Task; counted: boolean; entry?: GeneratorRef; similar?: boolean; retry?: boolean;
  harder?: boolean; // вопрос посложнее, который ребёнок выбрал сам
  finale?: boolean; // «финиш на успехе»: уже решённый верно вопрос, без баллов
}

/** Не больше стольких «похожих» заданий за урок, чтобы он не растягивался бесконечно. */
export const MAX_SIMILAR = 3;
/** Не больше стольких заданий возвращается в конец урока после ошибки. */
export const MAX_RETRY = 4;

/**
 * Очередь заданий после ответа на items[i].
 * Ошибка в задании-генераторе — следом новое похожее. Ошибка в обычном задании — оно ещё раз
 * придёт в конце урока. Добавленные задания в процент темы не входят.
 */
export function queueAfterAnswer(items: LessonItem[], i: number, correct: boolean, makeSimilar: (e: GeneratorRef) => Task): LessonItem[] {
  if (correct) return items;
  const item = items[i];
  if (item.entry) {
    if (items.filter((x) => x.similar).length >= MAX_SIMILAR) return items;
    return [...items.slice(0, i + 1), { task: makeSimilar(item.entry), counted: false, entry: item.entry, similar: true }, ...items.slice(i + 1)];
  }
  if (item.retry || items.filter((x) => x.retry).length >= MAX_RETRY) return items;
  return [...items, { task: item.task, counted: false, retry: true }];
}

/** Что будет после ошибки в items[i]: похожее задание следом, этот вопрос в конце урока или — в «Работе над ошибками». */
export function afterWrong(items: LessonItem[], i: number): 'similar' | 'end' | 'review' {
  const item = items[i];
  if (item.entry) return items.filter((x) => x.similar).length >= MAX_SIMILAR ? 'review' : 'similar';
  if (item.retry || items.filter((x) => x.retry).length >= MAX_RETRY) return 'review';
  return 'end';
}

/**
 * Есть ли у задания вторая попытка после ошибки. Нет у «верно/неверно» и у выбора из двух вариантов:
 * там второй ответ угадывается без размышлений.
 */
export function canRetry(task: Pick<Task, 'type' | 'options'>): boolean {
  if (task.type === 'truefalse') return false;
  if (task.type === 'single') return (task.options?.length ?? 0) >= 3;
  return true;
}

export type Hint = { kind: 'text' | 'card'; text: string };

/** Подсказки по порядку: сначала написанные к заданию, затем нужная карточка урока. Не больше двух. */
export function hintsFor(task: Pick<Task, 'hints' | 'ref'>, cards: string[]): Hint[] {
  const out: Hint[] = task.hints.map((text) => ({ kind: 'text', text }));
  const card = task.ref ? cards[task.ref.card] : undefined;
  if (card) out.push({ kind: 'card', text: card });
  return out.slice(0, 2);
}

export type IntroStep = { kind: 'card'; index: number } | { kind: 'check'; task: Task };

/** Объяснение: после карточки сразу идёт вопрос «проверь себя» по ней. rest — вопросы без своей карточки. */
export function introSteps(cards: string[], selfCheck: Task[]): { steps: IntroStep[]; rest: Task[] } {
  const steps: IntroStep[] = [];
  const placed = new Set<Task>();
  cards.forEach((_, index) => {
    steps.push({ kind: 'card', index });
    selfCheck.filter((t) => t.ref?.card === index).forEach((task) => { steps.push({ kind: 'check', task }); placed.add(task); });
  });
  return { steps, rest: selfCheck.filter((t) => !placed.has(t)) };
}

/**
 * Практика для повторного прохождения: обычные вопросы случайно выбираются из практики и запаса темы.
 * Длина урока прежняя; задания-генераторы, повышенные задания и задания с картиной остаются на своих местах.
 */
export function samplePractice(practice: Entry[], pool: Task[], rng: Rng): Entry[] {
  if (!pool.length) return practice;
  const swappable = (e: Entry): e is Task => !('generator' in e) && e.difficulty === 'basic' && !e.image;
  const basics = practice.filter(swappable);
  const chosen = shuffle(rng, [...basics, ...pool]).slice(0, basics.length);
  let k = 0;
  return practice.map((e) => (swappable(e) ? chosen[k++] : e));
}
