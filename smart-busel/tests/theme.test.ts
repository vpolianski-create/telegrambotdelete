import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveTheme } from '../src/engine/theme';
import { freshStore, installFakeDisk } from './helpers/fakeApp';

let store: Awaited<ReturnType<typeof freshStore>>;
afterEach(() => vi.unstubAllGlobals());
const st = () => store.useApp.getState();

describe('тема «Как в Windows»', () => {
  it('настройка theme принимает значение system и сохраняет его в файл', async () => {
    const disk = installFakeDisk();
    store = await freshStore();
    st().updateSettings({ theme: 'dark' });
    st().updateSettings({ theme: 'system' });
    expect(st().settings.theme).toBe('system');
    expect((disk.content as { settings: { theme: string } }).settings.theme).toBe('system');
  });

  it('новый пользователь (файла нет) получает тему system', async () => {
    installFakeDisk(null);
    store = await freshStore();
    await st().init();
    expect(st().settings.theme).toBe('system');
  });

  it('сохранённая светлая тема при загрузке остаётся светлой', async () => {
    installFakeDisk({ points: 40, contentRev: 2, settings: { theme: 'light', pin: '1234' } });
    store = await freshStore();
    await st().init();
    expect(st().settings.theme).toBe('light');
    expect(st().settings.pin).toBe('1234');
    expect(st().points).toBe(40);
  });

  it('сохранённая тёмная тема при загрузке остаётся тёмной', async () => {
    installFakeDisk({ points: 40, contentRev: 2, settings: { theme: 'dark' } });
    store = await freshStore();
    await st().init();
    expect(st().settings.theme).toBe('dark');
  });

  it('импорт резервной копии со светлой или тёмной темой её не меняет', async () => {
    installFakeDisk();
    store = await freshStore();
    st().importData({ points: 5, settings: { theme: 'dark' } });
    expect(st().settings.theme).toBe('dark');
  });

  it('system показывает ту тему, что выбрана в Windows; светлая и тёмная от Windows не зависят', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});
