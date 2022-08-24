import { useEffect, RefObject } from "react";

export function useClickOutside(refObject: RefObject<HTMLElement> | RefObject<HTMLElement>[], callback: () => void) {
  const handleClickOutside = (e: MouseEvent) => {
    if (refObject instanceof Array) {
      let isContains = []
      refObject.forEach(item => {
        if (!(item?.current?.contains(e.target as Node))) {
          isContains.push(1)
        } else {
          isContains.push(0)
        }
      })
      if (!(isContains.find(item => item === 0) === 0)) {
        callback()
      }
    } else if (!(refObject?.current?.contains(e.target as Node))) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });
}
