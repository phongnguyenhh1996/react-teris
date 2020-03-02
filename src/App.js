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
  bonusTimeControlStep: 0 
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

function App() {
  const [cellPosition, setCellPosition] = useState(shapes(shapesData[0].name, control.currentDirection))
  
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
    const isBottomCollusionCell = allRestCell.filter(cell => checkBottomCollisionShape(shape, cell)).length > 0
    const isBottomCollusionGround = shape.filter(element => element.top + 1 === gameSettings.rows).length > 0
    console.log(isBottomCollusionCell, isBottomCollusionGround);
    
    return {
      isBottomCollusion: isBottomCollusionCell || isBottomCollusionGround
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
    let x = shape[0].left
    let y = shape[0].top
    shape.forEach(cell => {
      if (cell.left < x) x = cell.left;
      if (cell.top < y) y = cell.top;
    })
    return { x, y, color: shape[0].color }
  }

  useEffect(() => {
    const cellFallHandle = setInterval(() => {
      let {
        cellPositionWithShape,
        cellPositionWithoutShape,
      } = seperatorCell(cellPosition)
      const { isBottomCollusion } = handleCollusion(cellPositionWithShape, cellPositionWithoutShape)
      gameSettings.fallStep += gameSettings.fps
      if (!isBottomCollusion || (isBottomCollusion && !shapeOnControl.isPrepareOnGround)) {
        if (control.left && control.controlSpeedStep >= gameSettings.controlSpeed) {
          cellPositionWithShape = cellPositionWithShape.map(cell => ({...cell, left: cell.left - 1}))
          control.controlSpeedStep = 0
        }
        if (control.right && control.controlSpeedStep >= gameSettings.controlSpeed) {
          cellPositionWithShape = cellPositionWithShape.map(cell => ({...cell, left: cell.left + 1}))
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
            cellPositionWithShape.push(...shapes(shapesData[0].name, control.currentDirection))
            shapeOnControl.isPrepareOnGround = false
          }
        } else {
          cellPositionWithShape = cellPositionWithShape.map(cell => ({...cell, isFalling: true, top: cell.top + 1}))
          shapeOnControl.isPrepareOnGround = false
        }
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
    console.log(e.keyCode);
    
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
      <MainBoard gameSettings={gameSettings} cellsPosition={cellPosition} />
    </div>
  );
}

export default App;
