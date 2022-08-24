import React, { useContext, useState } from "react"
import * as ReactDOM from "react-dom"
import { CSSTransition } from "react-transition-group"
import ShelfScreen from "./screens/shelfScreen"
import { SettingProvider, BookProvider, ShelfProvider } from "./store"
import "./styles/index.scss"
import { HashRouter, Route } from "react-router-dom"
import BookScreen from "./screens/bookScreen"
import ContextMenu from "./components/contextMenu/ContextMenu"
import Loading from "./components/loading/Loading"
import { SettingContext } from "./store/SettingProvider"
// import "animate.css";

const App = () => {
  const settingContext = useContext(SettingContext)
  const [hash] = useState(window.location.hash)

  return (
    <SettingProvider>
      <ShelfProvider>
        <HashRouter>
          <Route path={"/"}>
            {hash === "#/" ? (
              <ShelfScreen />
            ) : (
              <BookProvider>
                <BookScreen />
              </BookProvider>
            )}
          </Route>
          <ContextMenu />
        </HashRouter>
      </ShelfProvider>
      <Loading />
    </SettingProvider>
  )
}

ReactDOM.render(<App />, document.getElementById("app"))

if (module.hot) {
  //实现热更新
  module.hot.accept()
}
