import React, { useState, useEffect } from 'react';
import { Group, Rect, Text, Circle, Line, Arrow } from 'react-konva';
import { snapPointRadius, arrowFills, none } from '../utils/utils'

const Relation = props => {

  const trySnapById = node => {
    let newSnapPoint = {
      x: node.point.x,
      y: node.point.y,
    }
    let snapEntityHandle = {
      entityId: 0,
      snapNodeId: 0
    }

    if (node.entityHandle) {

      let snapEntity = props.entities.find(
        entity => entity.id == node.entityHandle.entityId)
  
      if (snapEntity)
      {
        newSnapPoint = snapEntity.edgePoints()[node.entityHandle.snapNodeId]
        snapEntityHandle = {
          entityId: snapEntity.id,
          snapNodeId: node.entityHandle.snapNodeId
        }
      }
    }   

    return {
      point: newSnapPoint,
      entityHandle: snapEntityHandle
    }
  }

  const trySnapByPosition = e => {
    let x = e.target.attrs['x']
    let y = e.target.attrs['y']
    let newSnapPoint = {
      x: x,
      y: y,
    }
    let snapEntityHandle = {
      entityId: 0,
      snapNodeId: 0
    }

    props.entities.forEach(entity => {
      let [foundSnapPoint, indexOfSnapPoint] = entity.pointCloseTo(x, y)
      if (foundSnapPoint) {
        newSnapPoint = foundSnapPoint
        snapEntityHandle = {
          entityId: entity.id,
          snapNodeId: indexOfSnapPoint
        }
      }
    })

    return {
      point: newSnapPoint,
      entityHandle: snapEntityHandle
    }
  }

  const commitRemove = e => {
    if (e.evt.shiftKey) { 
      props.commitRemove() 
    }
  }

  let start = trySnapById(props.state.start)
  let end = trySnapById(props.state.end)

  return (
    <Group
      onClick={commitRemove}
      onDblclick={e => props.openModal()}
    >
      <Arrow
        points={[start.point.x, start.point.y, end.point.x, end.point.y
        ]}
        fill={props.state.endStyle ?? arrowFills[0]}
        stroke='black'
        strokeWidth={props.state.thickness ?? 1}
        dash={props.state.dash == none ? null : JSON.parse(props.state.dash)}
      />
      <Circle
        draggable
        x={start.point.x}
        y={start.point.y}
        onDragMove={e => {
          let clone = {...props.state}
          clone.start = trySnapByPosition(e)
          props.localUpdate(clone)
        }}
        onDragEnd={e => {
          let clone = {...props.state}
          clone.start = trySnapByPosition(e)
          props.commitUpdate(clone)
        }}
        opacity={0}
        radius={snapPointRadius}
      />
      <Circle
        draggable
        x={end.point.x}
        y={end.point.y}
        onDragMove={e => {
          let clone = {...props.state}
          clone.end = trySnapByPosition(e)
          props.localUpdate(clone)
        }}
        onDragEnd={e => {
          let clone = {...props.state}
          clone.end = trySnapByPosition(e)
          props.commitUpdate(clone)
        }}
        opacity={0}
        radius={snapPointRadius}
      />
    </Group>
  )
}

export default Relation