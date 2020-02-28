import React, { useState, useEffect } from 'react';
import MainBoard from "./components/MainBoard";
import './App.css';

function App() {
  const [gameSettings] = useState({
    cellSize: 50,
    columns: 15,
    rows: 15
  })
  const [cellPosition, setCellPosition] = useState([
    {
      top: 0,
      left: 0
    }
  ])
  console.log(cellPosition);
  
  useEffect(() => {
    const cellFallHandle = setInterval(() => {
      const newCellPosition = [];
      cellPosition.forEach(cellPosition => {
        newCellPosition.push({...cellPosition, top: cellPosition.top + 1 < gameSettings.rows ? cellPosition.top + 1 : cellPosition.top})
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
