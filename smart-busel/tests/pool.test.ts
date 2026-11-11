import { describe, expect, it } from 'vitest';
import type { Entry, Task } from '../src/content/schema';
import { subjects } from '../src/content/loader';
import { rebuildTask } from '../src/content/review';
import { checkAnswer } from '../src/engine/answers';
import { samplePractice } from '../src/engine/lesson';
import { seeded } from '../src/engine/rng';
// @ts-expect-error — списки сборки уроков написаны на обычном JS
import { artDrop } from '../content-src/art-pool.mjs';
// @ts-expect-error — то же
import { englishDrop } from '../content-src/english-pool.mjs';
// @ts-expect-error — то же
import { historyDrop } from '../content-src/history-pool.mjs';
// @ts-expect-error — то же
import { krugozorDrop } from '../content-src/krugozor-pool.mjs';
// @ts-expect-error — то же
import { worldDrop } from '../content-src/world-pool.mjs';

const task = (id: string, extra: Partial<Task> = {}): Task => ({
  id, subject: 'history', topicId: 't', difficulty: 'basic', type: 'single', question: `Вопрос ${id}?`,
  options: ['а', 'б'], answer: 'а', explanation: ['потому что'], hints: [], ...extra,
});
const gen: Entry = { generator: 'math.add', difficulty: 'basic' };

describe('выборка заданий из запаса темы', () => {
  const practice: Entry[] = [task('p1'), task('p2'), gen, task('p3'), task('adv', { difficulty: 'advanced' }), task('pic', { image: 'art/x.jpg' })];
  const pool = [task('q1'), task('q2'), task('q3'), task('q4'), task('q5')];
  const ids = (list: Entry[]) => list.map((e) => ('generator' in e ? 'gen' : e.id));

  it('запаса нет — практика не меняется', () => {
    expect(samplePractice(practice, [], seeded(1))).toBe(practice);
  });
  it('длина урока прежняя; генераторы, повышенные задания и картины остаются на местах', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const out = ids(samplePractice(practice, pool, seeded(seed)));
      expect(out).toHaveLength(practice.length);
      expect(out[2]).toBe('gen');
      expect(out[4]).toBe('adv');
      expect(out[5]).toBe('pic');
    }
  });
  it('обычные вопросы берутся из практики и запаса без повторов', () => {
    const allowed = new Set(['p1', 'p2', 'p3', 'q1', 'q2', 'q3', 'q4', 'q5']);
    for (let seed = 1; seed <= 30; seed++) {
      const out = ids(samplePractice(practice, pool, seeded(seed)));
      const basics = [out[0], out[1], out[3]];
      basics.forEach((id) => expect(allowed.has(id)).toBe(true));
      expect(new Set(basics).size).toBe(3);
    }
  });
  it('за несколько прохождений встречаются все вопросы запаса — уроки получаются разными', () => {
    const seen = new Set<string>();
    const variants = new Set<string>();
    for (let seed = 1; seed <= 60; seed++) { const out = ids(samplePractice(practice, pool, seeded(seed))); out.forEach((x) => seen.add(x)); variants.add(out.join()); }
    pool.forEach((t) => expect(seen.has(t.id)).toBe(true));
    expect(variants.size).toBeGreaterThan(10);
  });
});

describe('запас вопросов в настоящих уроках', () => {
  const topics = subjects.flatMap((s) => s.sections.flatMap((sec) => sec.topics.map((topic) => ({ s, topic }))));
  const pooled = topics.filter((x) => x.topic.pool.length > 0);

  it('у вопросов запаса верный ответ среди вариантов, варианты разные, id не повторяются', () => {
    const seenIds = new Set<string>();
    for (const { topic } of topics) for (const e of [...topic.selfCheck, ...topic.practice, ...topic.bonus, ...topic.pool]) {
      if ('generator' in e) continue;
      expect(seenIds.has(e.id), e.id).toBe(false);
      seenIds.add(e.id);
    }
    for (const { topic } of pooled) for (const t of topic.pool) {
      expect(t.difficulty).toBe('basic');
      expect(t.explanation[0].length, t.id).toBeGreaterThan(15);
      if (t.type === 'single') {
        expect(new Set(t.options).size, t.id).toBe(t.options!.length);
        expect(t.options!.length, t.id).toBe(4);
        expect(checkAnswer(t, t.answer as string), t.id).toBe(true);
        expect(t.options, t.id).toContain(t.answer);
      }
    }
  });
  it('в теме нет двух одинаковых вопросов', () => {
    for (const { topic } of pooled) {
      const qs = [...topic.selfCheck, ...topic.practice, ...topic.bonus, ...topic.pool].filter((e): e is Task => !('generator' in e) && !e.image).map((t) => t.question);
      expect(new Set(qs).size, topic.id).toBe(qs.length);
    }
  });
  it('каждый вопрос запаса опирается на текст урока: место в уроке есть у всех, дословная цитата — почти у всех', () => {
    const all = pooled.flatMap((x) => x.topic.pool);
    if (!all.length) return;
    all.forEach((t) => expect(t.ref, `${t.id}: ${t.question}`).toBeDefined());
    expect(all.filter((t) => t.ref?.quote).length / all.length).toBeGreaterThanOrEqual(0.9);
  });
  it('ошибку в вопросе из запаса можно повторить в «Работе над ошибками»', () => {
    for (const { s, topic } of pooled.slice(0, 5)) {
      const t = topic.pool[0];
      expect(rebuildTask({ subject: s.id, topicId: topic.id, question: t.question, taskId: t.id })?.id).toBe(t.id);
    }
  });
});

describe('вопросы без опоры на урок убраны', () => {
  const all = new Set(subjects.flatMap((s) => s.sections.flatMap((sec) => sec.topics.flatMap((t) =>
    [...t.selfCheck, ...t.practice, ...t.bonus, ...t.pool].filter((e): e is Task => !('generator' in e)).map((e) => e.id)))));
  it('убранных вопросов нет ни в одном уроке', () => {
    const dropped: string[] = [...artDrop, ...englishDrop, ...historyDrop, ...krugozorDrop, ...worldDrop];
    expect(dropped.length).toBeGreaterThan(50);
    dropped.forEach((id) => expect(all.has(id), id).toBe(false));
  });
  it('в каждой готовой теме осталась практика', () => {
    for (const s of subjects) for (const sec of s.sections) for (const t of sec.topics) {
      if (t.status === 'ready') expect(t.practice.length, t.id).toBeGreaterThanOrEqual(4);
    }
  });
});
