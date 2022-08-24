import Store = require('electron-store')
import { ipcMain, session, nativeImage, app, nativeTheme } from 'electron'
import { SchemaTypes, ThemeSettings } from '../schema-types'
import { WindowManager } from './window'

export const store = new Store<SchemaTypes>()

const THEME_STORE_KEY = 'theme'
ipcMain.on('get-theme', event => {
  event.returnValue = store.get(THEME_STORE_KEY, ThemeSettings.Default)
})
ipcMain.handle('set-theme', (_, theme: ThemeSettings) => {
  store.set(THEME_STORE_KEY, theme)
  nativeTheme.themeSource = theme
})
ipcMain.on('get-theme-dark-color', event => {
  event.returnValue = nativeTheme.shouldUseDarkColors
})
export function setThemeListener(manager: WindowManager) {
  nativeTheme.removeAllListeners()
  nativeTheme.on("updated", () => {
      if (manager.hasWindow()) {
          let contents = manager.mainWindow.webContents
          if (!contents.isDestroyed()) {
              contents.send("theme-updated", nativeTheme.shouldUseDarkColors)
          }
      }
  })
}

const FONT_SIZE_STORE_KEY = "fontSize"
ipcMain.on("get-font-size", event => {
  event.returnValue = store.get(FONT_SIZE_STORE_KEY, 16)
})
ipcMain.handle("set-font-size", (_, size: number) => {
  store.set(FONT_SIZE_STORE_KEY, size)
})

ipcMain.on("get-all-settings", event => {
  let output = {}
  for (let [key, value] of store) {
      output[key] = value
  }
  event.returnValue = output
})

const NEDB_STATUS_STORE_KEY = "useNeDB"
ipcMain.on("get-nedb-status", event => {
    event.returnValue = store.get(NEDB_STATUS_STORE_KEY, true)
})
ipcMain.handle("set-nedb-status", (_, flag: boolean) => {
    store.set(NEDB_STATUS_STORE_KEY, flag)
})
