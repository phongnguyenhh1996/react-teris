import React, { useState, useEffect } from 'react';
import MainBoard from "./components/MainBoard";
import './App.css';
import generateShape from './shapes';
import { Container } from 'reactstrap';
import { ThemeProvider } from "styled-components";
import createTheme from './themes';
import { themeTypeName } from './themes/themesType';
import { MainWrapper, MainHeading } from './components/ElementsStyled';
import functions from "./functions";
import { gameSettings } from './constants'
import { SwitchLight } from './components/SwitchLight';
import { TouchControl } from './components/TouchControl';

const gameState = {
  fallStep: 0,
  isCaculatePoint: false,
  delayStep: 0
}
const shapeOnControl = {
  isPrepareOnGround: false,
  ...functions.createRandomShape()
}
const initShape = generateShape(shapeOnControl.currentShape, shapeOnControl.currentDirection)
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
  const [shadowShapePosition, setShadowShapePosition] = useState(functions.createShadowShape(initShape, [], shapeOnControl))

  useEffect(() => {
    const cellFallHandle = setInterval(() => {
      const cellPositionSeperateObj = functions.seperatorCell(cellPosition)

      functions.handleDestroyCell(cellPositionSeperateObj, gameState, shapeOnControl, setShadowShapePosition, setCellPosition)
      
      const shapeCollusion = functions.handleCollusion(cellPositionSeperateObj.cellPositionWithShape, cellPositionSeperateObj.cellPositionWithoutShape)
      functions.handleControlLeftRight(shapeCollusion, shapeOnControl, control, cellPositionSeperateObj, setShadowShapePosition)
      
      functions.handleFallingShape(cellPositionSeperateObj, gameState, shapeCollusion, shapeOnControl, setShadowShapePosition)

      functions.handleControlDown(cellPositionSeperateObj, shadowShapePosition, control, gameState, shapeOnControl, setShadowShapePosition, setShake)
      
      functions.handleControlRotate(cellPositionSeperateObj, control, shapeOnControl, setShadowShapePosition)
      
      let newCellPosition = [...cellPositionSeperateObj.cellPositionWithoutShape, ...cellPositionSeperateObj.cellPositionWithShape]
      if (gameState.isCaculatePoint) {
        newCellPosition = functions.calculatePointAndCellsPosition(newCellPosition)
        gameState.isCaculatePoint = false
      }
      setCellPosition(newCellPosition)
    }, gameSettings.fps);
    return () => {
      clearInterval(cellFallHandle)
    };
  }, [cellPosition, shadowShapePosition])

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
    
    const htmlElement = document.querySelector('.hover-active');
    function touchStart () {
      htmlElement.classList.remove('hover-active');
      htmlElement.classList.add('no-hover-active');
      htmlElement.removeEventListener('touchstart', touchStart);
    }

    htmlElement.addEventListener('touchstart', touchStart);
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      htmlElement.removeEventListener('touchstart', touchStart);
    }
  }, [])

  const [themeTypeChoosen, setThemeType] = useState(localStorage.getItem('theme') || themeTypeName.LIGHT)

  const chooseTheme = () => {
    const typeNameToChange = themeTypeChoosen !== themeTypeName.LIGHT ? themeTypeName.LIGHT : themeTypeName.DARK
    localStorage.setItem('theme', typeNameToChange)
    setThemeType(typeNameToChange)
  }

  const isLightOn = themeTypeChoosen === themeTypeName.LIGHT
  
  return (
    <ThemeProvider theme={createTheme(themeTypeChoosen)}>
      <MainWrapper className="hover-active">
        <SwitchLight value={isLightOn} onChange={chooseTheme} isReadOnly/>
        <Container className="App">
          <MainHeading className="text-center">TERIS RACE</MainHeading>
          <MainBoard gameSettings={gameSettings} cellsPosition={cellPosition} shadowShapePosition={shadowShapePosition} isShake={isShake} setShake={setShake} />
          <TouchControl handleKeyUp={handleKeyUp} handleKeyDown={handleKeyDown}/>
        </Container>
      </MainWrapper>
    </ThemeProvider>
  );
}

export default App;
