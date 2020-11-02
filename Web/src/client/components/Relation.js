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
    let x = node.point.x
    let y = node.point.y
    let snapEntityId = 0
    let snapEntity = props.entities.find(
      entity => entity.id == node.startEntityId)

    if (snapEntity)
    {
      x = snapEntity.x
      y = snapEntity.y
      snapEntityId = snapEntity.id
    }

    setPoint({
      point: {
        x: x,
        y: y,
      },
      startEntityId: snapEntityId
    })
  }

  const trySnapByPosition = (setPoint, x, y) => {
    let snapEntityId = 0

    props.entities.forEach(entity => {
      let snapPoint = entity.pointCloseTo(x, y)
      if (snapPoint) {
        x = snapPoint.x
        y = snapPoint.y
        snapEntityId = entity.id
      }
    })

    setPoint({
      point: {
        x: x,
        y: y,
      },
      startEntityId: snapEntityId
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