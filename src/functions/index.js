import allShapes from "../shapes/allShapes";
import { random, cloneDeep } from "lodash";
import { gameSettings } from '../constants'

const createRandomShape = () => {
  const shapesName = Object.keys(allShapes)
  const randomShape = shapesName[random(shapesName.length - 1)]
  
  return {
    currentShape: randomShape,
    currentDirection: random(Object.keys(allShapes[randomShape]).length - 1)
  }
}

const seperatorCell = data => {
  const newCellPosition = cloneDeep(data)
  const cellPositionWithoutShape = newCellPosition.filter(cell => !cell.userControl && !cell.isFalling)
  const cellPositionWithShape = newCellPosition.filter(cell => cell.userControl && cell.isFalling)

  return {
    cellPositionWithShape,
    cellPositionWithoutShape,
  }
}

const handleCollusion = (shape, allRestCell) => {
  const checkBottomCollisionShape = (currentShape, cell) => currentShape.filter(element => element.top + 1 === cell.top && element.left === cell.left).length > 0
  const checkLeftCollisionShape = (currentShape, cell) => currentShape.filter(element => element.top === cell.top && element.left - 1 === cell.left).length > 0
  const checkRightCollisionShape = (currentShape, cell) => currentShape.filter(element => element.top === cell.top && element.left + 1 === cell.left).length > 0

  const isBottomCollusionCell = allRestCell.filter(cell => checkBottomCollisionShape(shape, cell)).length > 0
  const isBottomCollusionGround = shape.filter(element => element.top + 1 === gameSettings.rows).length > 0
  const isBottomCollusion = isBottomCollusionCell || isBottomCollusionGround

  const isLeftCollusionCell = allRestCell.filter(cell => checkLeftCollisionShape(shape, cell)).length > 0
  const isLeftCollusionGround = shape.filter(element => element.left - 1 < 0).length > 0
  const isLeftCollusion = isLeftCollusionCell || isLeftCollusionGround

  const isRightCollusionCell = allRestCell.filter(cell => checkRightCollisionShape(shape, cell)).length > 0
  const isRightCollusionGround = shape.filter(element => element.left + 1 >= gameSettings.columns).length > 0
  const isRightCollusion = isRightCollusionCell || isRightCollusionGround

  const isOverlapsed = shape.filter(element =>
    element.left < 0 ||
    element.left >= gameSettings.columns ||
    element.top >= gameSettings.rows ||
    allRestCell.filter(cell => cell.left === element.left && cell.top === element.top).length > 0
  ).length > 0

  return {
    isBottomCollusion,
    isLeftCollusion,
    isRightCollusion,
    isOverlapsed
  }
}

const getShapeInfo = (shape) => {
  if (shape.length === 0) {
    return {}
  }
  let xMin = shape[0].left
  let yMin = shape[0].top
  let xMax = shape[0].left
  let yMax = shape[0].top
  shape.forEach(cell => {
    if (cell.left < xMin) xMin = cell.left;
    if (cell.top < yMin) yMin = cell.top;
    if (cell.left > xMax) xMax = cell.left;
    if (cell.top > yMax) yMax = cell.top
  })
  return { xMin, yMin, xMax, yMax, color: shape[0].color }
}

export default {
  createRandomShape,
  seperatorCell,
  handleCollusion,
  getShapeInfo
}