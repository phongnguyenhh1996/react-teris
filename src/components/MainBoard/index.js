import Styled from "./mainBoard.styled";
import React from 'react'

const MainBoard = (props) => {

  const smallDeviceSize = window.innerWidth <= 991 ? window.innerWidth : false
  const calculateCellSize = smallDeviceSize ? (smallDeviceSize - 30) / props.gameSettings.columns : props.gameSettings.cellSize
  
  const customGameSettings = {...props.gameSettings, cellSize: calculateCellSize}
  return (
    <Styled.MainBoard {...customGameSettings} isShake={props.isShake} onAnimationEnd={() => props.setShake(false)}>
      {props.cellsPosition.map((cellPosition) => (
        <Styled.MainBoard__cell key={cellPosition.id} {...customGameSettings} position={cellPosition} />
      ))}
      {props.shadowShapePosition.map((cellPosition) => (
        <Styled.MainBoard__cell key={`shadow-${cellPosition.id}`} {...customGameSettings} position={cellPosition} isShadow />
      ))}
    </Styled.MainBoard>
  )
}

export default MainBoard
