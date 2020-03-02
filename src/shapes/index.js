import { uniqueId } from "lodash";
const colorArr = ["#A848E3", "#E4E250", "#F6A8DE", "#ABE124", "#D04D41", "#F20B35", "#2ED8DB", "#1708EF", "#F6847E", "#FCB01E", "#39FBBD", "#6FFA14"]

const shapes = {
  't': {
    0: [
      [1, 1, 1],
      [0, 1, 0]
    ],
    1: [
      [0, 1],
      [1, 1],
      [0, 1]
    ],
    2: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    3: [
      [1, 0],
      [1, 1],
      [1, 0]
    ]
  }
}

const generateShape = (shapeName, direction, x0, y0, customColor) => {
  const color = colorArr[Math.round(Math.random() * (colorArr.length - 1))]
  const matrix = shapes[shapeName][direction]
  const data = []
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      if (cell === 1) {
        data.push({
          top: y0 + i,
          left: x0  + j,
          isFalling: true,
          userControl: true,
          color: customColor || color,
          id: uniqueId('shadow-')
        })
      }
    }
  }
  return data
}

export default function(gameSettings) {
  return (shapeName, direction, x0 = gameSettings.columns/2-1, y0 = 0, customColor) => generateShape(shapeName, direction, x0, y0, customColor)
}