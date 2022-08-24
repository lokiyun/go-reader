import classNames from "classnames"
import React, { useContext } from "react"
import { CSSTransition } from "react-transition-group"
import { SettingContext } from "../../store/SettingProvider"
import "./loading.style.scss"

const Loading = () => {
  const settingContext = useContext(SettingContext)

  return (
    <CSSTransition
      in={settingContext.loadingVisible}
      timeout={0}
      classNames="my-loading"
      unmountOnExit>
      <div className="loading-container">
        <div className="loading">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </CSSTransition>

  )
}

export default Loading
