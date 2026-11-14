import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';

/**
 * Автообновление на Windows (electron-updater).
 * - Источник: страница выпусков GitHub (`releases/latest/download`, настройка `build.publish` в package.json).
 * - Новая версия скачивается в фоне; перед установкой проверяется её контрольная сумма SHA-512 из latest.yml.
 * - Устанавливается тихо, когда программу закрывают (или сразу — кнопкой в родительском режиме).
 * Прогресс хранится отдельно от программы (userData) и при обновлении не трогается.
 */
export type UpdateState =
  | { state: 'idle' | 'checking' | 'latest' | 'error' }
  | { state: 'downloading'; version: string; percent: number }
  | { state: 'ready'; version: string };

const CHECK_EVERY_MS = 4 * 60 * 60 * 1000;
let current: UpdateState = { state: 'idle' };

function send(s: UpdateState) {
  current = s;
  BrowserWindow.getAllWindows().forEach((w) => w.webContents.send('update:state', s));
}

export function startAutoUpdate(): void {
  ipcMain.handle('update:get', () => current);
  // «Перезапустить и обновить» — только если обновление уже скачано и проверено
  ipcMain.handle('update:install', () => {
    if (current.state === 'ready') setImmediate(() => autoUpdater.quitAndInstall(true, true));
  });
  if (!app.isPackaged) return; // в режиме разработки не обновляемся

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowDowngrade = false;
  autoUpdater.allowPrerelease = false;
  autoUpdater.disableDifferentialDownload = true; // всегда полный файл: проще и надёжнее
  autoUpdater.logger = null;

  autoUpdater.on('checking-for-update', () => { if (current.state !== 'ready' && current.state !== 'downloading') send({ state: 'checking' }); });
  autoUpdater.on('update-not-available', () => { if (current.state !== 'ready') send({ state: 'latest' }); });
  autoUpdater.on('update-available', (info) => send({ state: 'downloading', version: info.version, percent: 0 }));
  autoUpdater.on('download-progress', (p) => {
    if (current.state === 'downloading') send({ ...current, percent: Math.round(p.percent) });
  });
  autoUpdater.on('update-downloaded', (info) => send({ state: 'ready', version: info.version }));
  // без интернета и т. п. — тихо, попробуем позже
  autoUpdater.on('error', () => { if (current.state !== 'ready') send({ state: 'error' }); });

  const check = () => { void autoUpdater.checkForUpdates().catch(() => undefined); };
  setTimeout(check, 20_000);
  setInterval(check, CHECK_EVERY_MS);
}
