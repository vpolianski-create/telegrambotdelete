/**
 * Проверка новой версии на странице выпусков GitHub (репозиторий публичный — пароли и токены не нужны).
 * Раз в 12 часов приложение спрашивает GitHub о выпусках `busel-vX.Y.Z` и, если есть версия новее,
 * родитель видит «Вышла новая версия» с кнопкой «Скачать». Скачивается файл только с GitHub этого репозитория.
 * Установка — как обычно: Windows — запустить установщик, Android — нажать «Обновить» (прогресс сохраняется).
 */
import { create } from 'zustand';

export const REPO = 'vpolianski-create/telegrambotdelete';
const API = `https://api.github.com/repos/${REPO}/releases?per_page=20`;
const DOWNLOAD_PREFIX = `https://github.com/${REPO}/releases/download/`;
export const RELEASES_PAGE = `https://github.com/${REPO}/releases/latest`;
const EVERY_MS = 12 * 60 * 60 * 1000;
const LS_KEY = 'smart-busel-update-check';

export type UpdatePlatform = 'android' | 'windows';
export interface UpdateInfo { version: string; url: string; page: string }

interface GhRelease { tag_name: string; draft: boolean; prerelease: boolean; html_url: string; assets: { name: string; browser_download_url: string }[] }

const parse = (v: string) => { const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v); return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null; };
/** a > b (версии вида 1.7.0). */
export function isNewer(a: string, b: string): boolean {
  const x = parse(a); const y = parse(b);
  if (!x || !y) return false;
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
}

/** Из списка выпусков GitHub — самая новая версия с файлом для этой платформы, если она новее текущей. */
export function pickUpdate(releases: GhRelease[], current: string, platform: UpdatePlatform): UpdateInfo | null {
  let best: UpdateInfo | null = null;
  for (const r of releases) {
    if (r.draft || r.prerelease || !r.tag_name.startsWith('busel-v')) continue;
    const version = r.tag_name.slice('busel-v'.length);
    if (!parse(version) || !isNewer(version, current)) continue;
    const want = platform === 'android' ? `Umny-Busel-${version}.apk` : `Umny-Busel-Setup-${version}.exe`;
    const asset = r.assets.find((a) => a.name === want);
    // только файл с GitHub этого репозитория — никаких других адресов
    if (!asset || !asset.browser_download_url.startsWith(DOWNLOAD_PREFIX)) continue;
    if (!best || isNewer(version, best.version)) best = { version, url: asset.browser_download_url, page: r.html_url };
  }
  return best;
}

export const useUpdate = create<{ info: UpdateInfo | null }>(() => ({ info: null }));

/** Проверить (не чаще раза в 12 часов; force — сейчас). Ошибки сети молча пропускаются. */
export async function checkForUpdate(current: string, platform: UpdatePlatform, force = false, http: typeof fetch = (...a) => fetch(...a)): Promise<UpdateInfo | null> {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) ?? 'null') as { at: number; info: UpdateInfo | null } | null;
    if (!force && saved && Date.now() - saved.at < EVERY_MS) {
      const info = saved.info && isNewer(saved.info.version, current) ? saved.info : null;
      useUpdate.setState({ info });
      return info;
    }
  } catch { /* нет сохранённой проверки — проверим */ }
  try {
    const res = await http(API, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (!res.ok) return useUpdate.getState().info;
    const info = pickUpdate(await res.json() as GhRelease[], current, platform);
    try { localStorage.setItem(LS_KEY, JSON.stringify({ at: Date.now(), info })); } catch { /* не страшно */ }
    useUpdate.setState({ info });
    return info;
  } catch {
    return useUpdate.getState().info;
  }
}
