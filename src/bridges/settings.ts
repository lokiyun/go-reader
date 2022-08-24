import { ipcRenderer } from "electron"
import { ThemeSettings } from "../schema-types"

const settingsBridge = {
  getTheme: (): ThemeSettings => {
    return ipcRenderer.sendSync("get-theme")
  },
  setTheme: (theme: ThemeSettings) => {
    ipcRenderer.invoke("set-theme", theme)
  },
  getFontSize: (): number => {
    return ipcRenderer.sendSync("get-font-size")
  },
  setFontSize: (size: number) => {
    ipcRenderer.invoke("set-font-size", size)
  }
}

declare global {
  interface Window {
    settings: typeof settingsBridge
  }
}

export default settingsBridge
