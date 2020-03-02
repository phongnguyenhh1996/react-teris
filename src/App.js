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

  const createShadowShape = (shape, allRestCell) => {
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

  const calculatePointAndCellsPosition = (cellPosition, shape = []) => {
    const rows = {}
    const scoreRows = []
    let newCellPosition = [...cellPosition, ...shape]
    newCellPosition.forEach(cell => {
      if (!rows[cell.top]) {
        rows[cell.top] = 1
      } else {
        rows[cell.top] += 1
      }
    })
    Object.keys(rows).forEach(row => {
      if (rows[row] === gameSettings.columns) {
        scoreRows.push(row)
      }
    })
    if (scoreRows.length > 0) {
      newCellPosition = newCellPosition.filter(cell => !scoreRows.includes(cell.top.toString()))
      newCellPosition = newCellPosition.map(cell => ({...cell, isFalling: true}))
      console.log(newCellPosition);
    }
    if (newCellPosition.length !== [...cellPosition, ...shape].length) {
      return newCellPosition
    } else {
      return [...cellPosition]
    }
  }

  useEffect(() => {
    const cellFallHandle = setInterval(() => {
      let {
        cellPositionWithShape,
        cellPositionWithoutShape,
      } = seperatorCell(cellPosition)
      const { isBottomCollusion, isLeftCollusion, isRightCollusion } = handleCollusion(cellPositionWithShape, cellPositionWithoutShape)

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
      gameSettings.fallStep += gameSettings.fps
      if (gameSettings.fallStep >= gameSettings.fallSpeed) {
        gameSettings.fallStep = 0
      
        if (isBottomCollusion) {
          if (!shapeOnControl.isPrepareOnGround) {
            shapeOnControl.isPrepareOnGround = true
          } else {
            cellPositionWithShape = cellPositionWithShape.map(cell => ({...cell,  isFalling: false, userControl: false}))
            cellPositionWithoutShape = calculatePointAndCellsPosition(cellPositionWithoutShape, cellPositionWithShape)
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
        setShake(true)
        cellPositionWithoutShape = calculatePointAndCellsPosition(cellPositionWithoutShape, cellPositionWithShape)
        control.down = false
      }
      if (control.rotate && control.controlSpeedStep >= gameSettings.controlSpeed) {
        control.controlSpeedStep = 0
        const newDirection = (control.currentDirection + 1) % (shapesData[0].direction + 1)
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
        const {xMin, yMin, color} = getShapeInfo(cellPositionWithShape)
        
        const newCellPositionWithShape = checkAndCreateShapeWithDir([...cellPositionWithoutShape, ...shapes(shapesData[0].name, newDirection, xMin, yMin, color, true)])
        
        if (newCellPositionWithShape !== null) {
          control.currentDirection = newDirection
          cellPositionWithShape = newCellPositionWithShape
          const shadowShape = createShadowShape(cellPositionWithShape, cellPositionWithoutShape)
          setShadowShapePosition(shadowShape)
        }
      }
      
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
