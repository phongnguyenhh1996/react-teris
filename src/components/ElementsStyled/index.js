import styled from "styled-components";

export const MainWrapper = styled.div`
  background-color: ${props => props.theme.backgroundWrapper};
  min-height: 100vh;
  font-family: 'Righteous', cursive;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export const MainHeading = styled.h1`
  color: ${props => props.theme.mainHeading};
`