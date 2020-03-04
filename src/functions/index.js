import allShapes from "../shapes/allShapes";
import { random } from "lodash";

const createRandomShape = () => {
  const shapesName = Object.keys(allShapes)
  const randomShape = shapesName[random(shapesName.length - 1)]
  
  return {
    currentShape: randomShape,
    currentDirection:  random(Object.keys(allShapes[randomShape]).length - 1)
  }
}

export {
  createRandomShape
}