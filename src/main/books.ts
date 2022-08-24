import { dialog, ipcMain, app, IpcMainEvent } from "electron"
import Store from "electron-store"
import fs from "fs"
import { readdir } from "fs/promises"
import { v4 as uuidv4 } from "uuid"
import { XMLParser } from "fast-xml-parser"
import lineReader = require("line-reader")
import AdmZip = require("adm-zip")

import { WindowManager } from "./window"
import {
  BookCatalogType,
  BookInfoType,
  BookState,
  BookStorageInfo,
  BookType,
} from "../schema-types"
import BookStore from "./BookStore"
import {
  appCachePathData,
  appCachePathDataArticle,
  appCachePathDataCatalog,
  appCachePathDataComicCache,
  appCachePathDataEpubCache,
} from "../constants"

let progressCount = 0
let updateProgressCount = 0

const myStore = new BookStore({
  name: "Book List",
  cwd: appCachePathData,
})

const epubStore = new BookStore({
  name: "epub List",
  cwd: appCachePathData,
})

const comicStore = new BookStore({
  name: "comic List",
  cwd: appCachePathData,
})

export function setBooksListeners(manager: WindowManager) {
  ipcMain.on("get-all-list", event => {
    const txtList = myStore.getList()
    const epubList = epubStore.getList()
    event.returnValue = [...txtList, ...epubList]
  })
  ipcMain.on("get-txt-list", event => {
    event.returnValue = myStore.getList()
  })

  ipcMain.on("get-epub-list", event => {
    event.returnValue = epubStore.getList()
  })

  ipcMain.on("get-comic-list", event => {
    event.returnValue = comicStore.getList()
  })

  ipcMain.on("append-book-list", async (event, index) => {
    const result = await dialog.showOpenDialog({
      title: "打开",
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "书籍", extensions: ["txt", "epub"] }],
    })

    if (result.canceled) {
      event.returnValue = []
      return
    } else {
      const bookList: string[] = result.filePaths

      bookList.forEach(bookPath => {
        const title = bookPath.split("\\")[bookPath.split("\\").length - 1]
        const suffix = title.split(".")[title.split(".").length - 1]

        switch (suffix) {
          case "txt":
            const id = uuidv4()
            let book: BookStorageInfo = {
              id,
              title: title.split(".")[0],
              filePath: bookPath,
              suffix: "txt",
              current: 0,
              cover: "",
              createTime: Date.now(),
              updateTime: -1,
            }
            myStore.addBooks([book])
            handleAppendBookByTxt(event, book)
            break
          case "epub":
            handleAppendBookByEpub(event, bookPath, title)
          default:
            break
        }
      })

      // if (index === 0) {
      //   event.returnValue = [
      //     ...myStore.getList(),
      //     ...epubStore.getList(),
      //     ...comicStore.getList()
      //   ]
      // } else if (index === 1) {
      //   event.returnValue = myStore.getList()
      // } else if (index === 2) {
      //   event.returnValue = epubStore.getList()
      // }
    }
  })

  ipcMain.on("append-comic-list", async event => {
    handleAppendComic(event)
  })

  ipcMain.on("get-book-info", (event, id: string, suffix: BookType) => {
    switch (suffix) {
      case "txt":
        const list = myStore.getList()
        const book: BookInfoType = list.find(item => item.id === id) as BookInfoType

        const catalogStore = new Store({
          name: id,
          cwd: appCachePathDataCatalog,
        })
        const toc = catalogStore.get("catalog")

        book.toc = toc

        event.returnValue = {
          code: 200,
          errror: "",
          book
        } as BookState
        break
      case "epub":
        const epubList = epubStore.getList()
        const epubBook = epubList.find(item => item.id === id) as BookInfoType
        const epubToc = fs.readFileSync(
          `${appCachePathDataEpubCache}\\${id}\\toc.json`,
          "utf-8"
        )
        epubBook.toc = JSON.parse(epubToc)
        event.returnValue = {
          code: 200,
          errror: "",
          book: epubBook
        }
        break
      case "comic":
        const comicList = comicStore.getList()
        const comicBook = comicList.find(item => item.id === id) as BookInfoType
        const comicToc = fs.readFileSync(
          `${appCachePathDataComicCache}\\${id}.json`,
          "utf-8"
        )
        comicBook.toc = JSON.parse(comicToc)
        event.returnValue = {
          code: 200,
          errror: "",
          book: comicBook
        }
      default:
        break
    }
  })

  // 读取txt内容
  ipcMain.on("get-book-content", (event, id: string, tocId: string) => {
    const content = fs.readFileSync(
      `${appCachePathDataArticle}\\${id}\\${tocId}.txt`,
      "utf-8"
    )

    event.returnValue = content
  })

  // 读取epub目录
  ipcMain.on("get-epub-toc", (event, id: string) => {
    const toc = fs.readFileSync(
      `${appCachePathDataEpubCache}\\${id}\\toc.json`,
      "utf-8"
    )
    event.returnValue = JSON.parse(toc)
  })

  // 读取comic目录（需要做排序）
  ipcMain.on("get-comic-toc", (event, id: string) => {
    const toc = fs.readFileSync(
      `${appCachePathDataComicCache}\\${id}.json`,
      "utf-8"
    )
    event.returnValue = JSON.parse(toc)
  })

  // 删除书籍
  ipcMain.on("delete-book", (event, id: string, suffix: BookType) => {
    switch (suffix) {
      case "epub":
        epubStore.deleteBook(id)
        delDir(`${appCachePathDataEpubCache}\\${id}`)
        event.returnValue = true
        break
      case "txt":
        myStore.deleteBook(id)
        delDir(`${appCachePathDataArticle}\\${id}`)
        fs.unlinkSync(`${appCachePathDataCatalog}\\${id}.json`)
        event.returnValue = true
        break
      case "comic":
        comicStore.deleteBook(id)
        fs.unlinkSync(`${appCachePathDataComicCache}\\${id}.json`)
        event.returnValue = true
        break
      default:
        break
    }
  })

  ipcMain.on("update-book-list", (event, suffix: BookType) => {
    let list: BookStorageInfo[]
    switch (suffix) {
      case "epub":
        list = epubStore.getList()
        break
      case "txt":
        list = myStore.getList()
        break
      case "comic":
        list = comicStore.getList()
      default:
        list = [
          ...epubStore.getList(),
          ...myStore.getList(),
          ...comicStore.getList(),
        ]
        break
    }
    event.returnValue = list
  })

  ipcMain.on(
    "save-book-info",
    (event, id, suffix: BookType, index: number | string, time: number) => {
      let book = null
      switch (suffix) {
        case "txt":
          book = myStore.getList().find(item => item.id === id)
          if (book === undefined) {
            event.returnValue = false
          } else {
            book.current = index
            book.updateTime = time
            myStore.updateList(book)
            event.returnValue = true
          }
          event.returnValue = true
          break
        case "epub":
          book = epubStore.getList().find(item => item.id === id)
          if (book === undefined) {
            event.returnValue = false
          } else {
            book.current = index
            book.updateTime = time
            epubStore.updateList(book)
            event.returnValue = true
          }
          break
        case "comic":
          book = comicStore.getList().find(item => item.id === id)
          if (book === undefined) {
            event.returnValue = false
          } else {
            book.current = index
            book.updateTime = time
            comicStore.updateList(book)
            event.returnValue = true
          }
      }
    }
  )
}

