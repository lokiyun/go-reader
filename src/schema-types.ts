export type FontSize = 14 | 16 | 18 | 20 | 22 | 24 | 26 | 28 | 30 | 32

export const enum ThemeSettings {
  Default = 'system',
  Light = 'light',
  Dark = 'dark'
}

export type Theme = 'light' | 'dark'

export type ShelfType = 'ebook' | 'comic'

export type TextColor = "#000000" | "#dfe6e9"

export interface ComicType {
  id: string
  title: string
  url: string
  cover: string
  bookmark: BookMarkType[]
  isCollection: boolean
  collection?: ComicType[]
}

export interface BookMarkType {
  title: string
  index: number
}

export interface SettingType {
  fontSize?: FontSize
  textColor?: string
  fontFamily?: string
  fontWeight?: string | number
  background?: string
  backgroundName?: string
}

export type SchemaTypes = {
  version: string
  theme: ThemeSettings
  pac: string
  pacOn: boolean
  fontSize: number
  fontFamily: string
  menuOn: boolean
  useNeDB: boolean
}

export interface SettingType {
  fontSize?: FontSize
  textColor?: string
  fontFamily?: string
  fontWeight?: string | number
  background?: string
  backgroundName?: string
}

export type BookType = 'unknown' | 'txt' | 'epub' | 'comic'

// 书籍存储结构
export interface BookStorageInfo {
  id: string                // 书籍ID
  title: string             // 书名
  filePath: string          // 书籍路径（txt可无）
  suffix: BookType          // 书籍类型
  cover: string             // 书籍封面
  createTime: number        // 添加时间
  updateTime: number        // 最后阅读时间
  bookMark?: any[]          // 书签
  isCollection?: boolean    // 是否是合集
  current: number | string  // 当前阅读索引
}

export interface BookInfoType {
  id: string              // 书籍ID
  title: string           // 书名
  filePath: string        // 书籍路径（txt可无）
  suffix: BookType        // 书籍类型
  cover: string           // 书籍封面
  createTime: number      // 添加时间
  updateTime: number      // 最后阅读时间
  bookMark?: any[]        // 书签
  isCollection?: boolean  // 是否是合集
  current: number | string// 当前阅读索引
  toc: any
}

// 200 成功
// 404 未找到
// 500 失败
type Code = 200 | 404 | 500

export interface BookState {
  code: Code
  errror: string
  book: BookInfoType
}

export interface BookInfo {
  bookInfo: BookInfoType
  toc?: BookCatalogType[]
  content?: string
}

export interface BookCatalogType {
  id: string
  title: string
}

export interface EpubTocType {
  navLabel: { text: string }
  content: { src: string }
  class?: string
  playOrder: number
  navPoint?: EpubTocType[] | EpubTocType
  id: string
}

export type ThemeMode = "Light" | "Dark"

export interface ThemeType {
  color: {
    value: string,
    label: string
  },
  fontSize: {
    value: number,
    label: string
  },
  textColor: string,
  themeMode: {
    value: ThemeMode,
    label: string
  }
}
