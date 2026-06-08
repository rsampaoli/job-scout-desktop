const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openExternalLink: (url) => ipcRenderer.send('open-external-link', url),
});