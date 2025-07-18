const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadConfig: () => ipcRenderer.invoke('load-config'),
  updateHotkey: (hotkey) => ipcRenderer.invoke('update-hotkey', hotkey),
  closeHotkeyConfigWindow: () => ipcRenderer.invoke('close-hotkey-config-window')
});
