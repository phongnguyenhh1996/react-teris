import Styled from "./mainBoard.styled";
import React from 'react'

const MainBoard = (props) => {
  return (
    <Styled.MainBoard {...props.gameSettings} isShake={props.isShake} onAnimationEnd={() => props.setShake(false)}>
      {props.cellsPosition.map((cellPosition) => (
        <Styled.MainBoard__cell key={cellPosition.id} {...props.gameSettings} position={cellPosition} />
      ))}
      {props.shadowShapePosition.map((cellPosition) => (
        <Styled.MainBoard__cell key={`shadow-${cellPosition.id}`} {...props.gameSettings} position={cellPosition} isShadow />
      ))}
    </Styled.MainBoard>
  )
}

export default MainBoard
