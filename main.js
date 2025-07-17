const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let addRatioWindow;
let tray = null;
let isVisible = false;
const configPath = path.join(__dirname, 'config.json');

const defaultRatios = [
  { ratio: '3:1', label: '3:1' },
  { ratio: '4:1', label: '4:1' },
  { ratio: '5:1', label: '5:1' },
];
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Error loading config, using defaults:', error);
  }
  return { customRatios: defaultRatios };
}

function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
}

ipcMain.handle('load-config', () => {
  return loadConfig();
});

ipcMain.handle('save-config', (event, config) => {
  return saveConfig(config);
});

ipcMain.handle('add-custom-ratio', (event, ratio, label) => {
  const config = loadConfig();
  config.customRatios.push({ ratio, label: label || ratio });
  const success = saveConfig(config);

  if (success && mainWindow) {
    mainWindow.webContents.send('ratios-updated', config);
  }

  return success ? config : null;
});

ipcMain.handle('remove-custom-ratio', (event, index) => {
  const config = loadConfig();
  if (index >= 0 && index < config.customRatios.length) {
    config.customRatios.splice(index, 1);
    return saveConfig(config) ? config : null;
  }
  return null;
});

ipcMain.handle('open-add-ratio-window', () => {
  createAddRatioWindow();
});

ipcMain.handle('close-add-ratio-window', () => {
  if (addRatioWindow) {
    addRatioWindow.close();
  }
});

function createAddRatioWindow() {
  if (addRatioWindow) {
    addRatioWindow.focus();
    return;
  }

  addRatioWindow = new BrowserWindow({
    width: 300,
    height: 420,
    frame: false,
    alwaysOnTop: true,
    parent: mainWindow,
    modal: true,
    resizable: false,
    transparent: false,
    icon: path.join(__dirname, 'assets', 'divine_icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'add-ratio-preload.js')
    },
    show: false
  });  addRatioWindow.loadFile('src/add-ratio.html');

  addRatioWindow.webContents.once('did-finish-load', () => {
    addRatioWindow.webContents.executeJavaScript(`
      ({
        width: document.body.scrollWidth,
        height: document.body.scrollHeight
      })
    `).then((size) => {
      addRatioWindow.setSize(size.width + 20, size.height + 10);
      addRatioWindow.center();
      addRatioWindow.show();
    });
  });

  addRatioWindow.on('closed', () => {
    addRatioWindow = null;
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 180,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    transparent: true,
    icon: path.join(__dirname, 'assets', 'divine_icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  mainWindow.loadFile('src/index.html');

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      ({
        width: document.body.scrollWidth,
        height: document.body.scrollHeight
      })
    `).then((size) => {
      mainWindow.setSize(size.width + 20, size.height);
      mainWindow.center();
    });
  });

  mainWindow.center();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  globalShortcut.register('CommandOrControl+R', () => {
    toggleOverlay();
  });
  mainWindow.setMovable(true);
}

function toggleOverlay() {
  if (isVisible) {
    mainWindow.hide();
    isVisible = false;
  } else {
    mainWindow.show();
    mainWindow.focus();
    isVisible = true;
  }
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'divine_icon.ico');
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide Overlay',
      click: () => {
        toggleOverlay();
      }
    },
    {
      label: 'Add Custom Ratio',
      click: () => {
        createAddRatioWindow();
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('POE Ratio Calculator');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    toggleOverlay();
  });
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.keknine.poe-ratio-calculator');
  }

  createWindow();
  createTray();

  setTimeout(() => {
    toggleOverlay();
  }, 500);
});

app.on('window-all-closed', () => {
  // Keep app running even when all windows are closed for tray functionality
  // On macOS, applications typically stay active until explicitly quit
  if (process.platform !== 'darwin') {
    // Don't quit on Windows/Linux - let the tray handle quitting
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (tray) {
    tray.destroy();
  }
});

app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, url) => {
    navigationEvent.preventDefault();
  });
});