const handleAppendBookByTxt = async (
  event: IpcMainEvent,
  book: BookStorageInfo
) => {
  let article = ""
  let index = 0
  let prologue = ""

  const pest =
    /([^\(])(正文){0,1}(第)([零〇一二三四五六七八九十百千万a-zA-Z0-9]{1,7})[章节卷集部篇回]((?! {4}).)((?!\t{1,4}).){0,30}([^完])([^\)])\r?\n/g
  const washpest = /(PS|ps)(.)*(|\\n)/
  const list: string[] = [] // 章节列表
  let nameList: BookCatalogType[] = []
  let data: string = fs.readFileSync(book.filePath, "utf-8")
  data = data.replace(new RegExp(washpest, "g"), "")

  data.match(pest).forEach(item => {
    nameList.push({
      id: uuidv4(),
      title: item.trim(),
    })
  })

  progressCount += nameList.length

  lineReader.eachLine(book.filePath, function (line, last) {
    if (index < nameList.length && line.trim() === nameList[index].title) {
      if (prologue === "" && article !== "") {
        prologue = article
        article = ""
        index += 1
      } else {
        list.push(article)
        article = ""
        index += 1
      }
    } else {
      article += line + "\n"
    }

    if (last) {
      list.push(article)
      if (list.length !== nameList.length) {
        event.returnValue = []
        return
      }
      // 清空数据
      article = ""
      prologue = ""
      const tempNameList = JSON.parse(
        JSON.stringify(nameList)
      ) as BookCatalogType[]
      nameList = []

      // 存储目录
      const catalogStore = new Store({
        name: book.id,
        cwd: appCachePathDataCatalog,
      })

      catalogStore.set("catalog", tempNameList)

      // 存储文章内容
      fs.mkdirSync(`${appCachePathDataArticle}\\${book.id}`)

      if (prologue !== "") {
        progressCount += 1
        fs.writeFileSync(`${appCachePathDataArticle}\\${book.id}\\prologue.txt`,prologue)
        updateProgressCount += 1
      }

      list.forEach((item, index) => {
        fs.writeFileSync(`${appCachePathDataArticle}\\${book.id}\\${tempNameList[index].id}.txt`, item)
        updateProgressCount += 1
        if (updateProgressCount === progressCount) {
          event.returnValue = true
        }
      })
    }
  })
}

