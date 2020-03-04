import React, { useState, useEffect } from 'react';
import MainBoard from "./components/MainBoard";
import './App.css';
import Shapes from './shapes';
import { keyBy } from 'lodash';
import allShapes from "./shapes/allShapes";
import { Container, ButtonGroup, Button } from 'reactstrap';
import { ThemeProvider } from "styled-components";
import createTheme from './themes';
import { themeTypeName } from './themes/themesType';
import { MainWrapper, MainHeading } from './components/ElementsStyled';
import functions from "./functions";
import { gameSettings } from './constants'

const gameState = {
  fallStep: 0,
  isCaculatePoint: false,
  delayStep: 0
}
const shapes = Shapes(gameSettings)
const shapeOnControl = {
  isPrepareOnGround: false,
  ...functions.createRandomShape()
}
const initShape = shapes(shapeOnControl.currentShape, shapeOnControl.currentDirection)
const control = {
  left: false,
  right: false,
  rotate: false,
  down: false,
  controlSpeedStep: gameSettings.controlSpeed
}



function App() {
  const [cellPosition, setCellPosition] = useState(initShape)
  const [isShake, setShake] = useState(false)

  

  const createShadowShape = (shape, allRestCell) => {
    const shapeInfo = functions.getShapeInfo(shape)
    const allCellSameColumns = allRestCell.filter(cell => cell.left >= shapeInfo.xMin && cell.left <= shapeInfo.xMax)
    const allCellSameColumnsInfo = functions.getShapeInfo(allCellSameColumns)
    if (!allCellSameColumnsInfo.yMin || !allCellSameColumnsInfo.yMax) {
      return shapes(shapeOnControl.currentShape, shapeOnControl.currentDirection, shapeInfo.xMin, gameSettings.rows - 1 - (shapeInfo.yMax - shapeInfo.yMin), shapeInfo.color)
    }
    let newShape = []
    
    for (let i = allCellSameColumnsInfo.yMin - (shapeInfo.yMax - shapeInfo.yMin + 1); i < allCellSameColumnsInfo.yMin + (shapeInfo.yMax - shapeInfo.yMin); i++) {
      const newTestShape = shapes(shapeOnControl.currentShape, shapeOnControl.currentDirection, shapeInfo.xMin, i, shapeInfo.color)
      
      const { isBottomCollusion } = functions.handleCollusion(newTestShape, allCellSameColumns)
      
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
    const { cellPositionWithShape, cellPositionWithoutShape } = functions.seperatorCell([...cellPosition, ...shape])
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
      } = functions.seperatorCell(cellPosition)

      const destroyingCells = cellPositionWithoutShape.filter(cell => cell.isDestroying)
      const isHaveDestroyingCells = destroyingCells.length > 0
      if (isHaveDestroyingCells) {
        if (gameState.delayStep >= gameSettings.delayTime) {
          cellPositionWithoutShape = handleFallingCell(cellPositionWithoutShape)
          let newCellPosition = [...cellPositionWithoutShape, ...cellPositionWithShape]
          gameState.delayStep = 0
          return setCellPosition(newCellPosition)
        } else {
          gameState.delayStep += gameSettings.fps
        }
      }
      const { isBottomCollusion, isLeftCollusion, isRightCollusion } = functions.handleCollusion(cellPositionWithShape, cellPositionWithoutShape)

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
      gameState.fallStep += gameSettings.fps
      if (gameState.fallStep >= gameSettings.fallSpeed) {
        gameState.fallStep = 0

        if (isBottomCollusion) {
          if (!shapeOnControl.isPrepareOnGround) {
            shapeOnControl.isPrepareOnGround = true
          } else {
            gameState.isCaculatePoint = true
            cellPositionWithShape = cellPositionWithShape.map(cell => ({...cell,  isFalling: false, userControl: false}))
            const newRandomShape = functions.createRandomShape()
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
        gameState.isCaculatePoint = true
        const newCellPositionWithShape = shadowShapePosition.map((cell, index) => ({...cell, isFalling: false, userControl: false, id: cellPositionWithShape[index].id}))
        cellPositionWithShape = newCellPositionWithShape
        const newRandomShape = functions.createRandomShape()
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
          const { cellPositionWithShape, cellPositionWithoutShape } = functions.seperatorCell(newCellPosition)
          const {
            isOverlapsed
          } = functions.handleCollusion(cellPositionWithShape, cellPositionWithoutShape)
          if (!isOverlapsed) {
            return cellPositionWithShape
          } 
          return null
        }
        const {xMin, yMin, color} = functions.getShapeInfo(cellPositionWithShape)
        
        const newCellPositionWithShape = checkAndCreateShapeWithDir([...cellPositionWithoutShape, ...shapes(shapeOnControl.currentShape, newDirection, xMin, yMin, color, true)])
        
        if (newCellPositionWithShape !== null) {
          shapeOnControl.currentDirection = newDirection
          cellPositionWithShape = newCellPositionWithShape
          const shadowShape = createShadowShape(cellPositionWithShape, cellPositionWithoutShape)
          setShadowShapePosition(shadowShape)
        }
      }
      
      let newCellPosition = [...cellPositionWithoutShape, ...cellPositionWithShape]
      if (gameState.isCaculatePoint) {
        newCellPosition = calculatePointAndCellsPosition(newCellPosition)
        gameState.isCaculatePoint = false
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
