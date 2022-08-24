import React, { useContext, useEffect, useState } from "react"
import dayjs from 'dayjs'
import Controls from "../../components/controls/Controls"
import { BookInfoType } from "../../schema-types"
import "./style.scss"
import zwfm from "../../assets/images/zwfm.jpg"
import logo from "../../assets/images/logo.png"
import { ShelfContext } from "../../store/ShelfProvider"
import { SettingContext } from "../../store/SettingProvider"

// const { ipcRenderer } = window.require('electron')

const ShelfScreen = () => {
  const shelfContext = useContext(ShelfContext)
  const settingContext = useContext(SettingContext)
  useEffect(() => {
    
  }, [])

  const handleAppendBook = async () => {
    await settingContext.handleChangeLoadingVisible(true)
    let list: BookInfoType[] = []
    console.log('activeIndex: ', shelfContext.activeIndex);
    let result = true
    
    if (shelfContext.activeIndex === 3) {
     
      if (result) {
        
      }
      setTimeout(() => {
        result = window.books.appendComicList(shelfContext.activeIndex)
        if (result) {
          list = window.books.getComicList()
          setTimeout(() => {
            settingContext.handleChangeLoadingVisible(false)
          }, 300)
          shelfContext.handleChangeBookList && shelfContext.handleChangeBookList(list)
        }
      }, 300)
    } else {
      setTimeout(() => {
        result = window.books.appendBookList(shelfContext.activeIndex)
        if (result) {
          if (shelfContext.activeIndex === 0) {
            list = window.books.getAllList()
          } else if (shelfContext.activeIndex === 1) {
            list = window.books.getTxtList()
          } else {
            list = window.books.getEpubList()
          }

          setTimeout(() => {
            settingContext.handleChangeLoadingVisible(false)
          }, 300)
         

          shelfContext.handleChangeBookList && shelfContext.handleChangeBookList(list)
        }
      }, 300)

      
      
      // shelfContext.handleChangeBookList && shelfContext.handleChangeBookList(bookList)
    }

  }

  const openBookWindow = (item: BookInfoType) => {
    window.utils.bookViewWindow(item.id, item.suffix)
  }

  const handleChangeTime = (update: number) => {
    const beforeDay = dayjs(update)
    const afterDay = dayjs(Date.now())

    let minutes = afterDay.diff(beforeDay, 'minutes')
    let hours = 0
    let days = 0
    if (minutes < 1) {
      return '刚刚'
    } else if (minutes < 60) {
      return `${minutes}分钟前`
    } else if (minutes < 1440) {
      hours = Math.floor(minutes / 60)
      minutes = minutes - (hours * 60)
      return `${hours}${minutes}分钟前`
    } else {
      hours = Math.floor(minutes / 60)
      days = Math.floor(hours / 24)

      return `${days}天前`
    }
  }

  return (
    <div className="shelf">
      <nav className="shelf-nav">
        <div className="shelf-nav-logo">
          <img src={logo} alt="logo" />
          <div className="shelf-nav-title">本地阅读器</div>
        </div>
       
        <Controls />
      </nav>
      <aside className="shelf-aside">
        <div className="shelf-aside-addBook button" onClick={handleAppendBook}>
          {shelfContext.appendBtnTitle}
        </div>
        <div className="shelf-aside-list">
          <ul className="shelf-aside-categories">
            <div
              className="shelf-aside-active"
              style={{
                top: shelfContext.activeIndex * 1.5 + "rem",
              }}></div>
            <li
              className="shelf-aside-category button"
              onClick={() => shelfContext.handleChangeActiveIndex(0)}>
              全部图书
            </li>
            <li
              className="shelf-aside-category button"
              onClick={() => shelfContext.handleChangeActiveIndex(1)}>
              TXT
            </li>
            <li
              className="shelf-aside-category button"
              onClick={() => shelfContext.handleChangeActiveIndex(2)}>
              EPUB
            </li>
            <li
              className="shelf-aside-category button"
              onClick={() => shelfContext.handleChangeActiveIndex(3)}>
              漫画
            </li>
          </ul>
        </div>
      </aside>
      <main className="shelf-main">
        <div className="shelf-main-list">
          {shelfContext.bookList.map(item => (
            <div
              className="shelf-main-item button"
              key={item.id}
              onClick={() => openBookWindow(item)}
            >
              <div className="shelf-main-time">
                {item.updateTime === -1 ? "新添加" : handleChangeTime(item.updateTime)}
              </div>
              <div className="shelf-main-img">
                <img
                  src={item.cover !== "" ? item.cover : zwfm}
                  alt={`${item.suffix}__${item.id}`}
                />
              </div>
              <div className="shelf-main-title">{item.title}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default ShelfScreen
