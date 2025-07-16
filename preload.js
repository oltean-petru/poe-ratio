const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('configAPI', {
  loadConfig: () => ipcRenderer.invoke('load-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  addCustomRatio: (ratio, label) => ipcRenderer.invoke('add-custom-ratio', ratio, label),
  removeCustomRatio: (index) => ipcRenderer.invoke('remove-custom-ratio', index)
});
