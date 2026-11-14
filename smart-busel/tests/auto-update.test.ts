import { beforeEach, describe, expect, it, vi } from 'vitest';
import { connectWindows, createAndroidFlow, needsParent, useAutoUpdate, type AndroidUpdater } from '../src/update/auto';

const info = (v: string) => ({ version: v, url: `https://github.com/vpolianski-create/telegrambotdelete/releases/download/busel-v${v}/Umny-Busel-${v}.apk`, page: 'x' });

function fakePlugin(over: Partial<{ canInstall: boolean; failDownload: boolean }> = {}) {
  const st = { canInstall: over.canInstall ?? true, readyVersion: undefined as string | undefined, installs: 0, downloads: 0 };
  const plugin: AndroidUpdater = {
    status: async () => ({ canInstall: st.canInstall, readyVersion: st.readyVersion }),
    download: async ({ version }) => { st.downloads++; if (over.failDownload) throw new Error('net'); st.readyVersion = version; return { readyVersion: version }; },
    install: async () => { st.installs++; },
    openInstallPermission: async () => { st.canInstall = true; },
  };
  return { st, plugin };
}
/** Таймеры «вручную»: что запланировано — выполняется по команде. */
function manualTimers() {
  const q = new Map<number, () => void>(); let id = 0;
  return {
    timers: { set: ((fn: () => void) => { q.set(++id, fn); return id; }) as unknown as typeof setTimeout, clear: ((h: number) => { q.delete(h); }) as unknown as typeof clearTimeout },
    flush: () => { const fns = [...q.values()]; q.clear(); fns.forEach((f) => f()); },
    size: () => q.size,
  };
}

beforeEach(() => useAutoUpdate.setState({ kind: 'none', state: 'idle', version: undefined, canInstall: undefined, needsConfirm: undefined, url: undefined }, true));

describe('автообновление на Android', () => {
  it('есть новая версия → скачивается; приложение свернули → через 5 секунд тихо ставится', async () => {
    const { st, plugin } = fakePlugin();
    const t = manualTimers();
    const flow = createAndroidFlow(plugin, '1.7.0', async () => info('1.8.0'), t.timers);
    await flow.run();
    expect(useAutoUpdate.getState()).toMatchObject({ kind: 'android', state: 'ready', version: '1.8.0' });
    flow.onActive(false);
    expect(st.installs).toBe(0); // не сразу
    t.flush();
    await Promise.resolve();
    expect(st.installs).toBe(1);
  });

  it('свернули и сразу открыли снова — установка отменяется (не прерываем занятие)', async () => {
    const { st, plugin } = fakePlugin();
    const t = manualTimers();
    const flow = createAndroidFlow(plugin, '1.7.0', async () => info('1.8.0'), t.timers);
    await flow.run();
    flow.onActive(false);
    flow.onActive(true);
    expect(t.size()).toBe(0);
    expect(st.installs).toBe(0);
  });

  it('нет разрешения на установку — не ставим, родителю нужна точка; после разрешения — ставим', async () => {
    const { st, plugin } = fakePlugin({ canInstall: false });
    const t = manualTimers();
    const flow = createAndroidFlow(plugin, '1.7.0', async () => info('1.8.0'), t.timers);
    await flow.run();
    expect(needsParent(useAutoUpdate.getState())).toBe(true);
    flow.onActive(false);
    t.flush();
    expect(st.installs).toBe(0);
    await flow.openPermission();
    await flow.run();
    expect(needsParent(useAutoUpdate.getState())).toBe(false);
    flow.onActive(false); t.flush(); await Promise.resolve();
    expect(st.installs).toBe(1);
  });

  it('новой версии нет — ничего не скачивается', async () => {
    const { st, plugin } = fakePlugin();
    const flow = createAndroidFlow(plugin, '1.7.0', async () => null);
    await flow.run();
    expect(st.downloads).toBe(0);
    expect(useAutoUpdate.getState().state).toBe('latest');
  });

  it('та же версия уже скачана — второй раз не скачивается', async () => {
    const { st, plugin } = fakePlugin();
    const flow = createAndroidFlow(plugin, '1.7.0', async () => info('1.8.0'));
    await flow.run(); await flow.run();
    expect(st.downloads).toBe(1);
  });

  it('ошибка скачивания — состояние «ошибка», есть ссылка «скачать вручную», программа не падает', async () => {
    const { plugin } = fakePlugin({ failDownload: true });
    const flow = createAndroidFlow(plugin, '1.7.0', async () => info('1.8.0'));
    await flow.run();
    expect(useAutoUpdate.getState()).toMatchObject({ state: 'error', url: info('1.8.0').url });
  });
});

describe('автообновление на Windows', () => {
  it('состояние приходит из программы (скачивается → готово)', async () => {
    let cb: (s: unknown) => void = () => undefined;
    connectWindows({ updateGet: async () => ({ state: 'downloading', version: '1.8.0', percent: 10 }), onUpdateState: (f) => { cb = f; return () => undefined; } });
    await vi.waitFor(() => expect(useAutoUpdate.getState()).toMatchObject({ kind: 'windows', state: 'downloading', percent: 10 }));
    cb({ state: 'ready', version: '1.8.0' });
    expect(useAutoUpdate.getState()).toMatchObject({ state: 'ready', version: '1.8.0' });
    expect(needsParent(useAutoUpdate.getState())).toBe(false);
  });
});
