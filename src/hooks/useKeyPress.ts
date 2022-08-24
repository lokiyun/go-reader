import { useCallback, useEffect, useState } from "react"

const useKeyPress = (targetKeyCode: number) => {
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
    document.addEventListener("keydown", keyDownHandler)
    document.addEventListener("keyup", keyUpHandler)
    return () => {
      document.removeEventListener("keydown", keyDownHandler)
      document.removeEventListener("keyup", keyUpHandler)
    }
  }, [])

  return keyDowned
}

export default useKeyPress
