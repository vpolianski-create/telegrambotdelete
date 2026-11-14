import { describe, expect, it } from 'vitest';
import { merge, type Data } from '../src/store/useApp';
import {
  applyCounters, changedStamps, counters, founderStamps, hasProgress, mistakeKey, syncMerge,
  type SyncMeta, type SyncPayload,
} from '../src/sync/merge';

/** Модель «облака»: номер устройства → то, что оно туда положило. */
type Cloud = Record<string, SyncPayload>;
interface Device { data: Data }

const meta = (deviceId: string, over: Partial<SyncMeta> = {}): SyncMeta => ({ deviceId, baseline: {}, stamps: {}, removed: [], ...over });
const device = (deviceId: string, over: Partial<Data> = {}, m: Partial<SyncMeta> = {}): Device => {
  const d = merge(null);
  return { data: { ...d, ...over, settings: { ...d.settings, ...(over.settings ?? {}) }, sync: meta(deviceId, m) } };
};
/** Одна синхронизация устройства: забрать чужое из облака, слить, положить своё. */
function sync(dev: Device, cloud: Cloud) {
  const remotes = Object.values(cloud);
  const r = syncMerge(dev.data, dev.data.sync!, remotes, 'test');
  cloud[dev.data.sync!.deviceId] = JSON.parse(JSON.stringify(r.payload));
  dev.data = r.data;
}
/** Ребёнок что-то сделал на устройстве: баллы, задания за день, предмет. */
function earn(dev: Device, points: number, date = '2026-11-14', subject = 'math') {
  const d = dev.data;
  const day = d.daily[date] ?? { sec: 0, tasks: 0, correct: 0, goalDone: false, unlocked: false, bySubject: {} };
  const st = d.subjectStats[subject] ?? { tasks: 0, correct: 0 };
  dev.data = {
    ...d,
    points: d.points + points,
    daily: { ...d.daily, [date]: { ...day, tasks: day.tasks + 1, correct: day.correct + 1, sec: day.sec + 60, bySubject: { ...day.bySubject, [subject]: (day.bySubject?.[subject] ?? 0) + 1 } } },
    subjectStats: { ...d.subjectStats, [subject]: { tasks: st.tasks + 1, correct: st.correct + 1 } },
  };
}

describe('синхронизация: баллы и счётчики складываются', () => {
  it('баллы с компьютера и телефона складываются, у обоих одинаково', () => {
    const cloud: Cloud = {};
    const pc = device('pc'); const phone = device('phone');
    earn(pc, 30); earn(phone, 20);
    sync(pc, cloud); sync(phone, cloud); sync(pc, cloud);
    expect(pc.data.points).toBe(50);
    expect(phone.data.points).toBe(50);
  });

  it('повторные синхронизации ничего не удваивают', () => {
    const cloud: Cloud = {};
    const pc = device('pc'); const phone = device('phone');
    earn(pc, 30); earn(phone, 20);
    for (let i = 0; i < 5; i++) { sync(pc, cloud); sync(phone, cloud); }
    expect(pc.data.points).toBe(50);
    expect(phone.data.points).toBe(50);
    expect(pc.data.subjectStats.math).toEqual({ tasks: 2, correct: 2 });
    expect(phone.data.daily['2026-11-14']).toMatchObject({ tasks: 2, correct: 2, sec: 120, bySubject: { math: 2 } });
  });

  it('занятия между синхронизациями тоже не теряются', () => {
    const cloud: Cloud = {};
    const pc = device('pc'); const phone = device('phone');
    earn(pc, 10); sync(pc, cloud);
    earn(phone, 5); sync(phone, cloud);
    earn(pc, 7); earn(phone, 3); earn(phone, 3);
    sync(pc, cloud); sync(phone, cloud); sync(pc, cloud);
    expect(pc.data.points).toBe(28);
    expect(phone.data.points).toBe(28);
    expect(pc.data.daily['2026-11-14'].tasks).toBe(5);
  });

  it('три устройства: у всех одна и та же сумма', () => {
    const cloud: Cloud = {};
    const a = device('a'); const b = device('b'); const c = device('c');
    earn(a, 1); earn(b, 10); earn(c, 100);
    [a, b, c, a, b, c].forEach((d) => sync(d, cloud));
    expect([a, b, c].map((d) => d.data.points)).toEqual([111, 111, 111]);
  });

  it('разные дни и предметы с разных устройств собираются вместе', () => {
    const cloud: Cloud = {};
    const pc = device('pc'); const phone = device('phone');
    earn(pc, 5, '2026-11-13', 'math'); earn(phone, 5, '2026-11-14', 'english');
    sync(pc, cloud); sync(phone, cloud); sync(pc, cloud);
    for (const d of [pc, phone]) {
      expect(Object.keys(d.data.daily).sort()).toEqual(['2026-11-13', '2026-11-14']);
      expect(d.data.subjectStats).toEqual({ math: { tasks: 1, correct: 1 }, english: { tasks: 1, correct: 1 } });
    }
  });

  it('прогресс, который был на устройстве до подключения, тоже считается (одно устройство — без изменений)', () => {
    const cloud: Cloud = {};
    const pc = device('pc', { points: 340 });
    sync(pc, cloud);
    expect(pc.data.points).toBe(340);
    expect(cloud.pc.own.points).toBe(340);
  });

  it('счётчики → данные → счётчики не меняются', () => {
    const pc = device('pc'); earn(pc, 12); earn(pc, 3, '2026-11-10', 'history');
    const c = counters(pc.data);
    expect(counters(applyCounters(pc.data, c))).toEqual(c);
  });
});

