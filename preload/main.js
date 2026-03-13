const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("configAPI", {
  addCustomRatio: (ratio, label) => ipcRenderer.invoke("add-custom-ratio", ratio, label),
  loadConfig: () => ipcRenderer.invoke("load-config"),
  onRatiosUpdated: (callback) => ipcRenderer.on("ratios-updated", callback),
  openAddRatioWindow: () => ipcRenderer.invoke("open-add-ratio-window"),
  removeCustomRatio: (index) => ipcRenderer.invoke("remove-custom-ratio", index),
  saveConfig: (config) => ipcRenderer.invoke("save-config", config),
});