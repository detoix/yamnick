import React, { useState, useEffect } from 'react';
import { Group, Rect, Text, Image, Circle } from 'react-konva';
import { images, colors, entityMemberRowHeight, snapPointRadius, snapPointVisibleRadius } from '../utils/Consts'
import useImage from 'use-image'

const Entity = props => {
  const [image] = useImage(images[props.state.imageId]);

  const commitUpdate = e => {
    if (e.target.attrs.resizeNode) {
      return
    }

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
      onDblclick={e => props.openModal()}
      onDragEnd={commitUpdate}
      onClick={commitRemove}
      onContextMenu={props.onContextMenu}
      draggable>

      {props.state.edgePoints().map((snapPoint, index) => 
        <Circle
          key={index}
          x={snapPoint.x - props.state.x} 
          y={snapPoint.y - props.state.y} 
          fill='gray' 
          radius={snapPointVisibleRadius}
          />)}

      <Rect
        x={0}
        y={0}
        width={props.state.width}
        height={props.state.nameSectionHeight}
        stroke='black'
        fill={colors[props.state.color]}
        strokeWidth={1}
      />

      {props.state.members && props.state.members.slice(0, 1).map((_, index) => 
        <Rect
          key={index}
          x={0}
          y={props.state.nameSectionHeight}
          width={props.state.width}
          height={props.state.membersSectionHeight}
          stroke='black'
          fill={colors[props.state.color]}
          strokeWidth={1} />)}
      
      <Text
        x={0}
        y={0} 
        width={props.state.width}
        height={props.state.nameSectionHeight}
        text={props.state.name} 
        fontSize={15}
        align='center'
        verticalAlign='middle'
      />
      {props.state.members && props.state.members.filter(member => member).map((member, index) => 
        <Text 
          x={0}
          y={props.state.nameSectionHeight + index * entityMemberRowHeight} 
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

      {props.state.edgePoints().filter(snapPoint => snapPoint.direction != "default").map((snapPoint, index) => 
        <Circle 
          key={index}
          x={snapPoint.x - props.state.x} 
          y={snapPoint.y - props.state.y} 
          radius={snapPointRadius} 
          onMouseEnter={e => {
            const container = e.target.getStage().container();
            container.style.cursor = snapPoint.direction;
          }}
          onMouseLeave={e => {
            const container = e.target.getStage().container();
            container.style.cursor = "default";
          }}
          dragBoundFunc={pos => {
            if (snapPoint.direction === "e-resize") {
              return {
                x : pos.x,
                y : snapPoint.y
              }
            } else if (snapPoint.direction === "s-resize") {
              return {
                x : snapPoint.x,
                y : pos.y
              }
            }
          }}
          onDragEnd={e => {
            if (snapPoint.direction === "e-resize") {
              let clone = {...props.state}
              clone.width = e.target.attrs['x']
              props.commitUpdate(clone)
            } else if (snapPoint.direction === "s-resize") {
              let ratio = props.state.membersSectionHeight / (props.state.membersSectionHeight + props.state.nameSectionHeight) 
              let clone = {...props.state}
              clone.nameSectionHeight = e.target.attrs['y'] * (1.0 - ratio)
              clone.membersSectionHeight = e.target.attrs['y'] * ratio
              props.commitUpdate(clone)
            }
          }}
          resizeNode
          draggable
          />)}
    </Group>
  )
}

export default Entity