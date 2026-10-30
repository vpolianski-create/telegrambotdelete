import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('busel', {
  load: () => ipcRenderer.invoke('data:load'),
  save: (data: unknown) => ipcRenderer.invoke('data:save', data),
});
