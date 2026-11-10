import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { afterReview, dueTopics, isDue, REVIEW_DAYS, WARMUP_BONUS, WARMUP_TOPICS } from '../src/engine/warmup';
import { freshStore, installFakeDisk } from './helpers/fakeApp';

const done = (extra = {}) => ({ bestPercent: 90, attempts: 1, done: true, passBonusGiven: true, ...extra });

describe('когда тему пора повторить', () => {
  it('не пройденная тема не повторяется', () => {
    expect(isDue({ ...done(), done: false }, '2026-03-10')).toBe(false);
  });
  it(`первое повторение — через ${REVIEW_DAYS[0]} дня после прохождения`, () => {
    const r = done({ reviewed: '2026-03-01', stage: 0 });
    expect(isDue(r, '2026-03-03')).toBe(false);
    expect(isDue(r, '2026-03-04')).toBe(true);
    expect(isDue(r, '2026-04-20')).toBe(true);
  });
  it('интервалы растут: 3, 7, 21, 60 дней', () => {
    expect(REVIEW_DAYS).toEqual([3, 7, 21, 60]);
    const r = done({ reviewed: '2026-03-01', stage: 2 });
    expect(isDue(r, '2026-03-21')).toBe(false);
    expect(isDue(r, '2026-03-22')).toBe(true);
  });
  it('после последней ступени повторяем раз в 60 дней', () => {
    const r = done({ reviewed: '2026-01-01', stage: 9 });
    expect(isDue(r, '2026-02-28')).toBe(false);
    expect(isDue(r, '2026-03-02')).toBe(true);
  });
  it('тема, пройденная в старой версии (без даты), считается готовой к повторению', () => {
    expect(isDue(done(), '2026-03-10')).toBe(true);
  });
  it('переход через месяц и год считается верно', () => {
    expect(isDue(done({ reviewed: '2025-12-30', stage: 0 }), '2026-01-01')).toBe(false);
    expect(isDue(done({ reviewed: '2025-12-30', stage: 0 }), '2026-01-02')).toBe(true);
  });
});

describe('какие темы попадают в разминку', () => {
  it('сначала те, что ждут дольше всех; не больше лимита', () => {
    const results = {
      a: done({ reviewed: '2026-03-05', stage: 0 }),
      b: done({ reviewed: '2026-02-01', stage: 0 }),
      c: done({ reviewed: '2026-03-09', stage: 0 }), // ещё рано
      d: done({ reviewed: '2026-02-20', stage: 0 }),
      e: { ...done(), done: false },
    };
    expect(dueTopics(results, '2026-03-10', 2)).toEqual(['b', 'd']);
    expect(dueTopics(results, '2026-03-10', 10)).toEqual(['b', 'd', 'a']);
  });
  it('нет пройденных тем — разминки нет', () => {
    expect(dueTopics({}, '2026-03-10', 3)).toEqual([]);
  });
});

describe('ступень повторения после разминки', () => {
  it('всё верно — следующая ступень, дата обновляется', () => {
    expect(afterReview(done({ reviewed: '2026-03-01', stage: 1 }), true, '2026-03-10')).toMatchObject({ stage: 2, reviewed: '2026-03-10' });
  });
  it('была ошибка — ступень сбрасывается, тема придёт снова через 3 дня', () => {
    const r = afterReview(done({ reviewed: '2026-03-01', stage: 3 }), false, '2026-03-10');
    expect(r).toMatchObject({ stage: 0, reviewed: '2026-03-10' });
    expect(isDue(r, '2026-03-12')).toBe(false);
    expect(isDue(r, '2026-03-13')).toBe(true);
  });
  it('результат темы (процент, звёзды) не меняется', () => {
    const r = afterReview(done({ stars: 3 }), false, '2026-03-10');
    expect(r).toMatchObject({ bestPercent: 90, done: true, stars: 3 });
  });
});

describe('разминка в хранилище', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date(2026, 2, 10, 12)); installFakeDisk(); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('пройденная тема запоминает дату и ждёт первого повторения', async () => {
    const { useApp } = await freshStore();
    await useApp.getState().init();
    useApp.getState().finishTopic('math-t01', 90);
    expect(useApp.getState().topicResults['math-t01']).toMatchObject({ reviewed: '2026-03-10', stage: 0 });
    expect(dueTopics(useApp.getState().topicResults, '2026-03-10', WARMUP_TOPICS)).toEqual([]);
    expect(dueTopics(useApp.getState().topicResults, '2026-03-13', WARMUP_TOPICS)).toEqual(['math-t01']);
  });
  it('не пройденная тема (меньше 80%) в расписание не попадает', async () => {
    const { useApp } = await freshStore();
    await useApp.getState().init();
    useApp.getState().finishTopic('math-t01', 60);
    expect(useApp.getState().topicResults['math-t01'].reviewed).toBeUndefined();
  });
  it('повторное прохождение уже пройденной темы расписание не сбрасывает', async () => {
    const { useApp } = await freshStore();
    await useApp.getState().init();
    useApp.getState().finishTopic('math-t01', 90);
    useApp.setState({ topicResults: { 'math-t01': { ...useApp.getState().topicResults['math-t01'], reviewed: '2026-03-01', stage: 2 } } });
    useApp.getState().finishTopic('math-t01', 100);
    expect(useApp.getState().topicResults['math-t01']).toMatchObject({ reviewed: '2026-03-01', stage: 2 });
  });
  it(`бонус за разминку +${WARMUP_BONUS} даётся один раз в день; ступени тем обновляются`, async () => {
    const { useApp } = await freshStore();
    await useApp.getState().init();
    useApp.setState({ topicResults: { a: done({ reviewed: '2026-03-01', stage: 0 }), b: done({ reviewed: '2026-03-01', stage: 1 }) } });
    const before = useApp.getState().points;
    expect(useApp.getState().finishWarmup({ a: true, b: false })).toBe(WARMUP_BONUS);
    expect(useApp.getState().points).toBe(before + WARMUP_BONUS);
    expect(useApp.getState().topicResults.a).toMatchObject({ stage: 1, reviewed: '2026-03-10' });
    expect(useApp.getState().topicResults.b).toMatchObject({ stage: 0, reviewed: '2026-03-10' });
    useApp.setState({ topicResults: { ...useApp.getState().topicResults, c: done({ reviewed: '2026-03-01', stage: 0 }) } });
    expect(useApp.getState().finishWarmup({ c: true })).toBe(0);
    expect(useApp.getState().points).toBe(before + WARMUP_BONUS);
    expect(useApp.getState().topicResults.c).toMatchObject({ stage: 1 });
  });
  it('бонус за разминку сохраняется после перезапуска и на следующий день даётся снова', async () => {
    const { useApp } = await freshStore();
    await useApp.getState().init();
    useApp.setState({ topicResults: { a: done() } });
    useApp.getState().finishWarmup({ a: true });
    const saved = useApp.getState().points;
    await useApp.getState().init();
    expect(useApp.getState().points).toBe(saved);
    expect(useApp.getState().finishWarmup({ a: true })).toBe(0);
    vi.setSystemTime(new Date(2026, 2, 11, 12));
    expect(useApp.getState().finishWarmup({ a: true })).toBe(WARMUP_BONUS);
  });
  it('пустая разминка ничего не начисляет', async () => {
    const { useApp } = await freshStore();
    await useApp.getState().init();
    expect(useApp.getState().finishWarmup({})).toBe(0);
    expect(useApp.getState().points).toBe(0);
  });
});
