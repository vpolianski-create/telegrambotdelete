import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Task } from '../src/content/schema';
import { minReadMs, nudgeAfter, SLOW_MS, type AnswerSignal } from '../src/engine/engagement';
import { praiseFor, retryPrompt, wrongNote } from '../src/engine/feedback';
import { afterWrong, canRetry, type LessonItem } from '../src/engine/lesson';
import { SECOND_TRY_SHARE, taskPoints } from '../src/engine/points';
import { praiseIdeas, weekReport } from '../src/engine/report';
import { ans, freshStore, installFakeDisk } from './helpers/fakeApp';

const task = (over: Partial<Task> = {}): Task => ({
  id: 't1', subject: 'math', topicId: 'math-t01', type: 'single', difficulty: 'basic', question: 'Сколько будет 2+2?',
  options: ['3', '4', '5', '6'], answer: '4', hints: [], explanation: ['2+2=4'], ...over,
} as Task);
const zero = () => 0;

describe('баллы за вторую попытку — чуть меньше полных', () => {
  it('доля — 80 %', () => expect(SECOND_TRY_SHARE).toBe(0.8));
  it('обычное задание: 10 → 8, повышенное 20 → 16, бонус 30 → 24', () => {
    expect([taskPoints('basic', 0, false, true), taskPoints('advanced', 0, false, true), taskPoints('bonus', 0, false, true)]).toEqual([8, 16, 24]);
  });
  it('с первой попытки баллы прежние', () => {
    expect([taskPoints('basic', 0), taskPoints('basic', 2), taskPoints('basic', 0, true)]).toEqual([10, 5, 5]);
  });
  it('вторая попытка складывается с повтором темы и второй подсказкой, но баллы не обнуляются', () => {
    expect(taskPoints('basic', 0, true, true)).toBe(4);
    expect(taskPoints('basic', 2, false, true)).toBe(4);
    expect(taskPoints('basic', 2, true, true)).toBeGreaterThan(0);
  });
});

describe('вторая попытка: где она есть', () => {
  it('есть у выбора из 3+ вариантов, ввода ответа, порядка и пар', () => {
    expect(canRetry(task())).toBe(true);
    expect(canRetry(task({ type: 'input', options: undefined }))).toBe(true);
    expect(canRetry(task({ type: 'order', options: ['a', 'b', 'c'], answer: ['a', 'b', 'c'] }))).toBe(true);
    expect(canRetry(task({ type: 'match', options: ['a', 'b'], answer: ['1', '2'] }))).toBe(true);
  });
  it('нет у «верно/неверно» и у выбора из двух: там второй ответ угадывается', () => {
    expect(canRetry(task({ type: 'truefalse', options: undefined, answer: true }))).toBe(false);
    expect(canRetry(task({ options: ['4', '5'] }))).toBe(false);
  });
});

describe('что будет после ошибки (строка для ребёнка)', () => {
  const it1 = (o: Partial<LessonItem> = {}): LessonItem => ({ task: task(), counted: true, ...o });
  it('обычное задание вернётся в конце урока', () => expect(afterWrong([it1()], 0)).toBe('end'));
  it('задание-генератор — следом похожее', () => expect(afterWrong([it1({ entry: { generator: 'x' } as never })], 0)).toBe('similar'));
  it('повтор ошибки — уйдёт в «Работу над ошибками»', () => expect(afterWrong([it1({ retry: true })], 0)).toBe('review'));
  it('строки понятные и без упрёков', () => {
    expect(wrongNote('end')).toMatch(/вернётся в конце урока/);
    expect(wrongNote('similar')).toMatch(/похож/);
    expect(wrongNote('review')).toMatch(/Работ/);
  });
});

