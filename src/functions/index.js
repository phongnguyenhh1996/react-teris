import allShapes from "../shapes/allShapes";
import { random, cloneDeep, keyBy } from "lodash";
import { gameSettings } from '../constants'
import generateShape from "../shapes";

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

const createShadowShape = (shape, allRestCell, shapeOnControl) => {
  const shapeInfo = getShapeInfo(shape)
  const allCellSameColumns = allRestCell.filter(cell => cell.left >= shapeInfo.xMin && cell.left <= shapeInfo.xMax)
  const allCellSameColumnsInfo = getShapeInfo(allCellSameColumns)
  if (!allCellSameColumnsInfo.yMin || !allCellSameColumnsInfo.yMax) {
    return generateShape(shapeOnControl.currentShape, shapeOnControl.currentDirection, shapeInfo.xMin, gameSettings.rows - 1 - (shapeInfo.yMax - shapeInfo.yMin), shapeInfo.color)
  }
  let newShape = []
  
  for (let i = allCellSameColumnsInfo.yMin - (shapeInfo.yMax - shapeInfo.yMin + 1); i < allCellSameColumnsInfo.yMin + (shapeInfo.yMax - shapeInfo.yMin); i++) {
    const newTestShape = generateShape(shapeOnControl.currentShape, shapeOnControl.currentDirection, shapeInfo.xMin, i, shapeInfo.color)
    
    const { isBottomCollusion } = handleCollusion(newTestShape, allCellSameColumns)
    
    if (isBottomCollusion) {
      newShape = newTestShape
      break
    }
    
  }
  return newShape
}

const handleFallingCell = (cells) => {
  const destroyRows = Object.keys(keyBy(cells.filter(cell => cell.isDestroying), o => o.top)).reverse()
  cells = cells.filter(cell => !cell.isDestroying)
  const newDataWithoutFallingCell = []
  
  for (let i = gameSettings.rows - 1; i > 0; i--) {
    const rowCells = cells.filter(cell => cell.top === i)
    if (rowCells.length === 0) {
      continue
    }
    const stepFalling = destroyRows.filter(index => i < index).length
    const newRowCells = rowCells.map(cell => ({...cell, top: cell.top + stepFalling}))
    newDataWithoutFallingCell.push(...newRowCells)
  }
  return newDataWithoutFallingCell
}

const calculatePointAndCellsPosition = (cellPosition, shape = []) => {
  const rows = {}
  const scoreRows = []
  const { cellPositionWithShape, cellPositionWithoutShape } = seperatorCell([...cellPosition, ...shape])
  let newCellPositionWithoutShape = [...cellPositionWithoutShape]
  newCellPositionWithoutShape.forEach(cell => {
    if (!rows[cell.top]) {
      rows[cell.top] = 1
    } else {
      rows[cell.top] += 1
    }
  })
  Object.keys(rows).forEach(row => {
    if (rows[row] === gameSettings.columns) {
      scoreRows.push(parseInt(row))
    }
  })
  if (scoreRows.length > 0) {
    newCellPositionWithoutShape = newCellPositionWithoutShape.map(cell => ({...cell, isDestroying: scoreRows.includes(cell.top)}))
  } else {
    return [...cellPositionWithoutShape, ...cellPositionWithShape]
  }
  return [...newCellPositionWithoutShape, ...cellPositionWithShape]
}

const handleControlLeftRight = (shapeCollusion, shapeOnControl, control, cellPosition, setShadowShapePosition) => {
  if (!shapeCollusion.isBottomCollusion || (shapeCollusion.isBottomCollusion && !shapeOnControl.isPrepareOnGround)) {
    if (!shapeCollusion.isLeftCollusion && control.left && control.controlSpeedStep >= gameSettings.controlSpeed) {
      cellPosition.cellPositionWithShape = cellPosition.cellPositionWithShape.map(cell => ({...cell, left: cell.left - 1}))
      const shadowShape = createShadowShape(cellPosition.cellPositionWithShape, cellPosition.cellPositionWithoutShape, shapeOnControl)
      setShadowShapePosition(shadowShape)
      control.controlSpeedStep = 0
    }
    if (!shapeCollusion.isRightCollusion && control.right && control.controlSpeedStep >= gameSettings.controlSpeed) {
      cellPosition.cellPositionWithShape = cellPosition.cellPositionWithShape.map(cell => ({...cell, left: cell.left + 1}))
      const shadowShape = createShadowShape(cellPosition.cellPositionWithShape, cellPosition.cellPositionWithoutShape, shapeOnControl)
      setShadowShapePosition(shadowShape)
      control.controlSpeedStep = 0
    }
  }
}

