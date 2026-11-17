import { describe, expect, it } from 'vitest';
import { earnedCertificates, keepCertificates, ownedCertificates, STREAK_CERTS } from '../src/engine/certificates';
import { inProgramOrder, togglePlan, planFor } from '../src/engine/plan';
import { weekReport } from '../src/engine/report';
import { statusCounts, topicStatus } from '../src/engine/status';
import type { Subject } from '../src/content/schema';

const subj = (ids: string[]): Subject => ({
  id: 'x', title: 'Икс', language: 'ru', color: '#000', icon: '🔭',
  sections: [{ id: 'x-s1', title: 'Раздел', topics: ids.map((id) => ({ id, title: id, status: 'ready' })) }],
} as unknown as Subject);

describe('статусы тем', () => {
  it('не начата / начата / не пройдена / пройдена', () => {
    expect(topicStatus(undefined, false)).toBe('new');
    expect(topicStatus(undefined, true)).toBe('started');
    expect(topicStatus({ done: false, attempts: 1 }, true)).toBe('failed');
    expect(topicStatus({ done: true, attempts: 2 }, true)).toBe('done');
    expect(topicStatus({ done: true, attempts: 1 }, false)).toBe('done');
  });
  it('считает по статусам', () => {
    expect(statusCounts(['new', 'done', 'done', 'failed'])).toEqual({ new: 1, started: 0, failed: 1, done: 2 });
  });
});

