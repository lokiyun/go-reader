import { app } from 'electron'

export const appCachePath = app.getPath("userData")

export const appCachePathData = `${appCachePath}\\data`

export const appCachePathDataCatalog = `${appCachePathData}\\catalog`

export const appCachePathDataArticle = `${appCachePathData}\\articles`

export const appCachePathDataEpubCache = `${appCachePathData}\\epubCache`

export const appCachePathDataComicCache = `${appCachePathData}\\comicCache`


const bookTypeList = [
  'get-all-list',
  'get-txt-list',
  'get-epub-list',
  'get-comic-list'
]
