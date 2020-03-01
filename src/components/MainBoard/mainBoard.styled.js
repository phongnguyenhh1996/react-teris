import styled from "styled-components";

const MainBoard = styled.div`
  width: ${(props) => props.cellSize*props.columns}px;
  height: ${(props) => props.cellSize*props.rows}px;
  position: relative;
  background-color: #ECF0F1;
  margin: auto;
`

const MainBoard__cell = styled.div.attrs(props => ({
  style: {
    top: props.position.top && props.position.top*props.cellSize + 'px',
    left: props.position.left && props.position.left*props.cellSize + 'px',
    right: props.position.right && props.position.right*props.cellSize + 'px',
    bottom: props.position.bottom && props.position.bottom*props.cellSize + 'px'
  }
}))`
  width: ${props => props.cellSize}px;
  height: ${props => props.cellSize}px;
  position: absolute;
  background: ${(props) => props.position.color};
`

export default {
  MainBoard,
  MainBoard__cell
}