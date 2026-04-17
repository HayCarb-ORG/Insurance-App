const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = !app.isPackaged

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1366,
    height: 900,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: '#0f172a',
    title: 'InsuranceApp',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      devTools: isDev,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  if (isDev) {
    const devServerUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173'
    mainWindow.loadURL(devServerUrl)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    const indexPath = path.join(__dirname, '../frontend/dist/index.html')
    if (!fs.existsSync(indexPath)) {
      dialog.showErrorBox(
        'Frontend Build Missing',
        'Could not find frontend/dist/index.html. Run "npm run react-build" before packaging.',
      )
      app.quit()
      return
    }
    mainWindow.loadFile(indexPath)
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
