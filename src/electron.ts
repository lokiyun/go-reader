import { app, ipcMain, Menu, nativeTheme } from "electron"
import { store } from "./main/settings"
import performUpdate from "./main/update-scripts"
import { WindowManager } from "./main/window"
import { ThemeSettings, SchemaTypes } from "./schema-types"
import fs from 'fs'

if (!process.mas) {
  const locked = app.requestSingleInstanceLock()
  if (!locked) {
    app.quit()
  }
}

if (!app.isPackaged) app.setAppUserModelId(process.execPath)
else if (process.platform === "win32")
  app.setAppUserModelId("app.lucci.goreader")

const appPath = app.getPath("userData")

fs.exists(`${appPath}\\data`, function (exists) {
  if (!exists) {
    fs.mkdir(`${appPath}\\data`, function (err) {
      if (err) {
        return console.error(err)
      }
      
    })
  }

  fs.exists(`${appPath}\\data\\articles`, function (exists) {
    if (!exists) {
      fs.mkdir(`${appPath}\\data\\articles`, function (err) {
        if (err) {
          return console.error(err)
        }
        console.log('data\\articles 文件夹创建成功')
      })
    }
  })

  fs.exists(`${appPath}\\data\\catalog`, function (exists) {
    if (!exists) {
      fs.mkdir(`${appPath}\\data\\catalog`, function (err) {
        if (err) {
          return console.error(err)
        }
        console.log('data\\catalog 文件夹创建成功')
      })
    }
  })

  fs.exists(`${appPath}\\data\\epubCache`, function (exists) {
    if (!exists) {
      fs.mkdir(`${appPath}\\data\\epubCache`, function (err) {
        if (err) {
          return console.error(err)
        }
        console.log('data\\epubCache 文件夹创建成功')
      })
    }
  })

  fs.exists(`${appPath}\\data\\comicCache`, function (exists) {
    if (!exists) {
      fs.mkdir(`${appPath}\\data\\comicCache`, function (err) {
        if (err) {
          return console.error(err)
        }
        console.log('data\\comicCache 文件夹创建成功')
      })
    }
  })
})


let restarting = false

function init() {
  performUpdate(store)
  nativeTheme.themeSource = store.get("theme", ThemeSettings.Default)
}

init()

const winManager = new WindowManager()

app.on("window-all-closed", () => {
  app.quit()
})

ipcMain.handle("import-all-settings", (_, configs: SchemaTypes) => {
  restarting = true
  store.clear()
  for (let [key, value] of Object.entries(configs)) {
    store.set(key, value)
  }
  performUpdate(store)
  nativeTheme.themeSource = store.get("theme", ThemeSettings.Default)
  setTimeout(
    () => {
      winManager.mainWindow.close()
    },
    process.platform === "darwin" ? 1000 : 0
  )
})
