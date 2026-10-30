import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { freshStore, installFakeDisk } from './helpers/fakeApp';

let store: Awaited<ReturnType<typeof freshStore>>;
let disk: ReturnType<typeof installFakeDisk>;
const st = () => store.useApp.getState();
beforeEach(async () => { disk = installFakeDisk(); store = await freshStore(); });
afterEach(() => vi.unstubAllGlobals());

describe('PIN и настройки родителя', () => {
  it('PIN по умолчанию 0000, и приложение знает, что его ещё не меняли', () => {
    expect(st().settings.pin).toBe('0000');
    expect(st().settings.pinChanged).toBe(false);
  });
  it('смена PIN сохраняется в файл и переживает перезапуск', async () => {
    st().updateSettings({ pin: '2580', pinChanged: true });
    expect((disk.content as { settings: { pin: string } }).settings.pin).toBe('2580');
    store = await freshStore();
    await st().init();
    expect(st().settings.pin).toBe('2580');
    expect(st().settings.pinChanged).toBe(true);
  });
  it('смена одной настройки не стирает остальные', () => {
    st().updateSettings({ pin: '1357', pinChanged: true });
    st().updateSettings({ dailyGoal: 15 });
    expect(st().settings).toMatchObject({ pin: '1357', dailyGoal: 15, rewardThreshold: 100, name: 'Женя' });
  });
  it('все настройки родителя сохраняются: цель дня, лимит, перерыв, тема, масштаб, звук', () => {
    st().updateSettings({ dailyGoal: 20, dailyLimitMin: 45, breakEveryMin: 20, theme: 'dark', fontScale: 1.2, sound: false, name: 'Женя Иванов' });
    expect(st().settings).toMatchObject({ dailyGoal: 20, dailyLimitMin: 45, breakEveryMin: 20, theme: 'dark', fontScale: 1.2, sound: false, name: 'Женя Иванов' });
  });
  it('продление времени на сегодня запоминается только на сегодня', () => {
    st().unlockToday();
    const today = store.todayStr();
    expect(st().daily[today].unlocked).toBe(true);
    expect(Object.keys(st().daily)).toEqual([today]);
  });
  it('ТЕКУЩЕЕ ПОВЕДЕНИЕ: PIN хранится в файле открытым текстом', () => {
    st().updateSettings({ pin: '2580', pinChanged: true });
    expect(JSON.stringify(disk.content)).toContain('"pin":"2580"');
  });
  it('ТЕКУЩЕЕ ПОВЕДЕНИЕ: хранилище не проверяет PIN при смене — проверка «неверный PIN» и ограничение «4–6 цифр» находятся прямо в окне Parent.tsx', () => {
    st().updateSettings({ pin: '1' }); // хранилище принимает что угодно
    expect(st().settings.pin).toBe('1');
  });
});
