import React, { useState, useEffect } from 'react';
import { Group, Circle, Line, Arrow } from 'react-konva';
import { snapPointRadius, arrowFills, none, changeCursor } from '../utils/utils'

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
      changeCursor(e, 'default')
    }
  }

  const valid = node => node && node.point

  if (!props.state.nodes) {
    return <Group />
  }

  let start = trySnapById(props.state.nodes[0])
  let end = trySnapById(props.state.nodes[props.state.nodes.length - 1])
  let nodes = [start].concat(props.state.nodes.slice(1, props.state.nodes.length - 1)).concat([end])
  let arrowModel = nodes
    .map(e => [e.point.x, e.point.y])
    .reduce((a, b) => a.concat(b))

  return (
    <Group
      onClick={commitRemove}
      onDblclick={e => props.openModal()}
    >
      <Arrow
        points={arrowModel}
        fill={props.state.arrowFill ?? arrowFills[0]}
        stroke='black'
        strokeWidth={props.state.thickness ?? 1}
        dash={props.state.dash && props.state.dash != none ? JSON.parse(props.state.dash) : null}
      />
      <Line
        draggable
        points={arrowModel}
        stroke='black'
        opacity={0}
        strokeWidth={10}
      />

      {nodes && nodes.filter(valid).map((node, index) => {
        if (index) {
          return <Circle
            draggable
            key={index}
            x={(nodes[index - 1].point.x + node.point.x) / 2}
            y={(nodes[index - 1].point.y + node.point.y) / 2}
            onDragEnd={e => {
              let clone = {...props.state}
              clone.nodes.splice(index, 0, trySnapByPosition(e))
              props.commitUpdate(clone)
            }}
            opacity={0.5}
            fill='black'
            radius={snapPointRadius / 2}
          />
        }
      })}

      {nodes && nodes.filter(valid).map((node, index) => 
        <Circle
          draggable
          key={index}
          x={node.point.x}
          y={node.point.y}
          onDragMove={e => {
            let clone = {...props.state}
            clone.nodes[index] = trySnapByPosition(e)
            props.localUpdate(clone)
          }}
          onDragEnd={e => {
            let clone = {...props.state}
            clone.nodes[index] = trySnapByPosition(e)
            props.commitUpdate(clone)
          }}
          opacity={0}
          radius={snapPointRadius}
        />)}
    </Group>
  )
}

export default Relation