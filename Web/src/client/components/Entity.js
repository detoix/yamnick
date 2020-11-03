import React, { useState, useEffect } from 'react';
import { Group, Rect, Text, Image, Line } from 'react-konva';
import useImage from 'use-image'
import lion from '../../../public/lion.png'

const Entity = props => {
  const [image] = useImage(lion);
  const [fields, setFields] = useState(['dupa1', 'dupa1'])

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
      <Image 
        image={image}
        x={props.state.width - 50}
        y={-45}
        scaleX={0.35}
        scaleY={0.35}
      />
    </Group>
  )
}

export default Entity