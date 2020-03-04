import themesData from "./themesData";
import { themeType } from "./themesType";

const createTheme = name => {
  const theme = {}
  const themeChoosen = themeType[name]
  Object.keys(themesData).forEach(key => {
    theme[key] = themesData[key][themeChoosen]
  })
  return theme
}

export default createTheme