import { contextBridge } from 'electron'
import booksBridge from './bridges/books'
import settingsBridge from './bridges/settings'
import utilsBridge from './bridges/utils'

contextBridge.exposeInMainWorld('settings', settingsBridge)
contextBridge.exposeInMainWorld('utils', utilsBridge)
contextBridge.exposeInMainWorld('books', booksBridge)
