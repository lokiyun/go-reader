import Epub, { Rendition } from "epubjs"
import Locations from "epubjs/types/locations"
import React, { createContext, useContext, useEffect, useState } from "react"
import useKeyPress from "../hooks/useKeyPress"
import { useResize } from "../hooks/useSize"
import qs from "qs"
import { BookInfoType, BookType } from "../schema-types"
import { ColorOptions, SettingContext } from "./SettingProvider"

interface EpubInfoType {
  locations: Locations | null
  rendition: Rendition | null
  epubIframe: HTMLIFrameElement
  pageList: string[]
}

interface ComicImageSizeType {
  width?: number
  height?: number
}

interface ComicInfoType {
  comicCanvas2D?: CanvasRenderingContext2D | null
  comicElement?: HTMLCanvasElement | null
}

interface BookContextType {
  currentIndex: number | string // 当前章节索引
  asideVisible: boolean

  bookContent: string // 书籍内容
  pageSize: number
  epubTocSrc: string

  bookInfo: BookInfoType

  handleChangeBookInfo?: (bookInfo: BookInfoType) => void

  epubInfo?: EpubInfoType
  epubIframeFocus?: boolean

  handleChangeEpubInfo?: (epubInfo: EpubInfoType) => void

  comicInfo?: ComicInfoType
  comicImageSize?: ComicImageSizeType
  handleParseComic?: (cvs: HTMLCanvasElement) => void

  handleToggleIndex?: (index: number | string) => void // 切换章节索引函数
  changeBookContent?: (content: string) => void // 切换书籍内容

  handleChangeEpubTocSrc?: (src: string) => void
  handleChangeCurrentIndex?: (index: number) => void
  nextPage?: () => void
  prevPage?: () => void
}

export const BookContext = createContext<BookContextType>({
  currentIndex: 0,
  bookContent: "",
  pageSize: 0,
  asideVisible: true,
  epubTocSrc: '',

  // -----------------------------
  bookInfo: {
    id: "",
    title: "",
    filePath: "",
    suffix: "unknown",
    cover: "",
    bookMark: [],
    isCollection: false,
    current: 0,
    updateTime: -1,
    createTime: -1,
    toc: []
  },
  epubInfo: {
    rendition: null,
    locations: null,
    epubIframe: null,
    pageList: []
  },
  comicInfo: {
    comicCanvas2D: null,
    comicElement: null,
  },
  comicImageSize: {
    height: 1280,
    width: 720,
  },
})

