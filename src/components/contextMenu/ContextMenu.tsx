import React, { useContext, useEffect, useRef, useState } from "react"
import { CSSTransition } from 'react-transition-group'
import { useClickOutside } from "../../hooks/useClickOutSide"
import { BookType } from "../../schema-types"
import { BookContext } from "../../store/BookProvider"
import { ShelfContext } from "../../store/ShelfProvider"
import "./contextmenu.style.scss"

const ContextMenu = () => {
  const shelfContext = useContext(ShelfContext)
  const menuRef = useRef<HTMLDivElement>()
  const [contextMenu, setContextMenu] = useState(false)
  const [selectedID, setSelectedID] = useState('')
  const [selectedSuffix, setSelectedSuffix] = useState<BookType>('unknown')

  const handleCloseMenu = () => {
    menuRef.current.style.height = '0'
    setContextMenu(false)
  }

  useClickOutside(menuRef, handleCloseMenu)

  useEffect(() => {
    menuRef.current.style.height = '0'
    window.oncontextmenu = (e: MouseEvent | any) => {
      const classPath = e.path as HTMLElement[]

      const result = classPath.find(item => {
        return item.className === "shelf-main-img"
      })
      if (result === undefined) return
      const imgElement = result.children[0] as HTMLImageElement
      const bookInfoArr = imgElement.alt.split('__')
      setSelectedID(bookInfoArr[1])
      setSelectedSuffix(bookInfoArr[0] as BookType)

      e.preventDefault()
      const menuHeight = 160 - parseInt(getComputedStyle(menuRef.current)['paddingTop']) - parseInt(getComputedStyle(menuRef.current)['paddingBottom'])

      menuRef.current.style.left = `${e.clientX}px`
      menuRef.current.style.top = `${e.clientY + 5}px`
      menuRef.current.style.height = `${menuHeight}px`

      setContextMenu(true)

      return false
    }
  }, [])

  const handleClickItem = (index?: number) => {
    handleCloseMenu()
  }

  const handleDeleteBook = (index: number) => {
    const result = window.books.deleteBook(selectedID, selectedSuffix)

    let bookType: BookType = "unknown"
    if (result) {
      handleCloseMenu()
      switch (shelfContext.activeIndex) {
        case 1:
          bookType = "txt"
          break
        case 2:
          bookType = "epub"
          break
        case 3:
          bookType = "comic"
          break
        default:
          bookType = "unknown"
      }
      const list = window.books.updateBookList(bookType)
      shelfContext.handleChangeBookList(list)
    }
  }

  return (
    <CSSTransition
      in={contextMenu}
      timeout={300}
      classNames="my-contextmenu"
    // unmountOnExit
    >
      <div ref={menuRef} className="context-menu button">
        <ul className="context-menu-list">
          <li className="context-menu-item" onClick={() => handleClickItem()}>
            <span className="context-menu-item-title">打开书籍</span>
          </li>
          <li className="context-menu-item">
            <span className="context-menu-item-title">添加至分类</span>
          </li>
          <li className="context-menu-item">
            <span className="context-menu-item-title">打开文件所在位置</span>
          </li>
          <li className="context-menu-divider"></li>
          <li className="context-menu-item" onClick={() => handleDeleteBook(0)}>
            <span className="context-menu-item-title context-menu-danger">删除</span>
          </li>
        </ul>
      </div>
    </CSSTransition>
  )
}

export default ContextMenu