describe('синхронизация: темы, значки, слова', () => {
  it('тема: лучший процент, «пройдено» и звёзды объединяются, попытки складываются', () => {
    const cloud: Cloud = {};
    const pc = device('pc', { topicResults: { 'math-t01': { bestPercent: 60, attempts: 1, done: false, passBonusGiven: false, stars: 1 } } });
    const phone = device('phone', { topicResults: { 'math-t01': { bestPercent: 90, attempts: 2, done: true, passBonusGiven: true, stars: 2, reviewed: '2026-11-10', stage: 0 } } });
    sync(pc, cloud); sync(phone, cloud); sync(pc, cloud);
    for (const d of [pc, phone]) {
      expect(d.data.topicResults['math-t01']).toMatchObject({ bestPercent: 90, attempts: 3, done: true, passBonusGiven: true, stars: 2, reviewed: '2026-11-10' });
    }
  });

  it('значки, карточки, наклейки, открытые темы и грамоты объединяются', () => {
    const cloud: Cloud = {};
    const pc = device('pc', { badges: ['first'], stickers: ['🦊'], opened: ['math-t01'], certificates: { 't:math-t01': '2026-11-10' } });
    const phone = device('phone', { badges: ['combo'], stickers: ['🐼', '🦊'], albumCards: ['history-t01'], certificates: { 't:math-t01': '2026-11-09' } });
    sync(pc, cloud); sync(phone, cloud); sync(pc, cloud);
    for (const d of [pc, phone]) {
      expect([...d.data.badges].sort()).toEqual(['combo', 'first']);
      expect([...d.data.stickers].sort()).toEqual(['🐼', '🦊']);
      expect(d.data.albumCards).toEqual(['history-t01']);
      expect(d.data.opened).toEqual(['math-t01']);
      expect(d.data.certificates['t:math-t01']).toBe('2026-11-09'); // дата — самая ранняя
    }
  });

  it('слово: берётся более позднее повторение', () => {
    const cloud: Cloud = {};
    const pc = device('pc', { leitner: { cat: { box: 3, due: '2026-11-20' } } });
    const phone = device('phone', { leitner: { cat: { box: 1, due: '2026-11-14' }, dog: { box: 2, due: '2026-11-15' } } });
    sync(pc, cloud); sync(phone, cloud);
    expect(phone.data.leitner).toEqual({ cat: { box: 3, due: '2026-11-20' }, dog: { box: 2, due: '2026-11-15' } });
  });

  it('рекорд «Соедини пары» — лучшее (меньшее) время, уровень — больший', () => {
    const cloud: Cloud = {};
    const pc = device('pc', { records: { matchBest: 40 }, levelSeen: 3 });
    const phone = device('phone', { records: { matchBest: 25 }, levelSeen: 2 });
    sync(pc, cloud); sync(phone, cloud); sync(pc, cloud);
    expect(pc.data.records.matchBest).toBe(25);
    expect(phone.data.levelSeen).toBe(3);
  });
});

describe('синхронизация: награды', () => {
  const reward = (id: string, status: 'pending' | 'given', date: string) => ({ id, points: 100 * Number(id.slice(1)), text: '1 час игры на компьютере', status, date });
  it('одна и та же награда не удваивается, «выдано» с любого устройства сохраняется', () => {
    const cloud: Cloud = {};
    const pc = device('pc', { rewards: [reward('r1', 'given', '2026-11-01T10:00:00Z')] });
    const phone = device('phone', { rewards: [reward('r1', 'pending', '2026-11-02T10:00:00Z'), reward('r2', 'pending', '2026-11-03T10:00:00Z')] });
    sync(pc, cloud); sync(phone, cloud); sync(pc, cloud);
    for (const d of [pc, phone]) {
      expect(d.data.rewards.map((r) => [r.id, r.status])).toEqual([['r1', 'given'], ['r2', 'pending']]);
      expect(d.data.rewards[0].date).toBe('2026-11-01T10:00:00Z');
    }
  });
});

