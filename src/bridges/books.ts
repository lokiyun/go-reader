import { ipcRenderer } from "electron"
import { BookInfo, BookInfoType, BookState, BookType, EpubTocType } from "../schema-types"

const booksBridge = {
  getAllList: (): BookInfoType[] => {
    return ipcRenderer.sendSync("get-all-list")
  },
  getTxtList: (): BookInfoType[] => {
    return ipcRenderer.sendSync("get-txt-list")
  },

  getEpubList: (): BookInfoType[] => {
    return ipcRenderer.sendSync("get-epub-list")
  },

  getComicList: (): BookInfoType[] => {
    return ipcRenderer.sendSync("get-comic-list")
  },

  appendBookList: (index: number): boolean => {
    return ipcRenderer.sendSync("append-book-list", index)
  },

  appendComicList: (index: number): boolean => {
    return ipcRenderer.sendSync("append-comic-list", index)
  },
  getBookInfo: (id: string, suffix: BookType): BookState => {
    return ipcRenderer.sendSync("get-book-info", id, suffix)
  },
  getBookContent: (id: string, tocId: string): string => {
    return ipcRenderer.sendSync("get-book-content", id, tocId)
  },
  getEpubToc: (id: string): EpubTocType[] => {
    return ipcRenderer.sendSync("get-epub-toc", id)
  },
  getComicToc: (id: string): string[] => {
    return ipcRenderer.sendSync("get-comic-toc", id)
  },
  deleteBook: (id: string, suffix: BookType): Boolean => {
    return ipcRenderer.sendSync("delete-book", id, suffix)
  },
  updateBookList: (suffix: BookType): BookInfoType[] => {
    return ipcRenderer.sendSync("update-book-list", suffix)
  },
  saveBookInfo: (id: string, bookType: BookType, currentIndex: number | string, time: number) => {
    return ipcRenderer.sendSync("save-book-info", id, bookType, currentIndex, time)
  }
}

declare global {
  interface Window {
    books: typeof booksBridge
  }
}

export default booksBridge
