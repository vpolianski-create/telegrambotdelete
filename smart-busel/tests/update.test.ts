import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkForUpdate, isNewer, pickUpdate } from '../src/update/check';

const rel = (v: string, extra: Partial<{ draft: boolean; prerelease: boolean; assets: { name: string; browser_download_url: string }[] }> = {}) => ({
  tag_name: `busel-v${v}`, draft: false, prerelease: false, html_url: `https://github.com/vpolianski-create/telegrambotdelete/releases/tag/busel-v${v}`,
  assets: [
    { name: `Umny-Busel-Setup-${v}.exe`, browser_download_url: `https://github.com/vpolianski-create/telegrambotdelete/releases/download/busel-v${v}/Umny-Busel-Setup-${v}.exe` },
    { name: `Umny-Busel-${v}.apk`, browser_download_url: `https://github.com/vpolianski-create/telegrambotdelete/releases/download/busel-v${v}/Umny-Busel-${v}.apk` },
  ],
  ...extra,
});

describe('проверка новой версии', () => {
  it('сравнение версий', () => {
    expect(isNewer('1.8.0', '1.7.0')).toBe(true);
    expect(isNewer('1.10.0', '1.9.9')).toBe(true);
    expect(isNewer('1.7.0', '1.7.0')).toBe(false);
    expect(isNewer('1.6.9', '1.7.0')).toBe(false);
    expect(isNewer('abc', '1.0.0')).toBe(false);
  });

  it('находит самую новую версию с файлом для своей платформы', () => {
    const list = [rel('1.6.0'), rel('1.8.0'), rel('1.7.1')];
    expect(pickUpdate(list, '1.7.0', 'android')?.url).toMatch(/Umny-Busel-1\.8\.0\.apk$/);
    expect(pickUpdate(list, '1.7.0', 'windows')?.url).toMatch(/Umny-Busel-Setup-1\.8\.0\.exe$/);
    expect(pickUpdate(list, '1.8.0', 'android')).toBeNull();
  });

  it('черновики, пробные выпуски и чужие метки не считаются', () => {
    expect(pickUpdate([rel('2.0.0', { draft: true }), rel('1.9.0', { prerelease: true })], '1.7.0', 'android')).toBeNull();
    expect(pickUpdate([{ ...rel('2.0.0'), tag_name: 'bot-v2.0.0' }], '1.7.0', 'android')).toBeNull();
  });

  it('нет файла для Android (ключ подписи не добавлен) — обновления для телефона нет', () => {
    const r = rel('1.8.0'); r.assets = r.assets.filter((a) => a.name.endsWith('.exe'));
    expect(pickUpdate([r], '1.7.0', 'android')).toBeNull();
    expect(pickUpdate([r], '1.7.0', 'windows')).not.toBeNull();
  });

  it('файл не с GitHub этого репозитория — отвергается', () => {
    const r = rel('1.8.0'); r.assets[1].browser_download_url = 'https://evil.example/Umny-Busel-1.8.0.apk';
    expect(pickUpdate([r], '1.7.0', 'android')).toBeNull();
  });
});

describe('как часто проверяем', () => {
  let store: Record<string, string>;
  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; } });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('второй раз в течение 12 часов в интернет не ходит', async () => {
    const http = vi.fn(async () => new Response(JSON.stringify([rel('1.8.0')]), { status: 200 }));
    expect((await checkForUpdate('1.7.0', 'android', false, http as typeof fetch))?.version).toBe('1.8.0');
    expect((await checkForUpdate('1.7.0', 'android', false, http as typeof fetch))?.version).toBe('1.8.0');
    expect(http).toHaveBeenCalledTimes(1);
    // после обновления программы старое сообщение не показывается
    expect(await checkForUpdate('1.8.0', 'android', false, http as typeof fetch)).toBeNull();
  });

  it('нет интернета — ошибки нет, обновления тоже', async () => {
    const http = vi.fn(async () => { throw new TypeError('offline'); });
    expect(await checkForUpdate('1.7.0', 'android', true, http as typeof fetch)).toBeNull();
  });
});
