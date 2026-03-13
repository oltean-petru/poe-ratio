const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  closeHotkeyConfigWindow: () => ipcRenderer.invoke("close-hotkey-config-window"),
  loadConfig: () => ipcRenderer.invoke("load-config"),
  updateHotkey: (hotkey) => ipcRenderer.invoke("update-hotkey", hotkey),
});