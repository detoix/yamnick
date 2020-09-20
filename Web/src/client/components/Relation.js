import React, { useState, useEffect } from 'react';
import { Stage, Group, Rect, Text, Circle, Line, Arrow } from 'react-konva';

const Relation = props => {
  const snapPointRadius = 15
  const [coords, setCoords] = useState(props.points)

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
          let result = props.classDefinitions.find(
            classDefinition => pointIsInSnapArea(x, y, classDefinition.x, classDefinition.y))

          if (result)
          {
            x = result.x
            y = result.y
          }

          setCoords([x, y, coords[2], coords[3]])
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
          let result = props.classDefinitions.find(
            classDefinition => pointIsInSnapArea(x, y, classDefinition.x, classDefinition.y))

          if (result)
          {
            x = result.x
            y = result.y
          }

          setCoords([coords[0], coords[1], x, y])
        }}
        opacity={0}
        radius={snapPointRadius}
      />
    </Group>
  )
}

export default Relation