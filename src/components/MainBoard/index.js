import Styled from "./mainBoard.styled";
import React from 'react'

const MainBoard = (props) => {
  return (
    <Styled.MainBoard {...props.gameSettings}>
      {props.cellsPosition.map((cellPosition, index) => (
        <Styled.MainBoard__cell key={index} {...props.gameSettings} position={cellPosition} />
      ))}
    </Styled.MainBoard>
  )
}

export default MainBoard
