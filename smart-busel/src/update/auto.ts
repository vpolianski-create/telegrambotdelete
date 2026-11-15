/**
 * Автообновление: Windows — electron-updater (electron/updater.ts), Android — свой модуль (UpdaterPlugin.java).
 *
 * Android:
 *  - при запуске и при возвращении в приложение — проверка GitHub (раз в 12 часов, src/update/check.ts);
 *  - есть новая версия — APK скачивается в фоне и проверяется (тот же пакет, та же подпись, версия новее);
 *  - когда приложение свернули (через 5 секунд, если его не открыли снова) — тихая установка;
 *  - один раз родитель должен разрешить «установку неизвестных приложений» для «Умного Бусела».
 * Windows: скачивается в фоне, ставится при закрытии программы (или кнопкой «Перезапустить и обновить»).
 */
import { create } from 'zustand';
import { checkForUpdate, type UpdateInfo } from './check';

export type AutoKind = 'windows' | 'android' | 'none';
export type AutoPhase = 'idle' | 'checking' | 'latest' | 'downloading' | 'ready' | 'error';
export interface AutoState {
  kind: AutoKind;
  state: AutoPhase;
  version?: string;
  percent?: number;
  /** Android: разрешена ли установка обновлений (настройка «Установка неизвестных приложений»). */
  canInstall?: boolean;
  /** Android: система попросила подтвердить обновление («Обновить»). */
  needsConfirm?: boolean;
  /** Ссылка на APK — на случай, если автоматически не получилось (скачать вручную). */
  url?: string;
}
export const useAutoUpdate = create<AutoState>(() => ({ kind: 'none', state: 'idle' }));
const set = (p: Partial<AutoState>) => useAutoUpdate.setState(p);

/** Нужно ли что-то сделать родителю (жёлтая точка на «Родителям»). */
export const needsParent = (s: AutoState): boolean =>
  s.kind === 'android' && (s.canInstall === false || !!s.needsConfirm);

// ——— Android ———
export interface AndroidUpdater {
  status(): Promise<{ canInstall: boolean; readyVersion?: string; needsConfirm?: boolean; lastError?: string }>;
  download(o: { url: string; version: string }): Promise<{ readyVersion: string }>;
  install(): Promise<void>;
  openInstallPermission(): Promise<void>;
}

export interface AndroidFlow {
  run(force?: boolean): Promise<void>;
  installNow(): Promise<void>;
  openPermission(): Promise<void>;
  /** Приложение свернули (false) / открыли снова (true). */
  onActive(active: boolean): void;
}

export const INSTALL_DELAY_MS = 5000;

export function createAndroidFlow(
  plugin: AndroidUpdater,
  current: string,
  check: (current: string, force: boolean) => Promise<UpdateInfo | null> = (c, f) => checkForUpdate(c, 'android', f),
  timers: { set: typeof setTimeout; clear: typeof clearTimeout } = { set: setTimeout, clear: clearTimeout },
): AndroidFlow {
  let busy = false;
  let pendingInstall: ReturnType<typeof setTimeout> | null = null;

  async function refresh() {
    const s = await plugin.status();
    set({
      kind: 'android', canInstall: s.canInstall, needsConfirm: !!s.needsConfirm,
      ...(s.readyVersion ? { state: 'ready', version: s.readyVersion } : {}),
    });
  }

  async function run(force = false) {
    if (busy) return;
    busy = true;
    try {
      await refresh().catch(() => undefined);
      const info = await check(current, force);
      const st = useAutoUpdate.getState();
      if (!info) {
        if (st.state !== 'ready') set({ state: 'latest', url: undefined });
        return;
      }
      if (st.state === 'ready' && st.version === info.version) return;
      set({ state: 'downloading', version: info.version, url: info.url });
      try {
        await plugin.download({ url: info.url, version: info.version });
        set({ state: 'ready', version: info.version });
      } catch {
        set({ state: 'error' }); // не беда: попробуем при следующем запуске; есть кнопка «Скачать вручную»
      }
    } finally {
      busy = false;
    }
  }

  async function installNow() {
    const s = useAutoUpdate.getState();
    if (s.state !== 'ready' || !s.canInstall) return;
    await plugin.install().catch(() => undefined);
  }

  return {
    run,
    installNow,
    async openPermission() { await plugin.openInstallPermission().catch(() => undefined); },
    onActive(active) {
      if (active) {
        if (pendingInstall) { timers.clear(pendingInstall); pendingInstall = null; }
        void run();
        return;
      }
      // свернули: подождать немного (успеет сохраниться прогресс) и тихо установить
      const s = useAutoUpdate.getState();
      if (s.state === 'ready' && s.canInstall && !pendingInstall) {
        pendingInstall = timers.set(() => { pendingInstall = null; void installNow(); }, INSTALL_DELAY_MS);
      }
    },
  };
}

// ——— Windows ———
type WinState = { state: AutoPhase; version?: string; percent?: number };
export function connectWindows(api: { updateGet(): Promise<unknown>; onUpdateState(cb: (s: unknown) => void): () => void }): void {
  const apply = (raw: unknown) => {
    const s = (raw ?? {}) as WinState;
    set({ kind: 'windows', state: s.state ?? 'idle', version: s.version, percent: s.percent });
  };
  set({ kind: 'windows' });
  void api.updateGet().then(apply).catch(() => undefined);
  api.onUpdateState(apply);
}
