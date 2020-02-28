import styled from "styled-components";

const MainBoard = styled.div`
  width: ${(props) => props.cellSize*props.columns}px;
  height: ${(props) => props.cellSize*props.rows}px;
  position: relative;
  background-color: #aaa;
  margin: auto;
`

const MainBoard__cell = styled.div`
  width: ${props => props.cellSize}px;
  height: ${props => props.cellSize}px;
  position: absolute;
  top: ${(props) => props.position.top && props.position.top*props.cellSize}px;
  left: ${(props) => props.position.left && props.position.left*props.cellSize}px;
  right: ${(props) => props.position.right && props.position.right*props.cellSize}px;
  bottom: ${(props) => props.position.bottom && props.position.bottom*props.cellSize}px;
  background-color: red;
`

export default {
  MainBoard,
  MainBoard__cell
}