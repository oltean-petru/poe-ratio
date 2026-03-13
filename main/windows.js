const { BrowserWindow, Menu, Tray, screen } = require("electron");
const path = require("path");

function sizeWindowToContent(window, options = {}) {
  const { widthPadding = 20, heightPadding = 0, showAfterResize = false } = options;

  window.webContents.once("did-finish-load", () => {
    window.webContents
      .executeJavaScript(
        `({ width: document.body.scrollWidth, height: document.body.scrollHeight })`
      )
      .then((size) => {
        if (window.isDestroyed()) {
          return;
        }

        window.setSize(size.width + widthPadding, size.height + heightPadding);
        window.center();

        if (showAfterResize) {
          window.show();
        }
      })
      .catch((error) => {
        console.error("Failed to size window:", error);
        if (showAfterResize && !window.isDestroyed()) {
          window.show();
        }
      });
  });
}

function createWindowManager({ baseDir }) {
  const iconPath = path.join(baseDir, "assets", "divine_icon.ico");
  const htmlDir = path.join(baseDir, "src");

  let mainWindow;
  let addRatioWindow;
  let hotkeyConfigWindow;
  let launchPopupWindow;
  let tray;
  let isVisible = false;

  function formatHotkeyForDisplay(hotkey) {
    if (!hotkey) {
      return "Ctrl + Space";
    }

    const commandOrControlLabel = process.platform === "darwin" ? "Cmd" : "Ctrl";
    const tokenMap = {
      commandorcontrol: commandOrControlLabel,
      cmdorctrl: commandOrControlLabel,
      command: "Cmd",
      control: "Ctrl",
      ctrl: "Ctrl",
      alt: "Alt",
      option: "Alt",
      shift: "Shift",
      meta: process.platform === "darwin" ? "Cmd" : "Win",
      super: process.platform === "darwin" ? "Cmd" : "Win",
      space: "Space",
      plus: "+",
    };

    return hotkey
      .split("+")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const mapped = tokenMap[part.toLowerCase()];
        return mapped || part.toUpperCase();
      })
      .join(" + ");
  }

  function createMainWindow() {
    if (mainWindow && !mainWindow.isDestroyed()) {
      return mainWindow;
    }

    mainWindow = new BrowserWindow({
      width: 700,
      height: 180,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      transparent: true,
      icon: iconPath,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(baseDir, "preload.js"),
      },
      show: false,
    });

    mainWindow.loadFile(path.join(htmlDir, "index.html"));
    sizeWindowToContent(mainWindow);
    mainWindow.center();
    mainWindow.setMovable(true);

    mainWindow.on("closed", () => {
      mainWindow = null;
      isVisible = false;
    });

    mainWindow.on("hide", () => {
      isVisible = false;
    });

    mainWindow.on("blur", () => {
      if (isVisible && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setAlwaysOnTop(true, "screen-saver");
      }
    });

    mainWindow.on("show", () => {
      isVisible = true;
      mainWindow.setAlwaysOnTop(true, "screen-saver");
    });

    return mainWindow;
  }

  function createAddRatioWindow() {
    if (addRatioWindow && !addRatioWindow.isDestroyed()) {
      addRatioWindow.focus();
      return addRatioWindow;
    }

    addRatioWindow = new BrowserWindow({
      width: 300,
      height: 420,
      frame: false,
      alwaysOnTop: true,
      parent: createMainWindow(),
      modal: true,
      resizable: false,
      transparent: false,
      icon: iconPath,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(baseDir, "add-ratio-preload.js"),
      },
      show: false,
    });

    addRatioWindow.on("show", () => {
      addRatioWindow.setAlwaysOnTop(true, "screen-saver");
    });

    addRatioWindow.loadFile(path.join(htmlDir, "add-ratio.html"));
    sizeWindowToContent(addRatioWindow, { heightPadding: 10, showAfterResize: true });

    addRatioWindow.on("closed", () => {
      addRatioWindow = null;
    });

    return addRatioWindow;
  }

  function createHotkeyConfigWindow() {
    if (hotkeyConfigWindow && !hotkeyConfigWindow.isDestroyed()) {
      hotkeyConfigWindow.focus();
      return hotkeyConfigWindow;
    }

    hotkeyConfigWindow = new BrowserWindow({
      width: 350,
      height: 300,
      frame: false,
      alwaysOnTop: true,
      parent: createMainWindow(),
      modal: true,
      resizable: false,
      transparent: false,
      icon: iconPath,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(baseDir, "hotkey-config-preload.js"),
      },
      show: false,
    });

    hotkeyConfigWindow.on("show", () => {
      hotkeyConfigWindow.setAlwaysOnTop(true, "screen-saver");
    });

    hotkeyConfigWindow.loadFile(path.join(htmlDir, "hotkey-config.html"));
    sizeWindowToContent(hotkeyConfigWindow, { heightPadding: 10, showAfterResize: true });

    hotkeyConfigWindow.on("closed", () => {
      hotkeyConfigWindow = null;
    });

    return hotkeyConfigWindow;
  }

  function toggleOverlay() {
    const window = createMainWindow();

    if (isVisible) {
      window.hide();
      return;
    }

    window.show();
    window.setAlwaysOnTop(true, "screen-saver");
  }

  function keepOverlayOnTop() {
    if (isVisible && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(true, "screen-saver");
    }
  }

  function createTray() {
    if (tray && !tray.isDestroyed()) {
      return tray;
    }

    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show/Hide Overlay",
        click: () => {
          toggleOverlay();
        },
      },
      {
        label: "Add Custom Ratio",
        click: () => {
          createAddRatioWindow();
        },
      },
      {
        label: "Configure Hotkey",
        click: () => {
          createHotkeyConfigWindow();
        },
      },
      {
        type: "separator",
      },
      {
        label: "Quit",
        click: () => {
          const { app } = require("electron");
          app.quit();
        },
      },
    ]);

    tray.setToolTip("POE Ratio Calculator");
    tray.setContextMenu(contextMenu);
    tray.on("double-click", () => {
      toggleOverlay();
    });

    return tray;
  }

  function showLaunchPopup(hotkey = "CommandOrControl+Space") {
    if (launchPopupWindow && !launchPopupWindow.isDestroyed()) {
      return;
    }

    const popupWidth = 320;
    const popupHeight = 96;
    const popupMargin = 20;
    const { workArea } = screen.getPrimaryDisplay();

    launchPopupWindow = new BrowserWindow({
      width: popupWidth,
      height: popupHeight,
      x: workArea.x + workArea.width - popupWidth - popupMargin,
      y: workArea.y + workArea.height - popupHeight - popupMargin,
      frame: false,
      transparent: true,
      resizable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      movable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      focusable: false,
      icon: iconPath,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
      },
      show: false,
    });

    launchPopupWindow.setAlwaysOnTop(true, "screen-saver");
    launchPopupWindow.setIgnoreMouseEvents(true);
    launchPopupWindow.loadFile(path.join(htmlDir, "launch-popup.html"), {
      query: {
        hotkey: formatHotkeyForDisplay(hotkey),
      },
    });

    launchPopupWindow.once("ready-to-show", () => {
      if (!launchPopupWindow || launchPopupWindow.isDestroyed()) {
        return;
      }

      if (typeof launchPopupWindow.showInactive === "function") {
        launchPopupWindow.showInactive();
      } else {
        launchPopupWindow.show();
      }

      setTimeout(() => {
        if (launchPopupWindow && !launchPopupWindow.isDestroyed()) {
          launchPopupWindow.close();
        }
      }, 10000);
    });

    launchPopupWindow.on("closed", () => {
      launchPopupWindow = null;
    });
  }

  function closeAddRatioWindow() {
    if (addRatioWindow && !addRatioWindow.isDestroyed()) {
      addRatioWindow.close();
    }
  }

  function closeHotkeyConfigWindow() {
    if (hotkeyConfigWindow && !hotkeyConfigWindow.isDestroyed()) {
      hotkeyConfigWindow.close();
    }
  }

  function destroyTray() {
    if (tray && !tray.isDestroyed()) {
      tray.destroy();
    }
    tray = null;
  }

  function getMainWindow() {
    if (mainWindow && mainWindow.isDestroyed()) {
      mainWindow = null;
    }

    return mainWindow;
  }

  return {
    closeAddRatioWindow,
    closeHotkeyConfigWindow,
    createAddRatioWindow,
    createHotkeyConfigWindow,
    createMainWindow,
    createTray,
    destroyTray,
    getMainWindow,
    keepOverlayOnTop,
    showLaunchPopup,
    toggleOverlay,
  };
}

module.exports = {
  createWindowManager,
};