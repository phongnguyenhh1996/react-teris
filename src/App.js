import React, { useState, useEffect } from 'react';
import MainBoard from "./components/MainBoard";
import './App.css';
import Shapes from './shapes';
import { cloneDeep, random } from 'lodash';

const gameSettings = {
  cellSize: 25,
  columns: 16,
  rows: 24,
  fallSpeed: 500,
  fallStep: 0,
  controlSpeed: 60,
  fps: 60,
}
const shapes = Shapes(gameSettings)
const shapesData = [{
  name: 't',
  direction: 3
}]
const shapeOnControl = {
  isPrepareOnGround: false
}
const control = {
  left: false,
  right: false,
  rotate: false,
  down: false,
  controlSpeedStep: gameSettings.controlSpeed,
  currentDirection: random(shapesData[0].direction)
}

const initShape = shapes(shapesData[0].name, control.currentDirection)

function App() {
  const [cellPosition, setCellPosition] = useState(initShape)
  const [isShake, setShake] = useState(false)
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

    return {
      isBottomCollusion,
      isLeftCollusion,
      isRightCollusion
    }
  }

  const handleCellData = data => {
    const newCellPosition = cloneDeep(data)
    const cellPositionWithoutShape = newCellPosition.filter(cell => !cell.isFalling)
    const cellPositionWithShape = newCellPosition.filter(cell => cell.isFalling)
    const isShapeBottomCollusion = (currentCell) => cellPositionWithoutShape.filter(cell => cell.left === currentCell.left && currentCell.top + 1 === cell.top).length !== 0
    const isShapeLeftCollusion = (currentCell) => cellPositionWithoutShape.filter(cell => cell.top === currentCell.top && currentCell.left - 1 === cell.left).length !== 0
    const isShapeRightCollusion = (currentCell) => cellPositionWithoutShape.filter(cell => cell.top === currentCell.top && currentCell.left + 1 === cell.left).length !== 0
    const isShapeBottomTouched = cellPositionWithShape.filter(cell => cell.top + 1 === gameSettings.rows || isShapeBottomCollusion(cell)).length !== 0 
    const isShapeLeftTouched = cellPositionWithShape.filter(cell => cell.left === 0 || isShapeLeftCollusion(cell)).length !== 0
    const isShapeRightTouched = cellPositionWithShape.filter(cell => cell.left === gameSettings.columns - 1 || isShapeRightCollusion(cell)).length !== 0
    return {
      cellPositionWithShape,
      cellPositionWithoutShape,
      isShapeBottomTouched,
      isShapeLeftTouched,
      isShapeRightTouched
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

  const createShadowShape = (shape, allRestCell) => {
    // const { yMin, yMax } = getShapeInfo(allRestCell)
    const shapeInfo = getShapeInfo(shape)
    const allCellSameColumns = allRestCell.filter(cell => cell.left >= shapeInfo.xMin && cell.left <= shapeInfo.xMax)
    const allCellSameColumnsInfo = getShapeInfo(allCellSameColumns)
    if (!allCellSameColumnsInfo.yMin || !allCellSameColumnsInfo.yMax) {
      return shapes(shapesData[0].name, control.currentDirection, shapeInfo.xMin, gameSettings.rows - 1 - (shapeInfo.yMax - shapeInfo.yMin), shapeInfo.color)
    }
    let newShape = []
    
    for (let i = allCellSameColumnsInfo.yMin - (shapeInfo.yMax - shapeInfo.yMin + 1); i < allCellSameColumnsInfo.yMin + (shapeInfo.yMax - shapeInfo.yMin); i++) {
      const newTestShape = shapes(shapesData[0].name, control.currentDirection, shapeInfo.xMin, i, shapeInfo.color)
      
      const { isBottomCollusion } = handleCollusion(newTestShape, allCellSameColumns)
      
      if (isBottomCollusion) {
        newShape = newTestShape
        break
      }
      
    }
    return newShape
  }

  const [shadowShapePosition, setShadowShapePosition] = useState(createShadowShape(initShape, []))

  useEffect(() => {
    const cellFallHandle = setInterval(() => {
      let {
        cellPositionWithShape,
        cellPositionWithoutShape,
      } = seperatorCell(cellPosition)
      const { isBottomCollusion, isLeftCollusion, isRightCollusion } = handleCollusion(cellPositionWithShape, cellPositionWithoutShape)
      gameSettings.fallStep += gameSettings.fps
      if (!isBottomCollusion || (isBottomCollusion && !shapeOnControl.isPrepareOnGround)) {
        if (!isLeftCollusion && control.left && control.controlSpeedStep >= gameSettings.controlSpeed) {
          cellPositionWithShape = cellPositionWithShape.map(cell => ({...cell, left: cell.left - 1}))
          const shadowShape = createShadowShape(cellPositionWithShape, cellPositionWithoutShape)
          setShadowShapePosition(shadowShape)
          control.controlSpeedStep = 0
        }
        if (!isRightCollusion && control.right && control.controlSpeedStep >= gameSettings.controlSpeed) {
          cellPositionWithShape = cellPositionWithShape.map(cell => ({...cell, left: cell.left + 1}))
          const shadowShape = createShadowShape(cellPositionWithShape, cellPositionWithoutShape)
          setShadowShapePosition(shadowShape)
          control.controlSpeedStep = 0
        }
      }
      if (gameSettings.fallStep >= gameSettings.fallSpeed) {
        gameSettings.fallStep = 0
        if (isBottomCollusion) {
          if (!shapeOnControl.isPrepareOnGround) {
            shapeOnControl.isPrepareOnGround = true
          } else {
            cellPositionWithShape = cellPositionWithShape.map(cell => ({...cell,  isFalling: false, userControl: false}))
            control.currentDirection = random(shapesData[0].direction)
            const newShape = shapes(shapesData[0].name, control.currentDirection)
            const shadowShape = createShadowShape(newShape, [...cellPositionWithoutShape, ...cellPositionWithShape])
            cellPositionWithShape.push(...newShape)
            setShadowShapePosition(shadowShape)
            shapeOnControl.isPrepareOnGround = false
          }
        } else {
          cellPositionWithShape = cellPositionWithShape.map(cell => ({...cell, isFalling: true, top: cell.top + 1}))
          shapeOnControl.isPrepareOnGround = false
        }
      }
      if (control.down) {
        cellPositionWithShape = shadowShapePosition.map(cell => ({...cell, isFalling: false, userControl: false}))
        control.currentDirection = random(shapesData[0].direction)
        const newShape = shapes(shapesData[0].name, control.currentDirection)
        const shadowShape = createShadowShape(newShape, [...cellPositionWithoutShape, ...cellPositionWithShape])
        cellPositionWithShape.push(...newShape)
        setShadowShapePosition(shadowShape)
        setShake('true')
        control.down = false
      }
      // if (control.rotate && control.controlSpeedStep >= gameSettings.controlSpeed) {
      //   control.controlSpeedStep = 0
      //   const newDirection = (control.currentDirection + 1) % (shapesData[0].direction + 1)
      //   const checkAndCreateShapeWithDir = (newCellPosition) => {
      //     let {
      //       cellPositionWithShape,
      //       isShapeBottomTouched,
      //       isShapeLeftTouched,
      //       isShapeRightTouched
      //     } = handleCellData(newCellPosition)
      //     if (!isShapeBottomTouched && !isShapeLeftTouched && !isShapeRightTouched) {
      //       return cellPositionWithShape
      //     } 
      //     return null
      //   }
      //   const {x, y, color} = getShapeInfo(cellPositionWithShape)
      //   const newCellPositionWithShape = checkAndCreateShapeWithDir([...cellPositionWithoutShape, ...shapes(shapesData[0].name, newDirection, x, y, color)])
      //   if (newCellPositionWithShape !== null) {
      //     control.currentDirection = newDirection
      //     cellPositionWithShape = newCellPositionWithShape
      //   }
      // }
      setCellPosition([...cellPositionWithoutShape, ...cellPositionWithShape])
    }, gameSettings.fps);
    return () => {
      clearInterval(cellFallHandle)
    };
  }, [cellPosition])

  const handleKeyDown = (e) => {
    switch (e.keyCode) {
      case 37:
        control.left = true
        control.controlSpeedStep += gameSettings.fps
        break;
      case 39:
        control.right = true
        control.controlSpeedStep += gameSettings.fps
        break;
      case 38:
        control.rotate = true
        control.controlSpeedStep += gameSettings.fps
        break;
      case 40:
        control.down = true
        break;
      default:
        break;
    }
  }

  const handleKeyUp = (e) => {
    switch (e.keyCode) {
      case 37:
        control.left = false
        control.controlSpeedStep = gameSettings.controlSpeed
        break;
      case 39:
        control.right = false
        control.controlSpeedStep = gameSettings.controlSpeed
        break;
      case 38:
        control.rotate = false
        control.controlSpeedStep += gameSettings.controlSpeed
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)
    }
  }, [])
  
  return (
    <div className="App">
      <h1>TERIS</h1>
      <MainBoard gameSettings={gameSettings} cellsPosition={cellPosition} shadowShapePosition={shadowShapePosition} isShake={isShake} setShake={setShake} />
    </div>
  );
}

export default App;
