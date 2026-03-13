function registerIpcHandlers({ ipcMain, loadConfig, saveConfig, updateHotkey, windowManager }) {
  ipcMain.handle("load-config", () => {
    return loadConfig();
  });

  ipcMain.handle("save-config", (event, config) => {
    return saveConfig(config);
  });

  ipcMain.handle("add-custom-ratio", (event, ratio, label) => {
    const config = loadConfig();
    config.customRatios.push({ ratio, label: label || ratio });

    const success = saveConfig(config);
    const mainWindow = windowManager.getMainWindow();

    if (success && mainWindow) {
      mainWindow.webContents.send("ratios-updated", config);
    }

    return success ? config : null;
  });

  ipcMain.handle("remove-custom-ratio", (event, index) => {
    const config = loadConfig();

    if (index < 0 || index >= config.customRatios.length) {
      return null;
    }

    config.customRatios.splice(index, 1);
    return saveConfig(config) ? config : null;
  });

  ipcMain.handle("update-hotkey", (event, newHotkey) => {
    const config = loadConfig();
    const previousHotkey = config.hotkey;
    config.hotkey = newHotkey;

    if (!saveConfig(config)) {
      return null;
    }

    if (!updateHotkey(newHotkey, previousHotkey)) {
      config.hotkey = previousHotkey;
      saveConfig(config);
      return null;
    }

    return config;
  });

  ipcMain.handle("open-add-ratio-window", () => {
    windowManager.createAddRatioWindow();
  });

  ipcMain.handle("resize-overlay-to-content", () => {
    return windowManager.resizeMainWindowToContent();
  });

  ipcMain.handle("close-add-ratio-window", () => {
    windowManager.closeAddRatioWindow();
  });

  ipcMain.handle("open-hotkey-config-window", () => {
    windowManager.createHotkeyConfigWindow();
  });

  ipcMain.handle("close-hotkey-config-window", () => {
    windowManager.closeHotkeyConfigWindow();
  });
}

module.exports = {
  registerIpcHandlers,
};