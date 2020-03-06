import React from 'react'
import { Button } from 'reactstrap'
import { AiFillCaretLeft, AiFillCaretRight, AiFillCaretDown, AiOutlineRedo } from 'react-icons/ai'

export const TouchControl = ({handleKeyDown, handleKeyUp}) => {

  const handleTouchStart = (keyCode) => () => handleKeyDown({ keyCode })
  const handleTouchEnd = (keyCode) => () => handleKeyUp({ keyCode })
  
  return (
    <div className="d-flex justify-content-between mt-3 mx-3">
      <div>
        <Button
          className="mr-3 py-3 px-4"
          outline
          color="info"
          type="button"
          onTouchEnd={handleTouchEnd(37)}
          onTouchStart={handleTouchStart(37)}
        >
          <AiFillCaretLeft />
        </Button>
        <Button
          className="py-3 px-4"
          outline
          color="info"
          type="button"
          onTouchEnd={handleTouchEnd(39)}
          onTouchStart={handleTouchStart(39)}
        >
          <AiFillCaretRight />
        </Button>
      </div>
      <div>
        <Button
          className="mr-3 py-3 px-4"
          outline
          color="info"
          type="button"
          onTouchEnd={handleTouchEnd(40)}
          onTouchStart={handleTouchStart(40)}
        >
          <AiFillCaretDown />
        </Button>
        <Button
          className="py-3 px-4"
          outline
          color="info"
          type="button"
          onTouchEnd={handleTouchEnd(38)}
          onTouchStart={handleTouchStart(38)}
        >
          <AiOutlineRedo />
        </Button>
      </div>
    </div>
  )
}
