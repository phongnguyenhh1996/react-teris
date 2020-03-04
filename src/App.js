import React, { useState, useEffect } from 'react';
import MainBoard from "./components/MainBoard";
import './App.css';
import Shapes from './shapes';
import { cloneDeep, random, keyBy } from 'lodash';
import allShapes from "./shapes/allShapes";
import { Container, ButtonGroup, Button } from 'reactstrap';
import { ThemeProvider } from "styled-components";
import createTheme from './themes';
import { themeTypeName } from './themes/themesType';
import { MainWrapper, MainHeading } from './components/ElementsStyled';

const gameSettings = {
  cellSize: 25,
  columns: 16,
  rows: 24,
  fallSpeed: 500,
  fallStep: 0,
  controlSpeed: 60,
  fps: 60,
  isCaculatePoint: false,
  delayStep: 0,
  delayTime: 50
}
const shapes = Shapes(gameSettings)
const shapesName = Object.keys(allShapes)
const createRandomShape = () => {
  const randomShape = shapesName[random(shapesName.length - 1)]
  
  return {
    currentShape: randomShape,
    currentDirection:  random(Object.keys(allShapes[randomShape]).length - 1)
  }
}
const shapeOnControl = {
  isPrepareOnGround: false,
  ...createRandomShape()
}
const control = {
  left: false,
  right: false,
  rotate: false,
  down: false,
  controlSpeedStep: gameSettings.controlSpeed
}

const initShape = shapes(shapeOnControl.currentShape, shapeOnControl.currentDirection)

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
      return shapes(shapeOnControl.currentShape, shapeOnControl.currentDirection, shapeInfo.xMin, gameSettings.rows - 1 - (shapeInfo.yMax - shapeInfo.yMin), shapeInfo.color)
    }
    let newShape = []
    
    for (let i = allCellSameColumnsInfo.yMin - (shapeInfo.yMax - shapeInfo.yMin + 1); i < allCellSameColumnsInfo.yMin + (shapeInfo.yMax - shapeInfo.yMin); i++) {
      const newTestShape = shapes(shapeOnControl.currentShape, shapeOnControl.currentDirection, shapeInfo.xMin, i, shapeInfo.color)
      
      const { isBottomCollusion } = handleCollusion(newTestShape, allCellSameColumns)
      
      if (isBottomCollusion) {
        newShape = newTestShape
        break
      }
      
    }
    return newShape
  }

  const [shadowShapePosition, setShadowShapePosition] = useState(createShadowShape(initShape, []))

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

  useEffect(() => {
    const cellFallHandle = setInterval(() => {
      let {
        cellPositionWithShape,
        cellPositionWithoutShape,
      } = seperatorCell(cellPosition)

      const destroyingCells = cellPositionWithoutShape.filter(cell => cell.isDestroying)
      const isHaveDestroyingCells = destroyingCells.length > 0
      if (isHaveDestroyingCells) {
        if (gameSettings.delayStep >= gameSettings.delayTime) {
          cellPositionWithoutShape = handleFallingCell(cellPositionWithoutShape)
          let newCellPosition = [...cellPositionWithoutShape, ...cellPositionWithShape]
          gameSettings.delayStep = 0
          return setCellPosition(newCellPosition)
        } else {
          gameSettings.delayStep += gameSettings.fps
        }
      }
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
            gameSettings.isCaculatePoint = true
            cellPositionWithShape = cellPositionWithShape.map(cell => ({...cell,  isFalling: false, userControl: false}))
            const newRandomShape = createRandomShape()
            shapeOnControl.currentShape = newRandomShape.currentShape
            shapeOnControl.currentDirection = newRandomShape.currentDirection
            const newShape = shapes(shapeOnControl.currentShape, shapeOnControl.currentDirection)
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
        gameSettings.isCaculatePoint = true
        const newCellPositionWithShape = shadowShapePosition.map((cell, index) => ({...cell, isFalling: false, userControl: false, id: cellPositionWithShape[index].id}))
        cellPositionWithShape = newCellPositionWithShape
        const newRandomShape = createRandomShape()
        shapeOnControl.currentShape = newRandomShape.currentShape
        shapeOnControl.currentDirection = newRandomShape.currentDirection
        const newShape = shapes(shapeOnControl.currentShape, shapeOnControl.currentDirection)
        const shadowShape = createShadowShape(newShape, [...cellPositionWithoutShape, ...cellPositionWithShape])
        cellPositionWithShape.push(...newShape)
        setShadowShapePosition(shadowShape)
        setShake(true)
        control.down = false
      }
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
        const {xMin, yMin, color} = getShapeInfo(cellPositionWithShape)
        
        const newCellPositionWithShape = checkAndCreateShapeWithDir([...cellPositionWithoutShape, ...shapes(shapeOnControl.currentShape, newDirection, xMin, yMin, color, true)])
        
        if (newCellPositionWithShape !== null) {
          shapeOnControl.currentDirection = newDirection
          cellPositionWithShape = newCellPositionWithShape
          const shadowShape = createShadowShape(cellPositionWithShape, cellPositionWithoutShape)
          setShadowShapePosition(shadowShape)
        }
      }
      
      let newCellPosition = [...cellPositionWithoutShape, ...cellPositionWithShape]
      if (gameSettings.isCaculatePoint) {
        newCellPosition = calculatePointAndCellsPosition(newCellPosition)
        gameSettings.isCaculatePoint = false
      }
      setCellPosition(newCellPosition)
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

  const [themeTypeChoosen, setThemeType] = useState(localStorage.getItem('theme') || themeTypeName.LIGHT)

  const chooseTheme = name => () => {
    if (themeTypeChoosen !== name) {
      localStorage.setItem('theme', name)
      setThemeType(name)
    }
  }
  
  return (
    <ThemeProvider theme={createTheme(themeTypeChoosen)}>
      <MainWrapper>
        <Container className="App">
          <MainHeading className="text-center">TERIS RACE</MainHeading>
          <ButtonGroup>
            <Button onClick={chooseTheme(themeTypeName.LIGHT)}>Light mode</Button>
            <Button onClick={chooseTheme(themeTypeName.DARK)}>Dark mode</Button>
          </ButtonGroup>
          <MainBoard gameSettings={gameSettings} cellsPosition={cellPosition} shadowShapePosition={shadowShapePosition} isShake={isShake} setShake={setShake} />
        </Container>
      </MainWrapper>
    </ThemeProvider>
  );
}

export default App;
