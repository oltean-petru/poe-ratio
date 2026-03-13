const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("addRatioAPI", {
	closeWindow: () => ipcRenderer.invoke("close-add-ratio-window"),
	saveRatio: (ratio, label) => ipcRenderer.invoke("add-custom-ratio", ratio, label),
});
