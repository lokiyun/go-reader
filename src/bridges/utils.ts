import { ipcRenderer } from "electron"
import { BookType } from "../schema-types"

const utilsBridge = {
  platform: process.platform,

  getVersion: (): string => {
    return ipcRenderer.sendSync("get-version")
  },

  showErrorBox: (title: string, content: string) => {
    ipcRenderer.invoke("show-error-box", title, content)
  },

  showMessageBox: async (
    title: string,
    message: string,
    confirm: string,
    cancel: string,
    defaultCancel = false,
    type = "none"
  ) => {
    return (await ipcRenderer.invoke(
      "show-message-box",
      title,
      message,
      confirm,
      cancel,
      defaultCancel,
      type
    )) as boolean
  },

  showSaveDialog: async (filters: Electron.FileFilter[], path: string) => {
    let result = (await ipcRenderer.invoke(
      "show-save-dialog",
      filters,
      path
    )) as boolean
    if (result) {
      return (result: string, errmsg: string) => {
        ipcRenderer.invoke("write-save-result", result, errmsg)
      }
    } else {
      return null
    }
  },

  showOpenDialog: async (filters: Electron.FileFilter[]) => {
    return (await ipcRenderer.invoke("show-open-dialog", filters)) as string
  },

  closeWindow: () => {
    ipcRenderer.invoke("close-window")
  },
  closeBookWindow: (id: string) => {
    ipcRenderer.invoke("close-book-window", id)
  },
  minimizeWindow: () => {
    ipcRenderer.invoke("minimize-window")
  },
  minimizeBookwindow: (id: string) => {
    ipcRenderer.invoke("minimize-book-window", id)
  },
  maximizeBookwindow: (id: string) => {
    ipcRenderer.invoke("maximize-book-window", id)
  },
  maximizeWindow: () => {
    ipcRenderer.invoke("maximize-window")
  },
  bookViewWindow: (id: string, suffix: BookType) => {
    ipcRenderer.invoke("book-view-window", id, suffix)
  },
}

declare global {
  interface Window {
    utils: typeof utilsBridge
    fontList: Array<string>
  }
}

export default utilsBridge
