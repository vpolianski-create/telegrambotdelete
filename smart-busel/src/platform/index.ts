/**
 * Всё, что на Windows и Android делается по-разному, собрано здесь:
 * хранение прогресса и секретов, сохранение файла копии, печать, кнопка «Назад», цвет системных панелей.
 * Модули Capacitor подгружаются только на Android, в программу для Windows они не попадают.
 */
import type { SyncSecrets, SecretStore } from '../sync/service';
import { createFileStore, type MiniFs } from './fileStore';

interface CapacitorGlobal { getPlatform(): string; isNativePlatform(): boolean }
const cap = (): CapacitorGlobal | undefined => (globalThis as { window?: { Capacitor?: CapacitorGlobal } }).window?.Capacitor;

export const isAndroid = (): boolean => cap()?.getPlatform?.() === 'android';
export const isElectron = (): boolean => typeof window !== 'undefined' && !!window.busel;
/** Телефон или планшет (для подсказок в интерфейсе). */
export const platformName = (): 'android' | 'windows' | 'web' => (isAndroid() ? 'android' : isElectron() ? 'windows' : 'web');

const LS_KEY = 'smart-busel-data';
const SECRET_FILE = 'sync-secret.json';
const LS_SECRET = 'smart-busel-sync-secret';

// ——— файловая система Android (личная папка приложения: другие программы её не видят) ———
let fsPromise: Promise<MiniFs> | null = null;
function androidFs(): Promise<MiniFs> {
  fsPromise ??= (async () => {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const at = (path: string) => ({ path, directory: Directory.Data });
    const exists = async (path: string) => { try { await Filesystem.stat(at(path)); return true; } catch { return false; } };
    return {
      read: async (path) => {
        try { return (await Filesystem.readFile({ ...at(path), encoding: Encoding.UTF8 })).data as string; }
        catch (e) { if (await exists(path)) throw e; return null; } // файл есть, но не читается — не делаем вид, что его нет
      },
      write: async (path, data) => { await Filesystem.writeFile({ ...at(path), data, encoding: Encoding.UTF8, recursive: true }); },
      rename: async (from, to) => { await Filesystem.rename({ from, to, directory: Directory.Data, toDirectory: Directory.Data }); },
      remove: async (path) => { await Filesystem.deleteFile(at(path)); },
      list: async (dir) => { try { return (await Filesystem.readdir(at(dir))).files.map((f) => f.name); } catch { return []; } },
    };
  })();
  return fsPromise;
}
let androidStore: Promise<ReturnType<typeof createFileStore>> | null = null;
function androidData() {
  androidStore ??= (async () => {
    const s = createFileStore(await androidFs());
    await s.backupOnStart().catch(() => undefined);
    return s;
  })();
  return androidStore;
}

// ——— прогресс ———
export async function loadData(): Promise<unknown> {
  if (window.busel) return window.busel.load();
  if (isAndroid()) return (await androidData()).load();
  return JSON.parse(localStorage.getItem(LS_KEY) ?? 'null');
}
export function saveData(d: unknown): void {
  if (window.busel) { void window.busel.save(d as never); return; }
  if (isAndroid()) { void androidData().then((s) => s.save(d)); return; }
  localStorage.setItem(LS_KEY, JSON.stringify(d));
}

// ——— секреты синхронизации (семейный код, пропуск входа) ———
/**
 * Windows: зашифрованы средствами Windows (DPAPI через Electron safeStorage).
 * Android: личная папка приложения, исключена из резервного копирования Google (см. android/app/src/main/res/xml).
 */
export const secretStore: SecretStore = {
  async get(): Promise<SyncSecrets | null> {
    try {
      let text: string | null;
      if (window.busel?.secretGet) text = await window.busel.secretGet();
      else if (isAndroid()) text = await (await androidFs()).read(SECRET_FILE);
      else text = localStorage.getItem(LS_SECRET);
      if (!text) return null;
      const v = JSON.parse(text) as SyncSecrets;
      return typeof v?.code === 'string' ? v : null;
    } catch { return null; }
  },
  async set(s: SyncSecrets | null): Promise<void> {
    const text = s ? JSON.stringify(s) : null;
    if (window.busel?.secretSet) { await window.busel.secretSet(text); return; }
    if (isAndroid()) {
      const fs = await androidFs();
      if (text) await fs.write(SECRET_FILE, text); else await fs.remove(SECRET_FILE).catch(() => undefined);
      return;
    }
    if (text) localStorage.setItem(LS_SECRET, text); else localStorage.removeItem(LS_SECRET);
  },
};

