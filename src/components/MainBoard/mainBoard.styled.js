import styled, { keyframes, css } from "styled-components";

const shakeAnimation = keyframes`
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(-2px, -2px);
  }
  60% {
    transform: translate(2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
  100% {
    transform: translate(0);
  }
`

const fadeOutAnimation = keyframes`
  0% {
    transform: translateZ(0);
    opacity: 1;
  }
  100% {
    transform: translateZ(-80px);
    opacity: 0;
  }
`

const MainBoard = styled.div`
  width: ${(props) => props.cellSize*props.columns}px;
  height: ${(props) => props.cellSize*props.rows}px;
  position: relative;
  background-color: #ECF0F1;
  margin: auto;
  animation: ${props => props.isShake && shakeAnimation} 0.3s linear;
  overflow: hidden;
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
  transition: left .3s ease, top .15s ease;
  opacity: ${props => props.isShadow ? 0.2 : props.isDestroying ? 0 : 1};
`

export default {
  MainBoard,
  MainBoard__cell
}