import {
  ipcMain,
  shell,
  dialog,
  app,
  session,
  clipboard,
  BrowserWindow,
} from "electron"
import { WindowManager } from "./window"
import fs = require("fs")
import path from "path"
import { BookType } from "../schema-types"

const bookWindowIDList: string[] = []
const bookWindowList: BrowserWindow[] = []

export function setUtilsListeners(manager: WindowManager) {
  ipcMain.on("get-version", event => {
    event.returnValue = app.getVersion()
  })

  ipcMain.handle("show-error-box", (_, title, content) => {
    dialog.showErrorBox(title, content)
  })

  ipcMain.handle(
    "show-message-box",
    async (_, title, message, confirm, cancel, defaultCancel, type) => {
      if (manager.hasWindow()) {
        let response = await dialog.showMessageBox(manager.mainWindow, {
          type: type,
          title: title,
          message: message,
          buttons:
            process.platform === "win32" ? ["Yes", "No"] : [confirm, cancel],
          cancelId: 1,
          defaultId: defaultCancel ? 1 : 0,
        })
        return response.response === 0
      } else {
        return false
      }
    }
  )

  ipcMain.handle(
    "show-save-dialog",
    async (_, filters: Electron.FileFilter[], path: string) => {
      ipcMain.removeAllListeners("write-save-result")
      if (manager.hasWindow()) {
        let response = await dialog.showSaveDialog(manager.mainWindow, {
          defaultPath: path,
          filters: filters,
        })
        if (!response.canceled) {
          ipcMain.handleOnce("write-save-result", (_, result, errmsg) => {
            fs.writeFile(response.filePath, result, err => {
              if (err) dialog.showErrorBox(errmsg, String(err))
            })
          })
          return true
        }
      }
      return false
    }
  )

  ipcMain.handle(
    "show-open-dialog",
    async (_, filters: Electron.FileFilter[]) => {
      if (manager.hasWindow()) {
        let response = await dialog.showOpenDialog(manager.mainWindow, {
          filters: filters,
          properties: ["openFile"],
        })
        if (!response.canceled) {
          try {
            return await fs.promises.readFile(response.filePaths[0], "utf-8")
          } catch (err) {
            console.log(err)
          }
        }
      }
      return null
    }
  )

  ipcMain.handle("get-cache", async () => {
    return await session.defaultSession.getCacheSize()
  })

  ipcMain.handle("clear-cache", async () => {
    await session.defaultSession.clearCache()
  })

  ipcMain.handle("close-window", () => {
    // if (manager.hasWindow()) manager.mainWindow.close()
   
    manager.unManage()
    manager.mainWindow.close()
    manager.mainWindow = null
  })

  ipcMain.handle("minimize-window", () => {
    if (manager.hasWindow()) manager.mainWindow.minimize()
  })

  ipcMain.handle("maximize-window", () => {
    manager.zoom()
  })

  ipcMain.handle("book-view-window", (_, id: string, suffix: BookType) => {
    if (bookWindowIDList.length > 10) return
    else if (bookWindowIDList.findIndex(item => item === id) !== -1) return
    else {
      bookWindowIDList.push(id)
      const bookWindow = new BrowserWindow({
        title: id,
        width: 1280,
        height: 720,
        minWidth: 992,
        minHeight: 600,
        show: false,
        frame: process.platform === "darwin",
        titleBarStyle: "hiddenInset",
        webPreferences: {
          webSecurity: false,
          nodeIntegration: true,
          webviewTag: true,
          contextIsolation: true,
          nativeWindowOpen: false,
          preload: path.join(
            app.getAppPath(),
            (app.isPackaged ? "dist/" : "") + "preload.js"
          ),
        },
      })

      bookWindowList.push(bookWindow)

      bookWindow.on("ready-to-show", () => {
        bookWindow.show()
      })
      
      if (app.isPackaged) {
        const url = `file://${__dirname}/index.html#/?suffix=${suffix}&id=${id}`
        bookWindow.loadURL(url)
      } else {
        bookWindow.loadURL(`http://localhost:3000/#/?suffix=${suffix}&id=${id}`)
      }
    }
  })

  ipcMain.handle("close-book-window", (_, id: string) => {
    const index = bookWindowIDList.findIndex(_id => _id === id)
    if (index === -1) return
    const bookWindow = bookWindowList[index]

    bookWindowIDList.splice(index, 1)
    bookWindowList.splice(index, 1)

    bookWindow.close()
  })

  ipcMain.handle("minimize-book-window", (_, id: string) => {
    const index = bookWindowIDList.findIndex(_id => _id === id)
    if (index === -1) return
    const bookWindow = bookWindowList[index]

    bookWindow.minimize()
  })

  ipcMain.handle("maximize-book-window", (_, id: string) => {
    const index = bookWindowIDList.findIndex(_id => _id === id)
    if (index === -1) return
    const bookWindow = bookWindowList[index]

    bookWindow.maximize()
  })
}
