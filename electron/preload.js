const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  appVersion: process.versions.electron,
})
