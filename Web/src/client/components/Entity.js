import React, { useState, useEffect } from 'react';
import { Group, Rect, Text, Image, Circle } from 'react-konva';
import { images } from '../utils/Consts'
import useImage from 'use-image'

const Entity = props => {
  const [image] = useImage(images[props.state.imageId]);

  const openModal = e => props.openModal()

  const commitUpdate = e => {
    let clone = {...props.state}
    clone.x = e.target.attrs['x']
    clone.y = e.target.attrs['y']
    props.commitUpdate(clone)
  }

  const commitRemove = e => {
    if (e.evt.shiftKey) { 
      props.commitRemove() 
    }
  }

  return (
    <Group
      x={props.state.x}
      y={props.state.y}
      onDblclick={openModal}
      onDragEnd={commitUpdate}
      onClick={commitRemove}
      draggable>

      {props.state.edgePoints().map((snapPoint, index) => 
        <Circle 
          key={index} 
          x={snapPoint.x - props.state.x} 
          y={snapPoint.y - props.state.y} 
          fill='gray' 
          radius={3} />)}

      <Rect
        x={0}
        y={0}
        width={props.state.width}
        height={50}
        stroke='black'
        fill='white'
        strokeWidth={1}
      />
      <Rect
        x={0}
        y={50}
        width={props.state.width}
        height={props.state.height - 50}
        stroke='black'
        fill='white'
        strokeWidth={1}
      />
      <Text
        x={0}
        y={0} 
        width={props.state.width}
        height={50}
        text={props.state.name} 
        fontSize={15}
        align='center'
        verticalAlign='middle'
      />
      {props.state.members && props.state.members.filter(member => member).map((member, index) => 
        <Text 
          x={0}
          y={50 + index * 15} 
          padding={5}
          key={index} 
          text={member.name} 
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