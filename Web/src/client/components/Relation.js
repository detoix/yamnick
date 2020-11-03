import React, { useState, useEffect } from 'react';
import { Group, Rect, Text, Circle, Line, Arrow } from 'react-konva';
import { snapPointRadius } from '../utils/Consts'

const Relation = props => {
  const [start, setStart] = useState(props.start)
  const [end, setEnd] = useState(props.end)

  useEffect(() => {
    trySnapById(setStart, props.start)
  }, [props.start])

  useEffect(() => {
    trySnapById(setEnd, props.end)
  }, [props.end])

  useEffect(() => {
    trySnapById(setStart, start)
    trySnapById(setEnd, end)
  }, [props.entities]);

  const trySnapById = (setPoint, node) => {
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
        newSnapPoint = snapEntity.edgePoints[node.entityHandle.snapNodeId]
        snapEntityHandle = {
          entityId: snapEntity.id,
          snapNodeId: node.entityHandle.snapNodeId
        }
      }
  
      setPoint({
        point: newSnapPoint,
        entityHandle: snapEntityHandle
      })
    }   
  }

  const trySnapByPosition = (setPoint, x, y) => {
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

    setPoint({
      point: newSnapPoint,
      entityHandle: snapEntityHandle
    })
  }

  const commitUpdate = e => {
    props.onDragEnd({
      start: start,
      end: end
    })
  }

  return (
    <Group>
      <Arrow
        points={[start.point.x, start.point.y, end.point.x, end.point.y]}
        fill='white'
        stroke='black'
        strokeWidth={1}
      />
      <Circle
        draggable
        x={start.point.x}
        y={start.point.y}
        onDragMove={e => trySnapByPosition(
          setStart, e.target.attrs['x'], e.target.attrs['y'])}
        onDragEnd={commitUpdate}
        opacity={0}
        radius={snapPointRadius}
      />
      <Circle
        draggable
        x={end.point.x}
        y={end.point.y}
        onDragMove={e => trySnapByPosition(
          setEnd, e.target.attrs['x'], e.target.attrs['y'])}
        onDragEnd={commitUpdate}
        opacity={0}
        radius={snapPointRadius}
      />
    </Group>
  )
}

export default Relation