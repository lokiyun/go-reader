import React, { useContext } from 'react';
import { BookContext } from '../../../store/BookProvider';
import { SettingContext } from '../../../store/SettingProvider';

const TxtView = () => {
  const bookContext = useContext(BookContext)
  const settingContext = useContext(SettingContext)
  return (
    <div className='txt-view' style={{
      fontSize: settingContext.fontSize.value + 'px',
      // backgroundColor: settingContext.backgroundColor.value,
      color: settingContext.textColor
    }} >{bookContext.bookContent}</div>
  )
}

export default TxtView
