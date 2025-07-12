const { app, BrowserWindow, globalShortcut } = require('electron');

let mainWindow;
let isVisible = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 400,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    show: false
  });

  mainWindow.loadFile('src/index.html');
  mainWindow.center();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  globalShortcut.register('CommandOrControl+Shift+R', () => {
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

app.whenReady().then(() => {
  createWindow();

  // Show overlay by default
  setTimeout(() => {
    toggleOverlay();
  }, 500);
});

app.on('window-all-closed', () => {
  // Keep app running even when window is closed for overlay functionality
  // Uncomment the next line if you want the app to quit when window is closed
  // app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, url) => {
    navigationEvent.preventDefault();
  });
});
