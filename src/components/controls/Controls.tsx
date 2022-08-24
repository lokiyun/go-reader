import React, { useContext } from "react"
import { BookContext } from "../../store/BookProvider"
import { SettingContext } from "../../store/SettingProvider"
import './controls.style.scss'

const Controls = () => {
  const bookContext = useContext(BookContext)
  const settingContext = useContext(SettingContext)
  const minimizeWindow = () => {
    console.log(bookContext.bookInfo.id)
    if (bookContext.bookInfo.id !== "") {
      window.utils.minimizeBookwindow(bookContext.bookInfo.id)
    } else {
      window.utils.minimizeWindow()
    }
  }

  const maximizeWindow = () => {
    if (bookContext.bookInfo.id !== "") {
      window.utils.maximizeBookwindow(bookContext.bookInfo.id)
    } else {
      window.utils.maximizeWindow()
    }
  }

  const closeWindow = () => {
    if (bookContext.bookInfo.id !== "") {
      const result = window.books.saveBookInfo(bookContext.bookInfo.id, bookContext.bookInfo.suffix, bookContext.currentIndex, bookContext.bookInfo.updateTime)
      result && window.utils.closeBookWindow(bookContext.bookInfo.id)
    } else {
      window.utils.closeWindow()
    }
  }

  return (
    <div className='controls'>
      <div className='controls-item button'>
        <span className="iconfont icon-setting"></span>
      </div>
      <div className='controls-item button' onClick={minimizeWindow}>
        <span className="iconfont icon-zuixiaohua" ></span>
      </div>
      <div className='controls-item button' onClick={maximizeWindow}>
        <span className="iconfont icon-zuidahua" ></span>
      </div>
      <div className='controls-item button' onClick={closeWindow}>
        <span className="iconfont icon-guanbi" ></span>
      </div>
    </div>
  )
}

export default Controls
