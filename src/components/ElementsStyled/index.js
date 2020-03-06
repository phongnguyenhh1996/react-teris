import styled from "styled-components";

const MainWrapper = styled.div`
  background-color: ${props => props.theme.backgroundWrapper};
  min-height: 100vh;
  font-family: 'Righteous', cursive;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
`

const MainHeading = styled.h1`
  color: ${props => props.theme.mainHeading};
  @media screen and (max-width: 991px){
    font-size: 22px;
  }
`

const FixedTop = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
`

const Text = styled.span`
  color: ${props => props.theme.textColor};
`

export {
  MainWrapper,
  MainHeading,
  FixedTop,
  Text
}