describe('выбор похвалы по ситуации', () => {
  const base = { attempt: 1 as const, hints: 0, difficulty: 'basic' as const, streak: 1, retry: false, pastMistake: false, ms: 5000 };
  it('обычный верный ответ — коротко, без восторгов', () => {
    const p = praiseFor(base, zero);
    expect(p.kind).toBe('plain');
    expect(p.text.length).toBeLessThan(12);
  });
  it('приоритет: исправил ошибку урока важнее всего', () => {
    expect(praiseFor({ ...base, retry: true, pastMistake: true, streak: 5, difficulty: 'bonus' }, zero).kind).toBe('fixed');
  });
  it('раньше здесь ошибался, сейчас верно — «рост»', () => {
    expect(praiseFor({ ...base, pastMistake: true }, zero)).toMatchObject({ kind: 'growth' });
  });
  it('верно со второй попытки — «нашёл сам»', () => {
    expect(praiseFor({ ...base, attempt: 2 }, zero).kind).toBe('second');
  });
  it('трудный вопрос без подсказок', () => {
    expect(praiseFor({ ...base, difficulty: 'advanced' }, zero).kind).toBe('hard');
    expect(praiseFor({ ...base, difficulty: 'advanced', hints: 1 }, zero).kind).not.toBe('hard');
  });
  it('серия 3, 5, 8, 10 — отмечаем; 4 и 6 — нет', () => {
    for (const s of [3, 5, 8, 10]) expect(praiseFor({ ...base, streak: s }, zero).kind).toBe('streak');
    for (const s of [4, 6]) expect(praiseFor({ ...base, streak: s }, zero).kind).toBe('plain');
    expect(praiseFor({ ...base, streak: 5 }, zero).text).toMatch(/Пять/);
  });
  it('долго думал — и верно', () => expect(praiseFor({ ...base, ms: SLOW_MS + 1 }, zero).kind).toBe('slow'));
  it('после подсказки — «довёл до ответа сам»', () => expect(praiseFor({ ...base, hints: 1 }, zero).kind).toBe('hint'));
  it('в фразах нет похвалы за ум и преувеличений', () => {
    const ctxs = [base, { ...base, retry: true }, { ...base, pastMistake: true }, { ...base, attempt: 2 as const }, { ...base, difficulty: 'bonus' as const }, { ...base, streak: 8 }, { ...base, ms: 30000 }, { ...base, hints: 2 }];
    const rngs = [() => 0, () => 0.5, () => 0.99];
    for (const c of ctxs) for (const r of rngs) expect(praiseFor(c, r).text).not.toMatch(/умн|гени|блестящ|невероят|супер/i);
  });
  it('после первой ошибки — приглашение подумать ещё, без слова «неправильно»', () => {
    for (const r of [() => 0, () => 0.99]) expect(retryPrompt(r)).not.toMatch(/неправильн|ошибся/i);
  });
});

describe('распознавание состояния ребёнка', () => {
  const s = (o: Partial<AnswerSignal> = {}): AnswerSignal => ({ correct: true, firstTry: true, hints: 0, guess: false, ms: 6000, ...o });
  it('время на чтение растёт с длиной вопроса и вариантов', () => {
    expect(minReadMs(task({ question: 'Да?', options: ['1', '2', '3'] }))).toBeLessThan(minReadMs(task({ question: 'Очень длинный вопрос про древний Египет и Нил?' })));
    expect(minReadMs(task({ question: '', options: [] }))).toBe(1500);
  });
  it('два ответа наугад подряд — «угадывает»', () => {
    expect(nudgeAfter([s(), s({ guess: true }), s({ guess: true, correct: false })], 3, {})).toBe('guess');
    expect(nudgeAfter([s({ guess: true }), s(), s({ guess: true })], 3, {})).toBeUndefined();
  });
  it('две итоговые ошибки подряд — «застрял»', () => {
    expect(nudgeAfter([s({ correct: false, firstTry: false }), s({ correct: false, firstTry: false })], 3, {})).toBe('stuck');
    expect(nudgeAfter([s({ correct: false, firstTry: false }), s({ correct: true, firstTry: false })], 3, {})).toBeUndefined();
  });
  it('после 20 минут и 4 ошибок из последних 6 — «устал»', () => {
    const h = [s(), s({ firstTry: false, correct: false }), s({ firstTry: false }), s({ firstTry: false, correct: false }), s(), s({ firstTry: false })];
    expect(nudgeAfter(h, 21, {})).toBe('tired');
    expect(nudgeAfter(h, 10, {})).not.toBe('tired');
  });
  it('8 подряд с первого раза без подсказок — предложить посложнее (если есть что)', () => {
    const h = Array.from({ length: 8 }, () => s());
    expect(nudgeAfter(h, 5, { canHarder: true })).toBe('easy');
    expect(nudgeAfter(h, 5, { canHarder: false })).toBeUndefined();
    expect(nudgeAfter([...h.slice(1), s({ hints: 1 })], 5, { canHarder: true })).toBeUndefined();
  });
  it('то же предложение не повторяется, пока не наберутся новые ответы', () => {
    const h = [s({ guess: true }), s({ guess: true })];
    expect(nudgeAfter(h, 3, {}, { guess: 2 })).toBeUndefined();
    expect(nudgeAfter([...h, s({ guess: true }), s({ guess: true })], 3, {}, { guess: 2 })).toBe('guess');
  });
});

