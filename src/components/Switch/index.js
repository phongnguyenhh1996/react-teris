
import React from 'react';
import styled from 'styled-components';

const SwitchLabel = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
  margin: 0;
`;

const Slider = styled.div`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.value ? '#1E81AE' : '#ccc'};
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 34px;

  &:before{
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

const Input = styled.input`
  display: none;

  &:focus + ${Slider}{
    box-shadow: 0 0 1px #2196F3;
  }

  &:checked + ${Slider}:before {
    transform: translateX(16px);
  }
`;

const Switch = (props) => {
  return (
    <SwitchLabel>
      <Input {...props} type="checkbox" disabled={props.readOnly} />
      <Slider value={props.value} />
    </SwitchLabel>
  );
}

export default Switch;