import Store from 'electron-store'
import { BookInfoType, BookStorageInfo } from '../schema-types'

class BookStore extends Store {
  list: BookStorageInfo[]
  constructor(settings) {
    super(settings)
    this.list = this.get('data') as BookStorageInfo[] || []
  }

  saveList() {
    this.set('data', this.list)
    return this
  }

  getList() {
    return this.get('data') as BookStorageInfo[] || []
  }

  addBooks(books: BookStorageInfo[]) {
    const bookWithProps = books.filter(book => {
      // 检测是否漫画重名
      const currentBookTitle = this.getList().map(item => item.title)
      return currentBookTitle.indexOf(book.title) < 0
    }) 
    this.list = [...this.getList(), ...bookWithProps]
    return this.saveList()
  }
  getSelectedBook(bookId) {
    let index = -1
    const book = this.getList().filter((item, i) => {
      index = i
      return item.id === bookId
    })
    return {
      book,
      index
    }
  }
  deleteBook(deletedId) {
    this.list = this.getList().filter(item => item.id !== deletedId)
    return this.saveList()
  }
  updateList(newBook: BookStorageInfo) {
    const list = this.getList()
    
    const bookIndex = list.findIndex((item) => {
      return item.id === newBook.id
    })
    console.log(newBook);
    
    list[bookIndex] = newBook
    this.list = list
    
    return this.saveList()
  }
}

export default BookStore
