const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('addRatioAPI', {
  saveRatio: (ratio, label) => ipcRenderer.invoke('add-custom-ratio', ratio, label),
  closeWindow: () => ipcRenderer.invoke('close-add-ratio-window')
});
