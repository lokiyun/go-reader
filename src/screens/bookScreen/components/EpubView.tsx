import React, { useEffect } from 'react';

const EpubView = () => {
  
  const handleClick = () => {
    console.log('123456');
    
  }

  return (
    <div id="reader-area" onClick={handleClick}></div>

  )
}

export default EpubView