describe('синхронизация: «Работа над ошибками»', () => {
  const m = (question: string, date = '2026-11-10') => ({ subject: 'math', topicId: 'math-t01', question, date });
  it('ошибки с двух устройств объединяются', () => {
    const cloud: Cloud = {};
    const pc = device('pc', { mistakes: [m('a')] }); const phone = device('phone', { mistakes: [m('b')] });
    sync(pc, cloud); sync(phone, cloud); sync(pc, cloud);
    expect(pc.data.mistakes.map((x) => x.question).sort()).toEqual(['a', 'b']);
  });
  it('исправленная на одном устройстве ошибка не возвращается с другого', () => {
    const cloud: Cloud = {};
    const pc = device('pc', { mistakes: [m('a'), m('b')] }); const phone = device('phone');
    sync(pc, cloud); sync(phone, cloud);
    expect(phone.data.mistakes).toHaveLength(2);
    // на телефоне ошибку «a» исправили
    phone.data = { ...phone.data, mistakes: phone.data.mistakes.filter((x) => x.question !== 'a'), fixedMistakes: 1, sync: { ...phone.data.sync!, removed: [mistakeKey(m('a'))] } };
    sync(phone, cloud); sync(pc, cloud); sync(phone, cloud);
    for (const d of [pc, phone]) {
      expect(d.data.mistakes.map((x) => x.question)).toEqual(['b']);
      expect(d.data.fixedMistakes).toBe(1);
    }
  });
  it('если ту же задачу снова решили неверно в другой день — ошибка снова в списке', () => {
    const cloud: Cloud = {};
    const pc = device('pc', { mistakes: [m('a', '2026-11-12')] }, { removed: [mistakeKey(m('a', '2026-11-10'))] });
    sync(pc, cloud);
    expect(pc.data.mistakes).toHaveLength(1);
  });
});

describe('синхронизация: настройки', () => {
  it('PIN, изменённый позже, побеждает на всех устройствах; тема и шрифт у каждого свои', () => {
    const cloud: Cloud = {};
    const pc = device('pc', { settings: { pin: '1111', theme: 'dark', fontScale: 1 } as Data['settings'] }, { stamps: { 'settings.pin': 1000 } });
    const phone = device('phone', { settings: { pin: '2222', theme: 'light', fontScale: 1.2 } as Data['settings'] }, { stamps: { 'settings.pin': 2000 } });
    sync(pc, cloud); sync(phone, cloud); sync(pc, cloud);
    expect(pc.data.settings.pin).toBe('2222');
    expect(phone.data.settings.pin).toBe('2222');
    expect(pc.data.settings.theme).toBe('dark');
    expect(phone.data.settings.theme).toBe('light');
    expect(pc.data.settings.fontScale).toBe(1);
    expect(phone.data.settings.fontScale).toBe(1.2);
  });

  it('настройки первого устройства семьи побеждают настройки по умолчанию на новом устройстве', () => {
    const cloud: Cloud = {};
    const pc = device('pc', { settings: { pin: '4321', pinChanged: true, rewardThreshold: 150 } as Data['settings'] });
    pc.data = { ...pc.data, sync: { ...pc.data.sync!, stamps: founderStamps({}) } };
    const phone = device('phone'); // PIN 0000 по умолчанию, меток нет
    sync(pc, cloud); sync(phone, cloud);
    expect(phone.data.settings).toMatchObject({ pin: '4321', pinChanged: true, rewardThreshold: 150 });
  });

  it('метка времени ставится, только когда поле действительно изменилось', () => {
    const a = merge(null);
    const b = { ...a, settings: { ...a.settings, pin: '9999' }, plan: { date: '2026-11-14', topics: ['math-t01'] } };
    const s = changedStamps(a, b, 5000, { lastTopic: 7 });
    expect(s).toEqual({ lastTopic: 7, 'settings.pin': 5000, plan: 5000 });
    expect(changedStamps(a, { ...a }, 6000, s)).toBe(s);
    // смена темы оформления — только для этого устройства, метки нет
    expect(changedStamps(a, { ...a, settings: { ...a.settings, theme: 'dark' } }, 6000, {})).toEqual({});
  });

  it('план на сегодня — побеждает последнее изменение (убранная тема не возвращается)', () => {
    const cloud: Cloud = {};
    const pc = device('pc', { plan: { date: '2026-11-14', topics: ['a', 'b'] } }, { stamps: { plan: 100 } });
    const phone = device('phone', { plan: { date: '2026-11-14', topics: ['a'] } }, { stamps: { plan: 200 } });
    sync(pc, cloud); sync(phone, cloud); sync(pc, cloud);
    expect(pc.data.plan.topics).toEqual(['a']);
  });
});

describe('синхронизация: служебное', () => {
  it('в облако не уходит служебное поле sync', () => {
    const cloud: Cloud = {};
    const pc = device('pc'); earn(pc, 1);
    sync(pc, cloud);
    expect('sync' in cloud.pc.data).toBe(false);
    expect(pc.data.sync?.deviceId).toBe('pc');
  });
  it('свой собственный документ из облака не считается «чужим»', () => {
    const cloud: Cloud = {};
    const pc = device('pc'); earn(pc, 10);
    sync(pc, cloud); sync(pc, cloud); sync(pc, cloud);
    expect(pc.data.points).toBe(10);
  });
  it('есть ли прогресс на устройстве', () => {
    expect(hasProgress(merge(null))).toBe(false);
    expect(hasProgress({ ...merge(null), points: 1 })).toBe(true);
  });
});