describe('план на сегодня', () => {
  it('переключает темы и сбрасывается на следующий день', () => {
    let p = togglePlan(undefined, '2026-01-05', 'a');
    p = togglePlan(p, '2026-01-05', 'b');
    expect(planFor(p, '2026-01-05')).toEqual(['a', 'b']);
    p = togglePlan(p, '2026-01-05', 'a');
    expect(planFor(p, '2026-01-05')).toEqual(['b']);
    expect(planFor(p, '2026-01-06')).toEqual([]);
  });
  it('сортирует по порядку программы', () => {
    expect(inProgramOrder(['c', 'a', 'b'], ['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
  });
});

describe('грамоты — редкие, за очень хорошую работу', () => {
  const s = [subj(['t1', 't2'])];
  it('за одну тему, даже на 100%, грамоты нет (за неё — звёзды и значки)', () => {
    expect(earnedCertificates({ topicResults: { t1: { done: true, stars: 3 } }, daily: {} }, s, '2026-01-05')).toEqual([]);
  });
  it('раздел — только если каждая тема пройдена минимум на 2 звезды (90%+)', () => {
    const weak = earnedCertificates({ topicResults: { t1: { done: true, stars: 3 }, t2: { done: true, stars: 1 } }, daily: {} }, s, '2026-01-05');
    expect(weak.map((c) => c.id)).not.toContain('s:x-s1');
    const strong = earnedCertificates({ topicResults: { t1: { done: true, stars: 3 }, t2: { done: true, stars: 2 } }, daily: {} }, s, '2026-01-05');
    expect(strong.map((c) => c.id)).toContain('s:x-s1');
  });
  it('предмет — когда пройдены все его темы', () => {
    const all = earnedCertificates({ topicResults: { t1: { done: true, stars: 1 }, t2: { done: true, stars: 1 } }, daily: {} }, s, '2026-01-05');
    expect(all.map((c) => c.id)).toEqual(['j:x']);
  });
  it('серия — только 30 и 100 дней подряд (7 и 14 — уже нет)', () => {
    expect(STREAK_CERTS).toEqual([30, 100]);
    const daily: Record<string, { tasks: number }> = {};
    for (let d = 1; d <= 30; d++) daily[`2026-01-${String(d).padStart(2, '0')}`] = { tasks: 3 };
    expect(earnedCertificates({ topicResults: {}, daily }, s, '2026-01-14').map((c) => c.id)).toEqual([]);
    expect(earnedCertificates({ topicResults: {}, daily }, s, '2026-01-30').map((c) => c.id)).toEqual(['k:30']);
  });
  it('в коллекции — только грамоты по новым правилам; полученные по старым удаляются (решение родителя, v1.10.0)', () => {
    const saved = { 't:t1': '2025-01-01', 's:x-s1': '2025-01-02', 'j:x': '2025-01-03', 'k:7': '2025-01-04', 'k:14': '2025-01-05', 'k:30': '2025-02-01', 't:удалённая-тема': '2025-01-06' };
    const weak = { t1: { done: true, stars: 3 }, t2: { done: true, stars: 1 } };
    // за тему и за серию 7/14 дней — грамот больше нет; раздел, где тема ниже 2 звёзд, — не по новым правилам
    expect(keepCertificates(saved, weak, s)).toEqual({ 'j:x': '2025-01-03', 'k:30': '2025-02-01' });
    expect(ownedCertificates(saved, s, weak).map((c) => c.id)).toEqual(['j:x', 'k:30']);
    // раздел, где каждая тема на 2+ звезды, — остаётся с прежней датой
    const strong = { t1: { done: true, stars: 3 }, t2: { done: true, stars: 2 } };
    expect(keepCertificates(saved, strong, s)).toEqual({ 's:x-s1': '2025-01-02', 'j:x': '2025-01-03', 'k:30': '2025-02-01' });
    expect(ownedCertificates(saved, s, strong)[0]).toMatchObject({ kind: 'section', title: 'Раздел «Раздел» пройден' });
    // грамота за предмет — только если все его темы пройдены
    expect(keepCertificates({ 'j:x': '2025-01-03' }, { t1: { done: true, stars: 3 } }, s)).toEqual({});
  });
});

describe('недельный отчёт', () => {
  it('считает минуты, проценты, темы и ошибки', () => {
    const r = weekReport({
      daily: {
        '2026-01-07': { sec: 600, tasks: 10, correct: 8, topicIds: ['t1'] },
        '2026-01-05': { sec: 300, tasks: 10, correct: 6 },
        '2025-12-30': { sec: 1200, tasks: 5, correct: 5 },
      },
      mistakes: [{ topicId: 't1', date: '2026-01-05' }, { topicId: 't1', date: '2026-01-06' }, { topicId: 't2', date: '2025-12-01' }],
    }, '2026-01-07');
    expect(r.minutes).toBe(15);
    expect(r.prevMinutes).toBe(20);
    expect(r.activeDays).toBe(2);
    expect(r.percent).toBe(70);
    expect(r.topicsPassed).toEqual(['t1']);
    expect(r.weakTopics).toEqual([['t1', 2]]);
  });
});

import { questsFor } from '../src/engine/quests';
describe('задания дня', () => {
  it('для любой даты три полноценных задания', () => {
    const subs = [{ id: 'math', title: 'Математика', icon: '🧮' }, { id: 'krugozor', title: 'Кругозор', icon: '🔭' }];
    for (let k = 0; k < 400; k++) {
      const date = new Date(Date.UTC(2026, 0, 1 + k)).toISOString().slice(0, 10);
      const q = questsFor(date, subs);
      expect(q).toHaveLength(3);
      q.forEach((x) => { expect(x.text).toBeTruthy(); expect(x.target).toBeGreaterThan(0); });
    }
  });
});

describe('обновление: сброс тем переписанных предметов', () => {
  it('убирает отметки по history/world/art, но сохраняет баллы, награды и слова', async () => {
    const { merge, CONTENT_REV } = await import('../src/store/useApp');
    const raw = {
      points: 350,
      topicResults: { 'history-t05': { bestPercent: 100, attempts: 1, done: true, passBonusGiven: true }, 'math-t03': { bestPercent: 90, attempts: 2, done: true, passBonusGiven: true }, 'world-t01': { bestPercent: 80, attempts: 1, done: true, passBonusGiven: true } },
      opened: ['history-t05', 'math-t03', 'art-t02'],
      albumCards: ['history-t05', 'math-t03'],
      mistakes: [{ subject: 'history', topicId: 'history-t05', question: 'q', date: '2025-01-01' }, { subject: 'math', topicId: 'math-t03', question: 'q2', date: '2025-01-01' }],
      certificates: { 't:history-t05': '2025-01-01', 'k:30': '2025-01-02', 'j:history': '2025-01-03' },
      leitner: { 'food-01': { box: 3, due: '2025-01-01' } },
      lastTopic: { subjectId: 'history', topicId: 'history-t05' },
    } as never;
    const d = merge(raw);
    expect(d.points).toBe(350);
    expect(Object.keys(d.topicResults)).toEqual(['math-t03']);
    expect(d.opened).toEqual(['math-t03']);
    expect(d.albumCards).toEqual(['math-t03']);
    expect(d.mistakes.map((m) => m.topicId)).toEqual(['math-t03']);
    expect(Object.keys(d.certificates)).toEqual(['k:30']);
    expect(Object.keys(d.leitner)).toEqual(['food-01']);
    expect(d.lastTopic).toBeNull();
    expect(d.contentRev).toBe(CONTENT_REV);
    // повторная загрузка ничего не меняет
    expect(merge(d)).toEqual(d);
  });
});