const BookProvider = ({ children }: any) => {
  const settingContext = useContext(SettingContext)

  const [currentIndex, setCurrentIndex] = useState<number | string>(0)
  const [asideVisible, setAsideVisible] = useState(true)
  const [pageSize, setPageSize] = useState(0)
  const [epubTocSrc, setEpubTocSrc] = useState('')

  useEffect(() => {
    console.log('pageSize: ' + pageSize)
  }, [pageSize])

  // BOOK INFO
  const [bookInfo, setBookInfo] = useState<BookInfoType>({
    id: "",
    title: "",
    filePath: "",
    suffix: "unknown",
    cover: "",
    bookMark: [],
    isCollection: false,
    current: 0,
    updateTime: -1,
    createTime: -1,
    toc: []
  })

  const handleChangeBookInfo = (book: BookInfoType) => {
    setBookInfo(book)
  }

  // TXT Info
  const [bookContent, setBookContent] = useState("")

  // EPUB INFO
  const [epubInfo, setEpubInfo] = useState<EpubInfoType>({
    rendition: null,
    locations: null,
    epubIframe: null,
    pageList: []
  })

  const handleChangeEpubTocSrc = (src: string) => {
    setEpubTocSrc(src)
  }

  const handleChangeEpubInfo = (epub: EpubInfoType) => {
    setEpubInfo(epub)
  }

  // COMIC INFO
  const [comicInfo, setComicInfo] = useState<ComicInfoType>({
    comicCanvas2D: null,
    comicElement: null
  })

  const [comicImageSize, setComicImageSize] = useState<ComicImageSizeType>({
    width: 1280,
    height: 720
  })

  useEffect(() => {
    const hrefArr = location.href.split("?")
    const state = hrefArr[hrefArr.length - 1]
    const stateObj = qs.parse(state)

    const suffix = stateObj["suffix"] as BookType
    const id = stateObj["id"]

    const bookState = window.books.getBookInfo(id, suffix)

    if (bookState.book.suffix === "epub") {
      handleParseEpub(bookState.book)
    } else if (bookState.book.suffix === "txt") {
      const content = window.books.getBookContent(bookState.book.id, bookState.book.toc[bookState.book.current].id)
      setPageSize(bookState.book.toc.length)
      setCurrentIndex(bookState.book.current)
      changeBookContent && changeBookContent(content)
    } else if (bookState.book.suffix === "comic") {
      setPageSize(bookState.book.toc.length)
    }
    setBookInfo(bookState.book)
  }, [])

  useEffect(() => {
    if (comicInfo.comicCanvas2D) {
      draw(+bookInfo.current)
      setCurrentIndex(bookInfo.current)
    }
  }, [comicInfo])

  useEffect(() => {
    if (epubInfo.rendition) {
      epubInfo.rendition.themes.fontSize(settingContext.fontSize + 'px')
      ColorOptions.forEach((item) => {
        epubInfo.rendition.themes.register(item.label, item.value)
      })
      epubInfo.rendition.themes.select(settingContext.backgroundColor.label)
    }
  }, [epubInfo.rendition])

  // resize ----------------------------------------
  const size = useResize()

  const resize = () => {
    if (epubInfo.rendition) {
      epubInfo.rendition.resize(
        window.innerWidth - 200,
        window.innerHeight - 72
      )
    }
  }

  // -----------------------------------------------

  const LeftKeyPressed = useKeyPress(37)
  const RightkeyPressed = useKeyPress(39)

  const nextPage = () => {
    if (epubInfo.rendition && bookInfo.suffix === "epub") {
      epubInfo.rendition.next().then(() => {
        const currentLocation = epubInfo.rendition.currentLocation() as any
        const cfi = currentLocation.start.cfi
        const index = epubInfo.locations.locationFromCfi(cfi)
        setCurrentIndex(+index)
      })
    } else if (bookInfo.suffix === "comic") {
      if (currentIndex === bookInfo.toc.length - 1) return
      draw(+currentIndex + 1)
      setCurrentIndex(+currentIndex + 1)
    } else if (bookInfo.suffix === "txt") {
      // setCurrentIndex(+currentIndex + 1)
      getTxtContent(+currentIndex + 1)
    }
  }

  const prevPage = () => {
    if (epubInfo.rendition && bookInfo.suffix === "epub") {
      epubInfo.rendition.prev().then(() => {
        const currentLocation = epubInfo.rendition.currentLocation() as any
        const cfi = currentLocation.start.cfi
        const index = epubInfo.locations.locationFromCfi(cfi)
        setCurrentIndex(+index)
      })
    } else if (bookInfo.suffix === "comic") {
      if (currentIndex === 0) return
      draw(+currentIndex - 1)
      setCurrentIndex(+currentIndex - 1)
    } else if (bookInfo.suffix === "txt") {
      getTxtContent(+currentIndex - 1)
    }
  }

  useEffect(() => {
    if (LeftKeyPressed) {
      if (epubInfo.rendition && bookInfo.suffix === "epub") {
        epubInfo.rendition.prev().then(() => {
          const currentLocation = epubInfo.rendition.currentLocation() as any
          const cfi = currentLocation.start.cfi
          const index = epubInfo.locations.locationFromCfi(cfi)
          setCurrentIndex(+index)
        })
      } else if (bookInfo.suffix === "comic") {
        if (currentIndex === 0) return
        draw(+currentIndex - 1)
        setCurrentIndex(+currentIndex - 1)
      } else if (bookInfo.suffix === "txt") {
        getTxtContent(+currentIndex - 1)
      }
    } else if (RightkeyPressed) {
      if (epubInfo.rendition && bookInfo.suffix === "epub") {
        epubInfo.rendition.next().then(() => {
          const currentLocation = epubInfo.rendition.currentLocation() as any
          const cfi = currentLocation.start.cfi
          const index = epubInfo.locations.locationFromCfi(cfi)
          setCurrentIndex(+index)
        })
      } else if (bookInfo.suffix === "comic") {
        if (currentIndex === bookInfo.toc.length - 1) return
        draw(+currentIndex + 1)
        setCurrentIndex(+currentIndex + 1)
      } else if (bookInfo.suffix === "txt") {
        // setCurrentIndex(+currentIndex + 1)
        getTxtContent(+currentIndex + 1)
      }
    }
  }, [LeftKeyPressed, RightkeyPressed])

  useEffect(() => {
    resize()
    if (bookInfo.suffix === "comic") {
      draw(+currentIndex)
    }
  }, [size])

  useEffect(() => {
    if (epubInfo.rendition) {
      settingContext.handleChangeLoadingVisible(false)
    }
  }, [epubInfo])

  const handleChangeCurrentIndex = (index: number) => {
    setCurrentIndex(index)
  }

  // 切换当前index
  const handleToggleIndex = (index: number | string) => {
    // 判断索引不是epub的情况下，需要对index做限制
    if (bookInfo.suffix !== "epub") {
      if (+index < 0) return
      else if (+index > bookInfo.toc.length - 1) return
      else if (bookInfo.suffix === "comic") {
        draw(+index)
      } else if (bookInfo.suffix === "txt") {
        // const content = window
        getTxtContent(+index)
      }
      setCurrentIndex(index)
    } else {
      if (epubInfo.rendition) {
        if (typeof index === "string") {
          epubInfo.rendition.display(index).then(() => {
            setEpubTocSrc(index.toString())
            const currentLocation = epubInfo.rendition.currentLocation() as any
            const location = currentLocation.start.location
            setCurrentIndex(location)
          })
        } else {
          if (index < 0) return
          else if (index > epubInfo.pageList.length - 1) return
          const cfi = epubInfo.pageList[index]
          epubInfo.rendition.display(cfi)
          setCurrentIndex(index)
        }

      }
    }

  }

  const getTxtContent = (index: number) => {
    const content = window.books.getBookContent(bookInfo.id, bookInfo.toc[index].id)
    setCurrentIndex(index)
    changeBookContent(content)
  }

  const handleParseEpub = (book: BookInfoType) => {
    if (book.filePath === "") return
    settingContext.handleChangeLoadingVisible(true)
    const epub = Epub(book.filePath)

    const rendition = epub.renderTo("reader-area", {
      width: size.width - 200,
      height: size.hieght - 72,
    })
    console.log(epub);


    epub.ready
      .then(() => {
        return epub.locations.generate(0)
      })
      .then((result: string[]) => {
        const cfi = epub.locations.cfiFromLocation(+book.current)

        rendition.display(cfi)
        setPageSize(result.length)

        const iframe = document.querySelector("iframe")
        setEpubInfo({
          locations: epub.locations,
          rendition,
          epubIframe: iframe,
          pageList: result
        })
      })
  }

  const handleParseComic = (cvs: HTMLCanvasElement) => {
    const ctx = cvs.getContext('2d')
    setComicInfo({
      comicElement: cvs,
      comicCanvas2D: ctx
    })
  }

  const draw = (index: number) => {
    const img = new Image()
    img.onload = function () {
      setComicInfo
      setComicImageSize({
        width: img.width,
        height: img.height
      })

      comicInfo.comicCanvas2D.drawImage(img, 0, 0, comicInfo.comicElement.width, comicInfo.comicElement.height)
      comicInfo.comicCanvas2D.fillStyle = comicInfo.comicCanvas2D.createPattern(img, 'no-repeat')
    }

    img.src = `${bookInfo.filePath}\\${bookInfo.toc[index]}`
  }

  // 切换书籍内容
  const changeBookContent = (content: string) => {
    setBookContent(content)
  }

  return (
    <>
      <BookContext.Provider
        value={{
          pageSize,
          bookInfo,
          epubInfo,
          comicInfo,
          comicImageSize,
          asideVisible,
          epubTocSrc,
          handleChangeBookInfo,
          handleChangeEpubInfo,
          handleParseComic,
          currentIndex,
          bookContent,
          handleToggleIndex,
          changeBookContent,
          handleChangeEpubTocSrc,
          handleChangeCurrentIndex,
          nextPage,
          prevPage
        }}>
        {children}
      </BookContext.Provider>
    </>
  )
}

export default BookProvider
