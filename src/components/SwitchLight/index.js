import React from 'react'
import { FixedTop, Text } from '../ElementsStyled'
import Switch from '../Switch'

export const SwitchLight = (props) => {
  return (
    <FixedTop>
      <div className="d-flex align-items-center">
        <Text className="mr-2">Light:</Text>
        <Switch {...props}/>
      </div>
    </FixedTop>
  )
}