describe('хранилище: новые счётчики дня', () => {
  let store: Awaited<ReturnType<typeof freshStore>>;
  const st = () => store.useApp.getState();
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-10T12:00:00'));
    installFakeDisk();
    store = await freshStore();
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
  const day = () => st().daily[store.todayStr()];

  it('исправленная ошибка, вторая попытка и ответ наугад считаются', () => {
    st().recordAnswer({ ...ans(), fixed: true });
    st().recordAnswer({ ...ans({ question: 'q2', correct: false, points: 8 }), secondTry: true });
    st().recordAnswer({ ...ans({ question: 'q3', correct: false, points: 0 }), guess: true });
    expect(day()).toMatchObject({ fixed: 1, secondTry: 1, guesses: 1, tasks: 3, correct: 1 });
  });
  it('верный ответ со второй попытки: баллы начисляются, в «верно с первого раза» не идёт', () => {
    st().recordAnswer({ ...ans({ correct: false, points: 8 }), secondTry: true });
    expect(st().points).toBe(8);
    expect(day().correct).toBe(0);
  });
  it('«Работа над ошибками»: исправленная ошибка тоже считается', () => {
    st().recordAnswer(ans({ correct: false, question: 'x' }));
    st().resolveMistake('math-t01', 'x');
    expect(day().fixed).toBe(1);
    expect(st().fixedMistakes).toBe(1);
  });
  it('брошенный урок и выбор вопроса посложнее считаются и сохраняются в файл', async () => {
    const disk = installFakeDisk();
    store = await freshStore();
    st().markEvent('abandoned');
    st().markEvent('harder');
    st().markEvent('harder');
    expect(day()).toMatchObject({ abandoned: 1, harder: 2 });
    expect((disk.content as { daily: Record<string, unknown> }).daily[store.todayStr()]).toMatchObject({ abandoned: 1, harder: 2 });
  });
  it('новые счётчики не трогают баллы', () => {
    st().markEvent('harder');
    expect(st().points).toBe(0);
  });
});

describe('отчёт для родителя', () => {
  const daily = {
    '2026-03-04': { sec: 600, tasks: 10, correct: 6, fixed: 2, secondTry: 1 },
    '2026-03-08': { sec: 900, tasks: 20, correct: 16, fixed: 3, secondTry: 2, guesses: 4, abandoned: 1, harder: 2, topicIds: ['math-t01'] },
    '2026-03-10': { sec: 300, tasks: 5, correct: 5 },
    '2026-02-28': { sec: 300, tasks: 10, correct: 5 },
  };
  const r = weekReport({ daily, mistakes: [] }, '2026-03-10');
  it('считает новые показатели за неделю', () => {
    expect(r).toMatchObject({ fixed: 5, secondTry: 3, guesses: 4, abandoned: 1, harder: 2, prevPercent: 50 });
  });
  it('«За что похвалить» — конкретные факты, не больше четырёх', () => {
    const ideas = praiseIdeas(r, { title: () => 'Как решать задачу' });
    expect(ideas.length).toBeGreaterThan(0);
    expect(ideas.length).toBeLessThanOrEqual(4);
    expect(ideas.join(' ')).toMatch(/Как решать задачу/);
    expect(ideas.join(' ')).toMatch(/исправил 5 ошибок/);
    expect(ideas.join(' ')).not.toMatch(/умн/i);
  });
  it('пустая неделя — мягкий совет, без упрёков', () => {
    const empty = weekReport({ daily: {}, mistakes: [] }, '2026-03-10');
    expect(praiseIdeas(empty, { title: (x) => x })).toEqual([expect.stringMatching(/сел заниматься|начать/)]);
  });
});
