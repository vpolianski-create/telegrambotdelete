/** Запуск автообновления для текущей платформы (один раз после загрузки приложения). */
import { isAndroid, onAppState } from '../platform';
import { connectWindows, createAndroidFlow, type AndroidFlow, type AndroidUpdater } from './auto';

let android: AndroidFlow | null = null;
let started = false;

export function startAutoUpdates(): void {
  if (started) return;
  started = true;
  const b = window.busel;
  if (b?.updateGet && b.onUpdateState) { connectWindows({ updateGet: b.updateGet, onUpdateState: b.onUpdateState }); return; }
  if (!isAndroid()) return;
  void import('@capacitor/core').then(({ registerPlugin }) => {
    android = createAndroidFlow(registerPlugin<AndroidUpdater>('BuselUpdater'), __APP_VERSION__);
    void android.run();
    onAppState((active) => android?.onActive(active));
  });
}

/** Для кнопок в родительском режиме. */
export const autoUpdateActions = {
  checkNow: () => android?.run(true),
  installNow: async () => {
    if (window.busel?.updateInstall) { await window.busel.updateInstall(); return; }
    await android?.installNow();
  },
  openPermission: async () => { await android?.openPermission(); },
};