// ——— файл резервной копии ———
/** Windows — обычное «Сохранить файл»; Android — системное окно «Поделиться» (Диск, почта, мессенджер, «Файлы»). */
export async function saveTextFile(name: string, text: string): Promise<void> {
  if (isAndroid()) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const { uri } = await Filesystem.writeFile({ path: `export/${name}`, data: text, directory: Directory.Cache, encoding: Encoding.UTF8, recursive: true });
    await Share.share({ title: name, files: [uri], dialogTitle: 'Сохранить копию прогресса' });
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}

// ——— печать грамот и отчёта ———
interface PrintPlugin { print(o: { name: string }): Promise<void> }
let printer: PrintPlugin | null = null;
/** Android — системное окно печати (там же «Сохранить как PDF»). Windows — обычная печать. */
export async function printPage(name = 'Умный Бусел'): Promise<void> {
  if (isAndroid()) {
    if (!printer) { const { registerPlugin } = await import('@capacitor/core'); printer = registerPlugin<PrintPlugin>('BuselPrint'); }
    await printer.print({ name });
    return;
  }
  window.print();
}

// ——— системная кнопка «Назад» на Android ———
/** Экран может сам обработать «Назад» (закрыть раздел, грамоту, тренировку) — последний добавленный первым. */
const backInterceptors: (() => boolean)[] = [];
export function interceptBack(handler: () => boolean): () => void {
  backInterceptors.push(handler);
  return () => { const i = backInterceptors.lastIndexOf(handler); if (i >= 0) backInterceptors.splice(i, 1); };
}
export function runBackInterceptors(): boolean {
  for (let i = backInterceptors.length - 1; i >= 0; i--) if (backInterceptors[i]()) return true;
  return false;
}

/** handler возвращает true, если «назад» обработан в приложении; иначе приложение сворачивается (как принято на Android). */
export function onBackButton(handler: () => boolean): () => void {
  if (!isAndroid()) return () => undefined;
  let remove: (() => void) | undefined;
  let cancelled = false;
  void import('@capacitor/app').then(async ({ App }) => {
    const h = await App.addListener('backButton', () => { if (!handler()) void App.minimizeApp(); });
    if (cancelled) void h.remove(); else remove = () => void h.remove();
  });
  return () => { cancelled = true; remove?.(); };
}

/** Приложение ушло в фон или вернулось (для синхронизации). */
export function onAppState(handler: (active: boolean) => void): void {
  if (isAndroid()) {
    void import('@capacitor/app').then(({ App }) => App.addListener('appStateChange', (s) => handler(s.isActive)));
    return;
  }
  document.addEventListener('visibilitychange', () => handler(document.visibilityState === 'visible'));
}

// ——— скачать новую версию (только с GitHub этого репозитория) ———
const RELEASES = 'https://github.com/vpolianski-create/telegrambotdelete/releases/';
/** Windows — откроется браузер и скачает установщик; Android — браузер скачает APK, затем «Обновить». */
export function openDownload(url: string): void {
  if (!url.startsWith(RELEASES)) return;
  if (window.busel?.openExternal) { void window.busel.openExternal(url); return; }
  if (isAndroid()) { window.location.href = url; return; } // Capacitor открывает внешние адреса в браузере
  window.open(url, '_blank', 'noopener');
}

// ——— цвет значков в строке состояния ———
export function applySystemTheme(setting: string, dark: boolean): void {
  window.busel?.setTheme?.(setting); // Windows: заголовок окна того же цвета
  if (!isAndroid()) return;
  void import('@capacitor/core').then(({ SystemBars, SystemBarsStyle }) =>
    SystemBars.setStyle({ style: dark ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(() => undefined));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b1020' : '#f4f6fc');
}
