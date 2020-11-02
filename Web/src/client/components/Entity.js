import React, { useState, useEffect } from 'react';
import { Group, Rect, Text, Circle, Line } from 'react-konva';

const Entity = props => {
  const [fields, setFields] = useState(['dupa1', 'dupa2'])

  const handleDoubleClick = e => props.openModal()

  const handleDragEnd = e => {
    let clone = {...props.state}
    clone.x = e.target.attrs['x']
    clone.y = e.target.attrs['y']
    props.onDragEnd(clone)
  }

  return (
    <Group
      x={props.state.x}
      y={props.state.y}
      onDblclick={handleDoubleClick}
      onDragEnd={handleDragEnd}
      draggable>
      <Rect
        x={0}
        y={0}
        width={props.state.width}
        height={props.state.height / 2}
        stroke='black'
        strokeWidth={1}
      />
      <Rect
        x={0}
        y={props.state.height / 2}
        width={props.state.width}
        height={props.state.height / 2}
        stroke='black'
        strokeWidth={1}
      />
      <Text
        x={0}
        y={0} 
        width={props.state.width}
        text={props.state.name} 
        fontSize={15}
        align='center'
      />
      {fields.map((field, index) => 
        <Text 
          x={0}
          y={props.state.height / 2 + index * 15} 
          key={index} 
          text={'+ field: ' + field} 
        />)}
    </Group>
  )
}

export default Entity