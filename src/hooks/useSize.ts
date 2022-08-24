import React, { useCallback, useState, useEffect } from "react"
import { useThrottle } from "./useThrottle"

export function useResize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    hieght: window.innerHeight,
  })

  const onResize = useCallback(() => {
    setSize({
      width: window.innerWidth,
      hieght: window.innerHeight,
    })
  }, [])

  const resizeThrottle = useThrottle(onResize, 1000)

  useEffect(() => {
    window.addEventListener("resize", resizeThrottle)
    return () => {
      window.removeEventListener("resize", resizeThrottle)
    }
  }, [])

  return size
}
