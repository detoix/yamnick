import React, { useState, useEffect } from 'react';
import { Stage, Group, Rect, Text, Circle, Line, Arrow } from 'react-konva';

const Relation = props => {
  const snapPointRadius = 15
  const [coords, setCoords] = useState(props.points)
  const [startsFrom, setStartsFrom] = useState(null)
  const [endsOn, setEndsOn] = useState(null)

  useEffect(() => {
    let newState = [...coords]

    let startEntity = props.classDefinitions.find(
      classDefinition => classDefinition.id == startsFrom)

    if (startEntity)
    {
      newState[0] = startEntity.x
      newState[1] = startEntity.y
    }

    let endEntity = props.classDefinitions.find(
      classDefinition => classDefinition.id == endsOn)

    if (endEntity)
    {
      newState[2] = endEntity.x
      newState[3] = endEntity.y
    }

    setCoords(newState)

  }, [props.classDefinitions]);

  const pointIsInSnapArea = (pointX, pointY, circleX, circleY) => {
    let radius = snapPointRadius
    let dist_points = (pointX - circleX) * (pointX - circleX) + (pointY - circleY) * (pointY - circleY);
    radius *= radius;
    if (dist_points < radius) {
        return true;
    }
    return false;
  }

  return (
    <Group>
      <Arrow
        points={coords}
        fill='white'
        stroke='black'
        strokeWidth={1}
      />
      <Circle
        draggable
        x={coords[0]}
        y={coords[1]}
        onDragMove={e => {
          let x = e.target.attrs['x']
          let y = e.target.attrs['y']
          let startsFromId = null
          let result = props.classDefinitions.find(
            classDefinition => pointIsInSnapArea(x, y, classDefinition.x, classDefinition.y))

          if (result)
          {
            x = result.x
            y = result.y
            startsFromId = result.id
          }

          setCoords([x, y, coords[2], coords[3]])
          setStartsFrom(startsFromId)
        }}
        opacity={0}
        radius={snapPointRadius}
      />
      <Circle
        draggable
        x={coords[2]}
        y={coords[3]}
        onDragMove={e => {
          let x = e.target.attrs['x']
          let y = e.target.attrs['y']
          let endsOnId = null
          let result = props.classDefinitions.find(
            classDefinition => pointIsInSnapArea(x, y, classDefinition.x, classDefinition.y))

          if (result)
          {
            x = result.x
            y = result.y
            endsOnId = result.id
          }

          setCoords([coords[0], coords[1], x, y])
          setEndsOn(endsOnId)
        }}
        opacity={0}
        radius={snapPointRadius}
      />
    </Group>
  )
}

export default Relation