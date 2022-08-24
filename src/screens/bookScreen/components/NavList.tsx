import classNames from "classnames"
import React, { useContext, useState } from "react"
import { BookCatalogType, EpubTocType } from "../../../schema-types"
import { BookContext } from "../../../store/BookProvider"

interface NavListProps {
  handleToggleIndex: Function
}

const NavList = (props: NavListProps) => {
  const bookContext = useContext(BookContext)

  const handleTocItemClasses = (index: number): string => {
    const tocItemClasses = classNames("bookscreen-toc-item", {
      "bookscreen-toc-active": index === bookContext.currentIndex,
    })

    return tocItemClasses
  }

  const handleEpubTocItemClasses = (src: string): string => { 
    const tocItemClasses = classNames("bookscreen-toc-item", {
      "bookscreen-toc-active": bookContext.epubTocSrc === src,
    })

    return tocItemClasses
  }

  const handleClick = (e: any, index: number | string) => {
    if (bookContext.bookInfo.suffix === "epub") {
      bookContext.handleToggleIndex(index)
    } else {
      bookContext.handleToggleIndex(index as number)
    }
  }

  const txtNavList = () => {
    return bookContext.bookInfo.toc.map((item, index) => (
      <li
        onClick={(e) => handleClick(e, index)}
        key={`${item}-${index}`}
        className={handleTocItemClasses(index)}>
        {item.title}
      </li>
    ))
  }

  const epubNavList = () => {
    return parseNavPoint(bookContext.bookInfo.toc)
  }

  const parseNavPoint = (
    navPoint: EpubTocType[] | EpubTocType | string[] | BookCatalogType[]
  ) => {
    return navPoint instanceof Array ? (
      <ul>
        {navPoint.map((item: any) => {
          let subItem = null
          if (item.navPoint) {
            subItem = parseNavPoint(item.navPoint)
          }
          return (
            <div key={`item-${item.id}`}>
              <li
                data-src={item.content.src}
                className={handleEpubTocItemClasses(item.content.src)}
                key={item.id}
                onClick={(e) => handleClick(e, item.content.src)}>
                {item.navLabel?.text}
              </li>
              <div key={`subitem-${item.id}`}>{subItem}</div>
            </div>
          )
        })}
      </ul>
    ) : (
      <li
        onClick={(e) => handleClick(e, navPoint.content.src)}
        className={handleEpubTocItemClasses(navPoint.content.src)}
        key={navPoint.id}>
        {navPoint.navLabel.text}
      </li>
    )
  }

  const comicNavList = () => {
    return bookContext.bookInfo.toc.map((item, index) => (
      <li
        onClick={(e) => handleClick(e, index)}
        key={`${item}-${index}`}
        className={handleTocItemClasses(index)}>
        {item}
      </li>
    ))
  }

  return (
    <>
      {bookContext.bookInfo.suffix === "txt"
        ? txtNavList()
        : bookContext.bookInfo.suffix === "epub"
        ? epubNavList()
        : comicNavList()}
    </>
  )
}

export default NavList
