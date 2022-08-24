import React, { createContext, useEffect, useState } from "react";
import { BookInfoType } from "../schema-types";

interface ShelfType {
  bookList: BookInfoType[]
  activeIndex: number
  appendBtnTitle: string
  handleChangeBookList?: (bookList: BookInfoType[]) => void
  handleChangeActiveIndex?: (index: number) => void
  handleChangeBtnTitle?: (title: string) => void
}

export const ShelfContext = createContext<ShelfType>({
  bookList: [],
  activeIndex: 0,
  appendBtnTitle: '添加图书'
})

const ShelfProvider = ({ children }: any) => {
  const [bookList, setbookList] = useState<BookInfoType[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [appendBtnTitle, setAppendBtnTitle] = useState('添加图书');

  useEffect(() => {
    if (activeIndex === 3) {
      setAppendBtnTitle("添加漫画")
    } else {
      setAppendBtnTitle("添加图书")
    }
    getBookByCategory()
  }, [activeIndex])

  const getBookByCategory = () => {
    switch (activeIndex) {
      case 0:
        setbookList(window.books.getAllList())
        break
      case 1:
        setbookList(window.books.getTxtList())
        break
      case 2:
        setbookList(window.books.getEpubList())
        break
      case 3:
        setbookList(window.books.getComicList())
        break
      default:
        break
    }
  }

  const handleChangeBookList = (bookList: BookInfoType[]) => {
    setbookList(bookList)
  }

  const handleChangeActiveIndex = (index: number) => {
    setActiveIndex(index)
  }

  const handleChangeBtnTitle = (title: string) => {
    setAppendBtnTitle(title)
  }

  return (
    <ShelfContext.Provider value={{
      bookList,
      activeIndex,
      appendBtnTitle,
      handleChangeBookList,
      handleChangeActiveIndex,
      handleChangeBtnTitle
    }}>
      {children}
    </ShelfContext.Provider>
  )
}

export default ShelfProvider
