const { app, BrowserWindow, globalShortcut } = require('electron');

let mainWindow;
let isVisible = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 180,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    transparent: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    show: false
  });

  mainWindow.loadFile('src/index.html');

  // Auto-resize window to content after loading
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
