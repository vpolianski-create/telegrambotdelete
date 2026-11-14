import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('busel', {
  load: () => ipcRenderer.invoke('data:load'),
  save: (data: unknown) => ipcRenderer.invoke('data:save', data),
  setTheme: (theme: string) => ipcRenderer.send('theme:set', theme),
  secretGet: () => ipcRenderer.invoke('secret:get'),
  secretSet: (value: string | null) => ipcRenderer.invoke('secret:set', value),
  openExternal: (url: string) => ipcRenderer.invoke('open:external', url),
});
