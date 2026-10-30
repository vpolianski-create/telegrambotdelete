import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ans, freshStore, installFakeDisk } from './helpers/fakeApp';

let store: Awaited<ReturnType<typeof freshStore>>;
afterEach(() => vi.unstubAllGlobals());
const st = () => store.useApp.getState();

describe('сохранение и загрузка прогресса', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-03-10T12:00:00')); });
  afterEach(() => vi.useRealTimers());

  it('после ответа данные записываются в файл', async () => {
    const disk = installFakeDisk();
    store = await freshStore();
    st().recordAnswer(ans({ points: 10 }));
    expect(disk.saves).toBeGreaterThan(0);
    expect((disk.content as { points: number }).points).toBe(10);
  });

  it('«перезапуск»: баллы, награды, темы, ошибки, PIN и настройки возвращаются из файла', async () => {
    const disk = installFakeDisk();
    store = await freshStore();
    st().recordAnswer(ans({ points: 95 }));
    st().recordAnswer(ans({ points: 10, correct: false, question: 'ошибка' }));
    st().finishTopic('math-t01', 100);
    st().updateSettings({ pin: '4321', pinChanged: true, rewardThreshold: 150, name: 'Женя' });
    const before = JSON.parse(JSON.stringify(disk.content));

    store = await freshStore(); // как будто закрыли и открыли программу
    expect(st().points).toBe(0);
    await st().init();
    expect(st().points).toBe(before.points);
    expect(st().rewards).toEqual(before.rewards);
    expect(st().topicResults).toEqual(before.topicResults);
    expect(st().mistakes).toEqual(before.mistakes);
    expect(st().settings.pin).toBe('4321');
    expect(st().settings.rewardThreshold).toBe(150);
    expect(st().ready).toBe(true);
  });

  it('файла нет (первый запуск): стартуем с нуля и настройками по умолчанию, без ошибок', async () => {
    installFakeDisk(null);
    store = await freshStore();
    await st().init();
    expect(st().points).toBe(0);
    expect(st().settings).toMatchObject({ pin: '0000', pinChanged: false, rewardThreshold: 100, name: 'Женя', dailyGoal: 10 });
    expect(st().ready).toBe(true);
  });

  it('файл повреждён (чтение вызвало ошибку): приложение не падает и стартует с нуля', async () => {
    const disk = installFakeDisk({ points: 500 });
    disk.failLoad = true;
    store = await freshStore();
    await expect(st().init()).resolves.toBeUndefined();
    expect(st().points).toBe(0);
    expect(st().ready).toBe(true);
  });

  it('ТЕКУЩЕЕ ПОВЕДЕНИЕ: после повреждённого файла первое же сохранение затирает старые данные', async () => {
    const disk = installFakeDisk({ points: 500 });
    disk.failLoad = true;
    store = await freshStore();
    await st().init();
    disk.failLoad = false;
    expect((disk.content as { points: number }).points).toBe(0); // старые 500 баллов уже заменены нулём
  });

  it('старый файл без новых полей дополняется значениями по умолчанию', async () => {
    installFakeDisk({ points: 40, settings: { name: 'Женя', pin: '1111' } });
    store = await freshStore();
    await st().init();
    expect(st().points).toBe(40);
    expect(st().settings.pin).toBe('1111');
    expect(st().settings.dailyGoal).toBe(10);
    expect(st().rewards).toEqual([]);
    expect(st().plan).toEqual({ date: '', topics: [] });
  });

  it('вне Electron (в браузере) прогресс хранится в localStorage', async () => {
    const mem: Record<string, string> = {};
    vi.stubGlobal('localStorage', { getItem: (k: string) => mem[k] ?? null, setItem: (k: string, v: string) => { mem[k] = v; } });
    vi.stubGlobal('window', {});
    store = await freshStore();
    st().recordAnswer(ans({ points: 10 }));
    expect(JSON.parse(mem['smart-busel-data']).points).toBe(10);
    store = await freshStore();
    await st().init();
    expect(st().points).toBe(10);
  });

  it('повреждённый JSON в localStorage не роняет приложение', async () => {
    vi.stubGlobal('localStorage', { getItem: () => '{ это не json', setItem: () => {} });
    vi.stubGlobal('window', {});
    store = await freshStore();
    await expect(st().init()).resolves.toBeUndefined();
    expect(st().points).toBe(0);
  });
});

