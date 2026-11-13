import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import path from 'node:path';
import { backupOnStart, loadData, writeJson } from './store';

const DATA = 'data.json';
type Theme = 'system' | 'light' | 'dark';
const isTheme = (t: unknown): t is Theme => t === 'system' || t === 'light' || t === 'dark';
/** Фон окна под тему (как --bg в src/index.css): чтобы при запуске не мелькала белая полоса. */
const windowBg = () => (nativeTheme.shouldUseDarkColors ? '#0b1020' : '#f4f6fc');

/** Заголовок окна Windows красится под тему приложения: «Как в Windows», светлая или тёмная. */
function applyTheme(theme: unknown) {
  nativeTheme.themeSource = isTheme(theme) ? theme : 'system';
  BrowserWindow.getAllWindows().forEach((w) => w.setBackgroundColor(windowBg()));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 1024, minHeight: 640,
    title: 'Умный Бусел', autoHideMenuBar: true, backgroundColor: windowBg(),
    icon: path.join(__dirname, '../resources/brand/icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true },
  });
  const dev = process.env.VITE_DEV_SERVER_URL;
  if (dev) win.loadURL(dev);
  else win.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(() => {
  backupOnStart(DATA);
  // тема известна ещё до открытия окна — берём её из сохранённых настроек
  applyTheme(loadData<{ settings?: { theme?: unknown } }>(DATA)?.settings?.theme);
  ipcMain.handle('data:load', () => loadData<unknown>(DATA));
  ipcMain.handle('data:save', (_e, data: unknown) => writeJson(DATA, data));
  ipcMain.on('theme:set', (_e, theme: unknown) => applyTheme(theme));
  nativeTheme.on('updated', () => BrowserWindow.getAllWindows().forEach((w) => w.setBackgroundColor(windowBg())));
  createWindow();
});

app.on('window-all-closed', () => app.quit());
