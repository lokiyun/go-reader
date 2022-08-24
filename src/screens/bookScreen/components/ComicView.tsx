import React, { useContext, useEffect, useRef, useState } from 'react';
import { BookContext } from '../../../store/BookProvider';
import { SettingContext } from '../../../store/SettingProvider';

type Ctx2D = CanvasRenderingContext2D

const ComicView = () => {
  const bookContext = useContext(BookContext)
  const canvasRef = useRef<HTMLCanvasElement>()

  useEffect(() => {
    bookContext.handleParseComic(canvasRef.current)
  }, [])
 
  return (
    <div className='comic-view'>
      <canvas width={bookContext.comicImageSize.width} height={bookContext.comicImageSize.height} ref={canvasRef}></canvas>
    </div>
  )
}

export default ComicView