describe('резервная копия и импорт', () => {
  beforeEach(() => { installFakeDisk(); });
  it('экспорт содержит весь прогресс, импорт восстанавливает его на чистом хранилище', async () => {
    store = await freshStore();
    st().recordAnswer(ans({ points: 120 }));
    st().finishTopic('math-t01', 90);
    const copy = JSON.parse(JSON.stringify(store.snapshot()));
    store = await freshStore();
    st().importData(copy);
    expect(st().points).toBe(copy.points);
    expect(st().rewards).toEqual(copy.rewards);
    expect(st().topicResults).toEqual(copy.topicResults);
  });
  it('импорт пустого или «не того» файла не стирает настройки по умолчанию', async () => {
    store = await freshStore();
    st().importData({});
    expect(st().settings.pin).toBe('0000');
    expect(st().points).toBe(0);
  });
  it('ТЕКУЩЕЕ ПОВЕДЕНИЕ: импорт не проверяет типы — баллы-строка принимается как есть', async () => {
    store = await freshStore();
    st().importData({ points: 'много' });
    expect(st().points).toBe('много' as unknown as number);
  });
  it('ТЕКУЩЕЕ ПОВЕДЕНИЕ: импорт заменяет прогресс целиком, без предупреждения', async () => {
    store = await freshStore();
    st().recordAnswer(ans({ points: 50 }));
    st().importData({ points: 5 });
    expect(st().points).toBe(5);
  });
});

describe('точка отсчёта наград сохраняется', () => {
  it('после смены порога и «перезапуска» новый порог по-прежнему действует только вперёд', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-10T12:00:00'));
    installFakeDisk();
    store = await freshStore();
    store.useApp.setState({ points: 120 });
    st().updateSettings({ rewardThreshold: 50 });
    store = await freshStore();
    await st().init();
    expect(st().rewards).toHaveLength(0);
    st().recordAnswer(ans({ points: 50 }));
    expect(st().rewards.map((r) => r.points)).toEqual([170]);
    vi.useRealTimers();
  });
});

describe('импорт старой резервной копии сохраняет всю историю', () => {
  it('отметки тем (в том числе по истории) и баллы остаются, как в копии', async () => {
    installFakeDisk();
    store = await freshStore();
    const old = { points: 340, topicResults: { 'history-t05': { bestPercent: 100, attempts: 1, done: true, passBonusGiven: true, stars: 3 }, 'math-t01': { bestPercent: 90, attempts: 1, done: true, passBonusGiven: true } }, opened: ['history-t05'], albumCards: ['history-t05'] };
    st().importData(old);
    expect(Object.keys(st().topicResults).sort()).toEqual(['history-t05', 'math-t01']);
    expect(st().opened).toEqual(['history-t05']);
    expect(st().albumCards).toEqual(['history-t05']);
    expect(st().points).toBe(340);
  });
  it('после импорта и «перезапуска» эти отметки не пропадают', async () => {
    const disk = installFakeDisk();
    store = await freshStore();
    st().importData({ points: 10, topicResults: { 'history-t05': { bestPercent: 100, attempts: 1, done: true, passBonusGiven: true } } });
    expect(Object.keys((disk.content as { topicResults: object }).topicResults)).toEqual(['history-t05']);
    store = await freshStore();
    await st().init();
    expect(Object.keys(st().topicResults)).toEqual(['history-t05']);
  });
});