const handleAppendBookByEpub = (
  event: IpcMainEvent,
  path: string,
  title: string
) => {
  const id = uuidv4()
  const zip = new AdmZip(path)
  const parser = new XMLParser({
    ignoreAttributes: false, // 禁止忽略XML标签属性
    attributeNamePrefix: "", // attribute前缀
  })
  fs.mkdirSync(`${appCachePathDataEpubCache}\\${id}`)
  // 解压container.xml，获取opt的路径
  zip.extractEntryTo(
    "META-INF/container.xml",
    `${appCachePathDataEpubCache}\\${id}`
  )
  // zip.extractAllTo(`${appPath}\\data\\epubCache\\${id}`)

  const containerXML = fs.readFileSync(
    `${appCachePathDataEpubCache}\\${id}\\META-INF\\container.xml`,
    "utf-8"
  )
  const containerObj = parser.parse(containerXML)
  const fullPath =
    containerObj["container"]["rootfiles"]["rootfile"]["full-path"]

  // 解压opt
  zip.extractEntryTo(fullPath, `${appCachePathDataEpubCache}\\${id}`)

  const optFullPath = `${appCachePathDataEpubCache}\\${id}\\` + fullPath
  const optXML = fs.readFileSync(optFullPath, "utf-8")

  const optObj = parser.parse(optXML)
  const meta = optObj["package"]["metadata"]["meta"]
  let coverID = ""
  if (meta instanceof Array) {
    coverID = meta.find(item => item.name === "cover").content
  } else {
    coverID = meta["content"]
  }
  const manifestArr = optObj["package"]["manifest"]["item"] as any[]

  const coverHref = manifestArr.find(item => item.id === coverID).href
  let tocHref = manifestArr.find(item => item.id === "ncx").href

  const optFullPathArr = fullPath.split("/")
  optFullPathArr.splice(optFullPathArr.length - 1, 1)

  const OEBPS = optFullPathArr.join("/")
  let OEBPScover
  if (OEBPS === "") {
    OEBPScover = `${coverHref}`
  } else {
    OEBPScover = `${OEBPS}/${coverHref}`
    tocHref = `${OEBPS}/${tocHref}`
  }

  zip.extractEntryTo(OEBPScover, `${appCachePathDataEpubCache}\\${id}`)
  zip.extractEntryTo(tocHref, `${appCachePathDataEpubCache}\\${id}`)

  const tocData = fs.readFileSync(
    `${appCachePathDataEpubCache}\\${id}\\${tocHref}`,
    "utf-8"
  )
  const tocObj = parser.parse(tocData)

  const toc = tocObj["ncx"]["navMap"]["navPoint"]
  fs.writeFileSync(
    `${appCachePathDataEpubCache}\\${id}\\toc.json`,
    JSON.stringify(toc),
    "utf-8"
  )

  const book: BookStorageInfo = {
    id,
    title: title.split(".")[0],
    filePath: path,
    suffix: "epub",
    cover: `${appCachePathDataEpubCache}\\${id}\\${OEBPS}\\${coverHref}`,
    createTime: Date.now(),
    updateTime: -1,
    current: 0,
  }

  epubStore.addBooks([book])
  event.returnValue = true
}

const handleAppendComic = async (event: IpcMainEvent) => {
  const result = await dialog.showOpenDialog({
    title: "打开",
    properties: ["openDirectory", "multiSelections"],
  })

  if (result.canceled) {
    event.returnValue = false
  } else {
    const comicList: string[] = result.filePaths

    comicList.forEach(comicPath => {
      const title = comicPath.split("\\")[comicPath.split("\\").length - 1]
      handleSingleComic(event, comicPath, title)
    })
    console.log('zzz');
    
    event.returnValue = true
  }
}

const handleSingleComic = async (
  event: IpcMainEvent,
  path: string,
  title: string
) => {
  const pathExist = fs.existsSync(path)
  if (!pathExist) {
    event.returnValue = []
    return
  }

  const id = uuidv4()
  const comicFiles = await readdir(path)

  const book: BookStorageInfo = {
    id,
    title,
    filePath: path,
    suffix: "comic",
    cover: `${path}\\${comicFiles[0]}`,
    createTime: Date.now(),
    updateTime: -1,
    isCollection: false,
    current: 0,
  }

  await fs.writeFileSync(
    `${appCachePathDataComicCache}\\${id}.json`,
    JSON.stringify(comicFiles)
  )

  comicStore.addBooks([book])
  event.returnValue = true
}

const delDir = path => {
  let files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach((file, index) => {
      let curPath = path + "/" + file
      if (fs.statSync(curPath).isDirectory()) {
        delDir(curPath) //递归删除文件夹
      } else {
        fs.unlinkSync(curPath) //删除文件
      }
    })
    fs.rmdirSync(path)
  }
}
