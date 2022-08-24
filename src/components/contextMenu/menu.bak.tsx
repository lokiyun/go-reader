import classNames from "classnames"
import React, { useEffect, useRef, useState } from "react"
import { CSSTransition } from 'react-transition-group'
import "./contextmenu.style.scss"

const ContextMenu = () => {
  const menuRef = useRef<HTMLDivElement>()
  const [contextMenu, setContextMenu] = useState(false)

  const menuClasses = classNames("context-menu button")


  useEffect(() => {
    window.oncontextmenu = (e: MouseEvent) => {
      e.preventDefault()

      const menuHeight = menuRef.current.offsetHeight - parseInt(getComputedStyle(menuRef.current)['paddingTop']) - parseInt(getComputedStyle(menuRef.current)['paddingBottom'])

      menuRef.current.style.left = `${e.clientX}px`
      menuRef.current.style.top = `${e.clientY + 5}px`
      menuRef.current.style.height = `${menuHeight}px`

      setContextMenu(true)

      return false
    }

    window.onclick = () => {
      // menuRef.current.style.height = '0'

      setContextMenu(false)
    }
  }, [])

  return (
    <div ref={menuRef} className={menuClasses}>
      <ul className="context-menu-list">
        <li className="context-menu-item">
          <span className="context-menu-item-title">打开书籍</span>
        </li>
        <li className="context-menu-item">
          <span className="context-menu-item-title">添加至分类</span>
        </li>
        <li className="context-menu-item">
          <span className="context-menu-item-title">打开文件所在位置</span>
        </li>
        <li className="context-menu-item">
          <span className="context-menu-item-title context-menu-danger">删除</span>
        </li>
      </ul>
    </div>
  )
}

export default ContextMenu
