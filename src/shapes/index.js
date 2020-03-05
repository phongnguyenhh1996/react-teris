import { uniqueId } from "lodash";
import shapes from "./allShapes";
import { gameSettings } from "../constants";

const colorArr = ["#A848E3", "#E4E250", "#F6A8DE", "#ABE124", "#D04D41", "#F20B35", "#2ED8DB", "#1708EF", "#F6847E", "#FCB01E", "#39FBBD", "#6FFA14"]

const generateShape = (shapeName, direction, x0 = gameSettings.columns/2-1, y0 = 0, customColor, isRotate = false) => {
  const color = colorArr[Math.round(Math.random() * (colorArr.length - 1))]
  const shape = shapes[shapeName]
  const shapeCurrentDirection = shape[direction]
  const shapeCurrentDirectionCenterPosition = shapeCurrentDirection.center
  const lastDirectionIndex = (direction - 1) >= 0 ? (direction - 1) : Object.keys(shape).length - 1
  
  const shapeLastDirection = shape[lastDirectionIndex]
  const shapeLastDirectionCenterPosition = shapeLastDirection.center
  let xPlus = 0, yPlus = 0
  if (isRotate) {
    xPlus = shapeLastDirectionCenterPosition[0] - shapeCurrentDirectionCenterPosition[0]
    yPlus = shapeLastDirectionCenterPosition[1] - shapeCurrentDirectionCenterPosition[1]
  }
  const { matrix } = shapeCurrentDirection
  const data = []
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      if (cell === 1) {
        data.push({
          top: y0 + i + xPlus,
          left: x0 + j + yPlus,
          isFalling: true,
          userControl: true,
          direction,
          color: customColor || color,
          id: uniqueId(uniqueId('shape-') + '-')
        })
      }
    }
  }
  return data
}

export default generateShape