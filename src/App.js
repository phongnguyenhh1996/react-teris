import React, { useState, useEffect } from 'react';
import MainBoard from "./components/MainBoard";
import './App.css';

const gameSettings = {
  cellSize: 50,
  columns: 10,
  rows: 12
}

function App() {
  const [cellPosition, setCellPosition] = useState([
    {
      top: 0,
      left: 0,
      isFalling: true
    }
  ])

  useEffect(() => {
    const cellFallHandle = setInterval(() => {
      const newCellPosition = [];
      cellPosition.forEach(cell => {
        const newCell = {...cell}
        const isBottomToched = cell.top + 1 >= gameSettings.rows
        if (isBottomToched) {
          newCell.isFalling = false
        } else {
          newCell.top += 1
        }
        newCellPosition.push(newCell)
      })
      setCellPosition(newCellPosition)
    }, 1000);
    return () => {
      clearInterval(cellFallHandle)
    };
  }, [cellPosition])
  
  return (
    <div className="App">
      <h1>TERIS</h1>
      <MainBoard gameSettings={gameSettings} cellsPosition={cellPosition} />
    </div>
  );
}

export default App;
