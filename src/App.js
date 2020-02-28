import React, { useState, useEffect, useCallback } from 'react';
import MainBoard from "./components/MainBoard";
import './App.css';
import Shapes from './shapes';
import { cloneDeep } from 'lodash';

const gameSettings = {
  cellSize: 20,
  columns: 20,
  rows: 32,
  fallSpeed: 500
}
const shapes = Shapes(gameSettings)

function App() {
  const __T = shapes['t']([])
  const [cellPosition, setCellPosition] = useState(__T.create())
  
  const handleCellData = data => {
    const newCellPosition = cloneDeep(data)
    const cellPositionWithoutShape = newCellPosition.filter(cell => !cell.isFalling)
    const cellPositionWithShape = newCellPosition.filter(cell => cell.isFalling)
    const isShapeBottomTouched = cellPositionWithShape.filter(cell => cell.top + 1 >= gameSettings.rows).length !== 0

    return {
      cellPositionWithShape,
      cellPositionWithoutShape,
      isShapeBottomTouched
    }
  }

  useEffect(() => {
    const cellFallHandle = setInterval(() => {
      let { cellPositionWithShape, cellPositionWithoutShape, isShapeBottomTouched } = handleCellData(cellPosition)
      if (isShapeBottomTouched) {
        cellPositionWithShape = cellPositionWithShape.map(cell => ({...cell, isFalling: false}))
      } else {
        cellPositionWithShape = cellPositionWithShape.map(cell => ({...cell, top: cell.top + 1}))
      }
      setCellPosition([...cellPositionWithoutShape, ...cellPositionWithShape])
    }, gameSettings.fallSpeed);
    return () => {
      clearInterval(cellFallHandle)
      console.log('here')
    };
  }, [cellPosition])

  const handleControl = useCallback(
    (e) => {
      console.log(e.keyCode);
      let { cellPositionWithShape, cellPositionWithoutShape, isShapeBottomTouched } = handleCellData(cellPosition)
      if (isShapeBottomTouched) {
        return;
      }
      switch (e.keyCode) {
        case 37:
          cellPositionWithShape = cellPositionWithShape.map(cell => ({...cell, left: cell.left - 1}))
          break;
        case 39:
          cellPositionWithShape = cellPositionWithShape.map(cell => ({...cell, left: cell.left + 1}))
          break;
        default:
          break;
      }
      setCellPosition([...cellPositionWithoutShape, ...cellPositionWithShape])
    },
    [cellPosition],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleControl)
    return () => {
      window.removeEventListener('keydown', handleControl)
    }
  }, [handleControl])
  
  return (
    <div className="App">
      <h1>TERIS</h1>
      <MainBoard gameSettings={gameSettings} cellsPosition={cellPosition} />
    </div>
  );
}

export default App;
