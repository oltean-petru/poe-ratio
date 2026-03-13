const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const path = require("path");

const { loadConfig, migrateConfigIfNeeded, saveConfig } = require("./config");
const { registerIpcHandlers } = require("./ipc");
const { createWindowManager } = require("./windows");

let windowManager;
let currentHotkey = null;
let keepOnTopInterval = null;

function registerHotkey(hotkey) {
  if (!hotkey || !windowManager) {
    return false;
  }

  try {
    const didRegister = globalShortcut.register(hotkey, () => {
      windowManager.toggleOverlay();
    });

    if (!didRegister) {
      console.error(`Failed to register hotkey: ${hotkey}`);
      return false;
    }

    currentHotkey = hotkey;
    return true;
  } catch (error) {
    console.error(`Failed to register hotkey ${hotkey}:`, error);
    return false;
  }
}

function updateHotkey(nextHotkey, previousHotkey = currentHotkey) {
  if (previousHotkey) {
    globalShortcut.unregister(previousHotkey);
  }

  if (registerHotkey(nextHotkey)) {
    return true;
  }

  currentHotkey = null;

  if (previousHotkey) {
    registerHotkey(previousHotkey);
  }

  return false;
}

function start() {
  app.whenReady().then(() => {
    if (process.platform === "win32") {
      app.setAppUserModelId("com.keknine.poe-ratio-calculator");
    }

    migrateConfigIfNeeded();

    const baseDir = path.join(__dirname, "..");
    windowManager = createWindowManager({
      baseDir,
      onOverlayMoved: (position) => {
        const config = loadConfig();
        config.overlayPosition = position;
        saveConfig(config);
      },
    });

    registerIpcHandlers({
      ipcMain,
      loadConfig,
      saveConfig,
      updateHotkey,
      windowManager,
    });

    const config = loadConfig();

    windowManager.createMainWindow(config.overlayPosition);
    windowManager.createTray();
    registerHotkey(config.hotkey);

    keepOnTopInterval = setInterval(() => {
      windowManager.keepOverlayOnTop();
    }, 1000);

    windowManager.showLaunchPopup(config.hotkey);
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      return;
    }
  });

  app.on("activate", () => {
    if (!windowManager) {
      return;
    }

    if (!windowManager.getMainWindow() && BrowserWindow.getAllWindows().length === 0) {
      windowManager.createMainWindow();
    }
  });

  app.on("will-quit", () => {
    globalShortcut.unregisterAll();

    if (keepOnTopInterval) {
      clearInterval(keepOnTopInterval);
      keepOnTopInterval = null;
    }

    if (windowManager) {
      windowManager.destroyTray();
    }
  });

  app.on("web-contents-created", (event, contents) => {
    contents.on("new-window", (navigationEvent) => {
      navigationEvent.preventDefault();
    });
  });
}

module.exports = {
  start,
};