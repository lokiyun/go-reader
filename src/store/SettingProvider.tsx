import React, { createContext, useEffect, useState } from "react";
import { SettingType, ShelfType, TextColor, ThemeMode, ThemeSettings, ThemeType } from "../schema-types";

export interface SelectOptionTypeWithString {
  value: string,
  label: string
}

export interface SelectOptionTypeWithNumber {
  value: number,
  label: string
}

export interface SelectOptionTypeWithThemeSetting {
  value: ThemeSettings,
  label: string
} 

const fontSizeoptions = [
  {
    value: 16,
    label: '小号',
  },
  {
    value: 20,
    label: '中号',
  }, {
    value: 24,
    label: '大号',
  }
]


export const ColorOptions = [
  {
    value: '#E6FAFF',
    label: '底色',
  },
  {
    value: '#E6FAE4',
    label: '绿色',
  },
  {
    value: '#E3E8F7',
    label: '淡蓝色'
  }
]

const DarkColor = {
  value: '#2d3436',
  label: '深色'
}

export const ThemeOptions: Array<{
  value: ThemeSettings,
  label: string
}> = [
    {
      value: ThemeSettings.Light,
      label: '浅色',
    },
    {
      value: ThemeSettings.Dark,
      label: '深色',
    },
  ]

interface SettingContextType {
  shelfType: ShelfType,
  loadingVisible: boolean,
  footerVisible: boolean,
  theme: SelectOptionTypeWithThemeSetting,
  fontSize: SelectOptionTypeWithNumber,
  textColor: TextColor,
  backgroundColor: SelectOptionTypeWithString,
  handleChangeShelfType?: (shelfType: ShelfType) => void
  handleChangeLoadingVisible?: (visible: boolean) => void
  handleChangeFooterVisible?: (visible: boolean) => void
  handleChangeTheme?: (theme?: SelectOptionTypeWithThemeSetting) => void
  handleChangeFontSize?: (fontSize: SelectOptionTypeWithNumber) => void
  handleChangeTextColor?: (textColor: TextColor) => void
  handleChangeBackground?: (background:  SelectOptionTypeWithString) => void
}

export const SettingContext = createContext<SettingContextType>({
  shelfType: 'ebook',
  loadingVisible: false,
  fontSize: fontSizeoptions[0],
  textColor: "#000000",
  backgroundColor: ColorOptions[0],
  theme: ThemeOptions[0],
  footerVisible: false,
})

const SettingProvider = ({ children }: any) => {
  const [shelfType, setShelfType] = useState<ShelfType>('ebook' as ShelfType)
  const [loadingVisible, setLoadingVisible] = useState(false)
  const [footerVisible, setFooterVisible] = useState(false)
  // 字体大小
  const [fontSize, setFontSize] = useState<{
    value: number,
    label: string
  }>(fontSizeoptions[0])

  // 字体颜色
  const [textColor, setTextColor] = useState<TextColor>("#000000")

  // 背景颜色
  const [backgroundColor, setBackgroundColor] = useState<{
    value: string,
    label: string
  }>(ColorOptions[0])

  // 主题

  const [theme, setTheme] = useState<SelectOptionTypeWithThemeSetting>(ThemeOptions[0])


  useEffect(() => {
    const newTheme = window.settings.getTheme()
    console.log(newTheme);
    
    if (newTheme === ThemeSettings.Default || newTheme === ThemeSettings.Light) {
      setTheme(ThemeOptions[0])
    } else if (newTheme === ThemeSettings.Dark) {
      setTheme(ThemeOptions[1])
      setBackgroundColor(DarkColor)
      setTextColor("#dfe6e9")
    }

  }, [])

  const handleChangeFooterVisible = (visible: boolean) => {
    setFooterVisible(visible)
  }

  const handleChangeShelfType = (shelfType: ShelfType) => {
    setShelfType(shelfType)
    localStorage.setItem('shelf-type', shelfType)
  }

  const handleChangeLoadingVisible = (visible: boolean) => {
    setLoadingVisible(visible)
  }

  const handleChangeTheme = (newTheme: SelectOptionTypeWithThemeSetting) => {
    if (newTheme.value !== theme.value) {
      if (newTheme.value === ThemeSettings.Dark) {
        setTextColor("#dfe6e9")
        setBackgroundColor(DarkColor)
      } else {
        setTextColor("#000000")
        setBackgroundColor(ColorOptions[0])
      }
    }
    window.settings.setTheme(newTheme.value)
    setTheme(newTheme)
    // if (newTheme.themeMode !== theme.themeMode) {
    //   if (newTheme.themeMode.value === "Dark") {
    //     newTheme.textColor = "#ffffff"
    //     newTheme.color = DarkColor
    //   } else {
    //     newTheme.textColor = "#000000"
    //     newTheme.color = ColorOptions[0]
    //   }
    // }
    // setTheme(newTheme)
  }

  const handleChangeFontSize = (fontSize: SelectOptionTypeWithNumber) => {
    setFontSize(fontSize)
  }

  const handleChangeTextColor = (textColor: TextColor) => {
    if (theme.value === ThemeSettings.Dark) return
    setTextColor(textColor)
  }

  const handleChangeBackground = (background: SelectOptionTypeWithString) => {
    if (theme.value === ThemeSettings.Dark) return
    setBackgroundColor(background)
  }

  return (
    <SettingContext.Provider value={{
      shelfType,
      loadingVisible,
      footerVisible,
      theme,
      fontSize,
      textColor,
      backgroundColor,
      handleChangeShelfType,
      handleChangeLoadingVisible,
      handleChangeTheme,
      handleChangeFontSize,
      handleChangeTextColor,
      handleChangeBackground,
      handleChangeFooterVisible
    }}>
      {children}
    </SettingContext.Provider>
  )
}

export default SettingProvider
