import { describe, expect, it } from 'vitest';
import type { Task } from '../src/content/schema';
import { hintsFor, introSteps, MAX_RETRY, MAX_SIMILAR, queueAfterAnswer, type LessonItem } from '../src/engine/lesson';
import { taskPoints } from '../src/engine/points';

const task = (id: string, extra: Partial<Task> = {}): Task => ({
  id, subject: 'history', topicId: 't', difficulty: 'basic', type: 'single', question: `Вопрос ${id}?`,
  options: ['а', 'б'], answer: 'а', explanation: ['потому что'], hints: [], ...extra,
});
const item = (id: string, extra: Partial<LessonItem> = {}): LessonItem => ({ task: task(id), counted: true, ...extra });
const similar = () => task('gen');

describe('очередь заданий урока после ответа', () => {
  it('верный ответ очередь не меняет', () => {
    const items = [item('1'), item('2')];
    expect(queueAfterAnswer(items, 0, true, similar)).toBe(items);
  });
  it('ошибка в обычном задании: оно возвращается в конец урока, в процент не входит', () => {
    const items = [item('1'), item('2'), item('3')];
    const q = queueAfterAnswer(items, 0, false, similar);
    expect(q).toHaveLength(4);
    expect(q[3]).toMatchObject({ counted: false, retry: true });
    expect(q[3].task.id).toBe('1');
    expect(q.slice(0, 3)).toEqual(items);
  });
  it('повторная ошибка в возвращённом задании больше его не возвращает (урок не бесконечный)', () => {
    const items = [item('1'), item('1', { counted: false, retry: true })];
    expect(queueAfterAnswer(items, 1, false, similar)).toBe(items);
  });
  it(`возвращается не больше ${MAX_RETRY} заданий за урок`, () => {
    let items: LessonItem[] = Array.from({ length: 8 }, (_, k) => item(String(k)));
    for (let k = 0; k < 8; k++) items = queueAfterAnswer(items, k, false, similar);
    expect(items.filter((x) => x.retry)).toHaveLength(MAX_RETRY);
  });
  it('ошибка в задании-генераторе: сразу следом идёт новое похожее задание', () => {
    const entry = { generator: 'math.add', difficulty: 'basic' as const };
    const items = [item('1', { entry }), item('2')];
    const q = queueAfterAnswer(items, 0, false, similar);
    expect(q.map((x) => x.task.id)).toEqual(['1', 'gen', '2']);
    expect(q[1]).toMatchObject({ counted: false, similar: true, entry });
  });
  it(`похожих заданий не больше ${MAX_SIMILAR} за урок`, () => {
    const entry = { generator: 'math.add', difficulty: 'basic' as const };
    let items: LessonItem[] = Array.from({ length: 6 }, (_, k) => item(String(k), { entry }));
    let i = 0;
    for (let k = 0; k < 6; k++) { const before = items.length; items = queueAfterAnswer(items, i, false, similar); i += items.length > before ? 2 : 1; }
    expect(items.filter((x) => x.similar)).toHaveLength(MAX_SIMILAR);
  });
  it('за исправленную в конце урока ошибку — половина баллов', () => {
    expect(taskPoints('basic', 0, true)).toBe(5);
  });
});

describe('подсказки к заданию', () => {
  const cards = ['Первая карточка.', 'Вторая карточка с ответом.'];
  it('без своих подсказок: подсказка — нужная карточка урока', () => {
    expect(hintsFor(task('1', { ref: { card: 1, quote: 'Вторая карточка с ответом.' } }), cards))
      .toEqual([{ kind: 'card', text: 'Вторая карточка с ответом.' }]);
  });
  it('сначала свои подсказки, потом карточка; всего не больше двух', () => {
    const h = hintsFor(task('1', { hints: ['Подумай о Ниле', 'Вспомни корону', 'Третья'], ref: { card: 0 } }), cards);
    expect(h).toEqual([{ kind: 'text', text: 'Подумай о Ниле' }, { kind: 'text', text: 'Вспомни корону' }]);
    expect(hintsFor(task('2', { hints: ['Одна'], ref: { card: 0 } }), cards)).toEqual([{ kind: 'text', text: 'Одна' }, { kind: 'card', text: 'Первая карточка.' }]);
  });
  it('нет подсказок и места в уроке — подсказок нет', () => {
    expect(hintsFor(task('1'), cards)).toEqual([]);
  });
  it('номер карточки вне урока не ломает подсказки', () => {
    expect(hintsFor(task('1', { ref: { card: 9 } }), cards)).toEqual([]);
  });
});

describe('порядок объяснения: карточка — и сразу вопрос по ней', () => {
  it('вопрос «проверь себя» идёт сразу после своей карточки', () => {
    const a = task('a', { ref: { card: 1 } });
    const b = task('b', { ref: { card: 0 } });
    const { steps, rest } = introSteps(['к0', 'к1', 'к2'], [a, b]);
    expect(steps.map((s) => (s.kind === 'card' ? `card${s.index}` : s.task.id))).toEqual(['card0', 'b', 'card1', 'a', 'card2']);
    expect(rest).toEqual([]);
  });
  it('вопросы без места в уроке остаются на потом', () => {
    const a = task('a');
    const { steps, rest } = introSteps(['к0'], [a]);
    expect(steps).toEqual([{ kind: 'card', index: 0 }]);
    expect(rest).toEqual([a]);
  });
  it('без карточек шагов нет, вопросы не теряются', () => {
    const a = task('a', { ref: { card: 0 } });
    expect(introSteps([], [a])).toEqual({ steps: [], rest: [a] });
  });
});
