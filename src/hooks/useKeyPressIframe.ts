import { useCallback, useEffect, useState } from "react"

const useKeyPressIframe = (iframe: HTMLIFrameElement, targetKeyCode: number) => {
  const [keyDowned, setKeyDowned] = useState(false)

  const keyDownHandler = useCallback((e: KeyboardEvent) => {
    if (e.keyCode === targetKeyCode) {
      setKeyDowned(true)
    }
  }, [])

  const keyUpHandler = useCallback((e: KeyboardEvent) => {
    if (e.keyCode === targetKeyCode) {
      setKeyDowned(false)
    }
  }, [])

  useEffect(() => {
    iframe.addEventListener("keydown", keyDownHandler)
    iframe.addEventListener("keyup", keyUpHandler)
    return () => {
      iframe.removeEventListener("keydown", keyDownHandler)
      iframe.removeEventListener("keyup", keyUpHandler)
    }
  }, [])

  return keyDowned
}

export default useKeyPressIframe
