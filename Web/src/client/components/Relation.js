import React, { useState, useEffect } from 'react';
import { Group, Rect, Text, Circle, Line, Arrow } from 'react-konva';

const Relation = props => {
  const snapPointRadius = 15
  const [start, setStart] = useState(props.start)
  const [end, setEnd] = useState(props.end)

  useEffect(() => {

    let startEntity = props.entities.find(
      entity => entity.id == start.startEntityId)

    if (startEntity)
    {
      setStart({
        point: {
          x: startEntity.x,
          y: startEntity.y,
        },
        startEntityId: start.startEntityId
      })
    }

    let endEntity = props.entities.find(
      entity => entity.id == end.startEntityId)

    if (endEntity)
    {
      setEnd({
        point: {
          x: endEntity.x,
          y: endEntity.y,
        },
        startEntityId: end.startEntityId
      })
    }

  }, [props.entities]);

  const pointIsInSnapArea = (pointX, pointY, circleX, circleY) => {
    let radius = snapPointRadius
    let dist_points = (pointX - circleX) * (pointX - circleX) + (pointY - circleY) * (pointY - circleY);
    radius *= radius;
    if (dist_points < radius) {
        return true;
    }
    return false;
  }

  const handleDragEnd = e => {
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
        onDragMove={e => {
          let x = e.target.attrs['x']
          let y = e.target.attrs['y']
          let startsFromId = null
          let result = props.entities.find(
            entity => pointIsInSnapArea(x, y, entity.x, entity.y))

          if (result)
          {
            x = result.x
            y = result.y
            startsFromId = result.id
          }

          setStart({
            point: {
              x: x,
              y: y,
            },
            startEntityId: startsFromId
          })
        }}
        onDragEnd={handleDragEnd}
        opacity={0}
        radius={snapPointRadius}
      />
      <Circle
        draggable
        x={end.point.x}
        y={end.point.y}
        onDragMove={e => {
          let x = e.target.attrs['x']
          let y = e.target.attrs['y']
          let endsOnId = null
          let result = props.entities.find(
            entity => pointIsInSnapArea(x, y, entity.x, entity.y))

          if (result)
          {
            x = result.x
            y = result.y
            endsOnId = result.id
          }

          setEnd({
            point: {
              x: x,
              y: y,
            },
            startEntityId: endsOnId
          })
        }}
        onDragEnd={handleDragEnd}
        opacity={0}
        radius={snapPointRadius}
      />
    </Group>
  )
}

export default Relation