const handleControlDown = (cellPosition, shadowShapePosition, control, gameState, shapeOnControl, setShadowShapePosition, setShake) => {
  if (control.down) {
    gameState.isCaculatePoint = true
    const newCellPositionWithShape = shadowShapePosition.map((cell, index) => ({...cell, isFalling: false, userControl: false, id: cellPosition.cellPositionWithShape[index].id}))
    cellPosition.cellPositionWithShape = newCellPositionWithShape
    const newRandomShape = createRandomShape()
    shapeOnControl.currentShape = newRandomShape.currentShape
    shapeOnControl.currentDirection = newRandomShape.currentDirection
    const newShape = generateShape(shapeOnControl.currentShape, shapeOnControl.currentDirection)
    const shadowShape = createShadowShape(newShape, [...cellPosition.cellPositionWithoutShape, ...cellPosition.cellPositionWithShape], shapeOnControl)
    cellPosition.cellPositionWithShape.push(...newShape)
    setShadowShapePosition(shadowShape)
    setShake(true)
    control.down = false
  }
}

const handleControlRotate = (cellPosition ,control, shapeOnControl, setShadowShapePosition) => {
  if (control.rotate && control.controlSpeedStep >= gameSettings.controlSpeed) {
    control.controlSpeedStep = 0
    const newDirection = (shapeOnControl.currentDirection + 1) % (Object.keys(allShapes[shapeOnControl.currentShape]).length)
    
    const checkAndCreateShapeWithDir = (newCellPosition) => {
      const { cellPositionWithShape, cellPositionWithoutShape } = seperatorCell(newCellPosition)
      const {
        isOverlapsed
      } = handleCollusion(cellPositionWithShape, cellPositionWithoutShape)
      if (!isOverlapsed) {
        return cellPositionWithShape
      } 
      return null
    }
    const {xMin, yMin, color} = getShapeInfo(cellPosition.cellPositionWithShape)
    
    const newCellPositionWithShape = checkAndCreateShapeWithDir([...cellPosition.cellPositionWithoutShape, ...generateShape(shapeOnControl.currentShape, newDirection, xMin, yMin, color, true)])
    
    if (newCellPositionWithShape !== null) {
      shapeOnControl.currentDirection = newDirection
      cellPosition.cellPositionWithShape = newCellPositionWithShape
      const shadowShape = createShadowShape(cellPosition.cellPositionWithShape, cellPosition.cellPositionWithoutShape, shapeOnControl)
      setShadowShapePosition(shadowShape)
    }
  }
}

const handleDestroyCell = (cellPosition, gameState, shapeOnControl, setShadowShapePosition, setCellPosition) => {
  const destroyingCells = cellPosition.cellPositionWithoutShape.filter(cell => cell.isDestroying)
  const isHaveDestroyingCells = destroyingCells.length > 0
  if (isHaveDestroyingCells) {
    if (gameState.delayStep >= gameSettings.delayTime) {
      cellPosition.cellPositionWithoutShape = handleFallingCell(cellPosition.cellPositionWithoutShape)
      const shadowShape = createShadowShape(cellPosition.cellPositionWithShape, cellPosition.cellPositionWithoutShape, shapeOnControl)
      setShadowShapePosition(shadowShape)
      let newCellPosition = [...cellPosition.cellPositionWithoutShape, ...cellPosition.cellPositionWithShape]
      gameState.delayStep = 0
      return setCellPosition(newCellPosition)
    } else {
      gameState.delayStep += gameSettings.fps
    }
  }
}

const handleFallingShape = (cellPosition ,gameState, shapeCollusion, shapeOnControl, setShadowShapePosition) => {
  gameState.fallStep += gameSettings.fps
  if (gameState.fallStep >= gameSettings.fallSpeed) {
    gameState.fallStep = 0

    if (shapeCollusion.isBottomCollusion) {
      if (!shapeOnControl.isPrepareOnGround) {
        shapeOnControl.isPrepareOnGround = true
      } else {
        gameState.isCaculatePoint = true
        cellPosition.cellPositionWithShape = cellPosition.cellPositionWithShape.map(cell => ({...cell,  isFalling: false, userControl: false}))
        const newRandomShape = createRandomShape()
        shapeOnControl.currentShape = newRandomShape.currentShape
        shapeOnControl.currentDirection = newRandomShape.currentDirection
        const newShape = generateShape(shapeOnControl.currentShape, shapeOnControl.currentDirection)
        const shadowShape = createShadowShape(newShape, [...cellPosition.cellPositionWithoutShape, ...cellPosition.cellPositionWithShape], shapeOnControl)
        cellPosition.cellPositionWithShape.push(...newShape)
        setShadowShapePosition(shadowShape)
        shapeOnControl.isPrepareOnGround = false
      }
    } else {
      cellPosition.cellPositionWithShape = cellPosition.cellPositionWithShape.map(cell => ({...cell, isFalling: true, top: cell.top + 1}))
      shapeOnControl.isPrepareOnGround = false
    }
  }
}

export default {
  createRandomShape,
  seperatorCell,
  handleCollusion,
  getShapeInfo,
  createShadowShape,
  handleFallingCell,
  calculatePointAndCellsPosition,
  handleControlLeftRight,
  handleControlDown,
  handleControlRotate,
  handleDestroyCell,
  handleFallingShape
}