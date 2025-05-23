const { app, BrowserWindow } = require('electron')
require('@electron/remote/main').initialize()

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // Add this line to maximize the window on startup
  mainWindow.maximize();

  mainWindow.loadFile('index.html');
  
  require('@electron/remote/main').enable(mainWindow.webContents)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
