import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { backupOnStart, readJson, writeJson } from './store';

const DATA = 'data.json';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 1024, minHeight: 640,
    title: 'Умный Бусел', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true },
  });
  const dev = process.env.VITE_DEV_SERVER_URL;
  if (dev) win.loadURL(dev);
  else win.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(() => {
  backupOnStart(DATA);
  ipcMain.handle('data:load', () => readJson<unknown>(DATA, null));
  ipcMain.handle('data:save', (_e, data: unknown) => writeJson(DATA, data));
  createWindow();
});

app.on('window-all-closed', () => app.quit());
