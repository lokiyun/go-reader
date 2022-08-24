import React, { useContext, useEffect, useRef, useState } from "react"
import { CSSTransition } from "react-transition-group"
import classNames from "classnames"
import Controls from "../../components/controls/Controls"
import { BookInfoType, BookType } from "../../schema-types"
import { BookContext } from "../../store/BookProvider"
import TxtView from "./components/TxtView"
import "./bookscreen.style.scss"
import EpubView from "./components/EpubView"
import NavList from "./components/NavList"
import ComicView from "./components/ComicView"
import Select from "react-select"
import { useThrottle } from "../../hooks/useThrottle"
import qs from "qs"
import {
  ColorOptions,
  SettingContext,
  ThemeOptions,
} from "../../store/SettingProvider"
import Progress from "../../components/progress/Progress"
import { useClickOutside } from "../../hooks/useClickOutSide"
import useKeyPress from "../../hooks/useKeyPress"

const BookScreen = () => {
  const bookContext = useContext(BookContext)
  const [suffix, setSuffix] = useState<BookType>("unknown")
  const [tocVisible, setTocVisible] = useState(true)
  const [bookInfo, setBookInfo] = useState<BookInfoType | null>(null)
  const viewRef = useRef<HTMLDivElement>()
  const footerRef = useRef<HTMLElement>()
  const asideRef = useRef<HTMLElement>()
  const [currentProgress, setCurrentProgress] = useState(0)

  const settingContext = useContext(SettingContext)

  const handleHideFooter = () => {
    if (settingContext.footerVisible) {
      settingContext.handleChangeFooterVisible(false)
    } else {
      settingContext.handleChangeFooterVisible(true)
    }
  }

  useClickOutside([footerRef, asideRef], handleHideFooter)

  const enterKeyPress = useKeyPress(13)

  useEffect(() => {
    if (enterKeyPress) {
      bookContext.handleToggleIndex(+currentProgress - 1)
    }
  }, [enterKeyPress])

  // const handleChangeBook = (book: BookInfoType, toc: any[], content: string) => {
  //   bookContext.initBookID && bookContext.initBookID(book.id)
  //   bookContext.initBookName && bookContext.initBookName(book.title)
  //   bookContext.handleChangeBookType && bookContext.handleChangeBookType(book.suffix)
  //   bookContext.handleChangeUpdateTime && bookContext.handleChangeUpdateTime(Date.now())
  //   bookContext.handleChangeCreateTime && bookContext.handleChangeCreateTime(book.createTime)

  //   if (book.suffix === "txt") {
  //     bookContext.changeBookContent && bookContext.changeBookContent(content)
  //     bookContext.initToc && bookContext.initToc(toc)
  //   } else {
  //     bookContext.handleChangeFilePath && bookContext.handleChangeFilePath(book.filePath)
  //   }
  //   if (book.suffix === "epub") {
  //     const toc = window.books.getEpubToc(book.id)
  //     bookContext.initToc(toc)
  //   } else if (book.suffix === "comic") {
  //     const toc = window.books.getComicToc(book.id)
  //     bookContext.initToc(toc)
  //   }
  // }

  const viewClasses = classNames("bookscreen-view", {
    "bookscreen-view-tochidden": !tocVisible,
    "bookscreen-view-comic": bookContext.bookInfo.suffix === "comic",
    "bookscreen-view-noscrollbar": bookContext.bookInfo.suffix !== "txt",
  })

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.scrollTo({
        top: 0,
      })
    }
  }, [bookContext.currentIndex])

  const options = [
    {
      value: 16,
      label: "小号",
    },
    {
      value: 20,
      label: "中号",
    },
    {
      value: 24,
      label: "大号",
    },
  ]

  const prevPage = () => {
    bookContext.prevPage()
  }

  const nextPage = () => {
    bookContext.nextPage()
  }

  const handleFontSizeOption = selectedState => {
    bookContext.epubInfo.rendition.themes.fontSize(selectedState.value + "px")
    settingContext.handleChangeFontSize(selectedState)
  }

  const handleColorOption = selectedState => {
    if (bookContext.bookInfo.suffix === "epub") {
      bookContext.epubInfo.rendition.themes.register(selectedState.label)
    }
    settingContext.handleChangeBackground(selectedState)
  }

  const handleThemeOption = selectedState => {
    settingContext.handleChangeTheme(selectedState)
  }

  const onProgressChange = (progress: any) => {
    if (bookContext.epubInfo.locations) {
      const percentage = progress / 100
      const location =
        percentage > 0
          ? bookContext.epubInfo.locations.cfiFromPercentage(percentage)
          : 0
      if (location) {
        bookContext.epubInfo.rendition?.display(location)
        setCurrentProgress(progress)
      }
    }
  }

  return bookContext.bookInfo.suffix === "unknown" ? (
    <div>loading</div>
  ) : (
    <div className="bookscreen">
      <header className="bookscreen-header">
        <h3 className="bookscreen-header-title">
          {bookContext.bookInfo.title}
        </h3>
        <Controls />
      </header>
      <nav className="bookscreen-menu">
        <div className="bookscreen-menu-left">
          <div className="bookscreen-logo">Go Reader</div>
          <div
            className="bookscreen-menu-item button"
            onClick={() => setTocVisible(!tocVisible)}>
            <span className="iconfont icon-menu"></span>
          </div>
          <div className="bookscreen-menu-item button">
            <div>字号:&nbsp;&nbsp;</div>
            <Select
              value={settingContext.fontSize}
              options={options}
              onChange={handleFontSizeOption}
            />
          </div>
          <div className="bookscreen-menu-item button">
            <div>背景:&nbsp;&nbsp;</div>
            <Select
              value={settingContext.backgroundColor}
              options={ColorOptions}
              onChange={handleColorOption}
            />
          </div>
          <div className="bookscreen-menu-item button">
            <div>主题:&nbsp;&nbsp;</div>
            <Select
              value={settingContext.theme}
              options={ThemeOptions}
              onChange={handleThemeOption}
            />
          </div>
        </div>
        <div className="bookscreen-menu-right"></div>
      </nav>
      <CSSTransition
        in={tocVisible}
        timeout={300}
        classNames="my-toc"
        unmountOnExit>
        <aside className="bookscreen-toc" ref={asideRef}>
          <ul className="bookscreen-toc-list">
            <NavList handleToggleIndex={bookContext.handleToggleIndex} />
          </ul>
        </aside>
      </CSSTransition>

      <main
        className={viewClasses}
        ref={viewRef}
        style={{
          backgroundColor: settingContext.backgroundColor.value,
        }}>
        <div
          className="bookScreen-arrow bookScreen-arrow-left"
          onClick={() => {
            prevPage()
          }}>
          <span className="iconfont icon-prev"></span>
        </div>
        <div
          className="bookScreen-arrow bookScreen-arrow-right"
          onClick={() => {
            nextPage()
          }}>
          <span className="iconfont icon-next"></span>
        </div>
        {bookContext.bookInfo.suffix === "txt" ? (
          <TxtView />
        ) : bookContext.bookInfo.suffix === "epub" ? (
          <EpubView />
        ) : (
          <ComicView />
        )}
      </main>
      <CSSTransition
        in={settingContext.footerVisible}
        timeout={300}
        classNames="my-footer"
        unmountOnExit>
        <footer className="bookscreen-footer" ref={footerRef}>
          <div className="bookscreen-footer-progress">
            <>
              {bookContext.bookInfo.suffix !== "epub" ? (
                <Progress
                  handler={index => {
                    bookContext.handleToggleIndex(+index)
                  }}
                  max={bookContext.pageSize - 1}
                  value={+bookContext.currentIndex}
                />
              ) : (
                <Progress
                  handler={index => {
                    onProgressChange(index)
                  }}
                  max={100}
                  value={currentProgress}
                />
              )}
            </>
          </div>
        </footer>
      </CSSTransition>
    </div>
  )
}

export default BookScreen
