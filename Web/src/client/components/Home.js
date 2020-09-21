import React, { useState, useRef, useEffect } from 'react';
import { withRouter } from 'react-router-dom'  
import { Stage, Layer, Image, Line, Arrow } from 'react-konva';
import useImage from 'use-image';
import Class from './Class'
import Relation from './Relation'

const URLImage = ({ image }) => {
  const [img] = useImage(image.src);
  return (
    <Image
      image={img}
      x={image.x}
      y={image.y}
      // I will use offset to set origin to the center of the image
      offsetX={img ? img.width / 2 : 0}
      offsetY={img ? img.height / 2 : 0}
    />
  );
};

const Home = ({socket}) => {
  const draggedItemRef = useRef()
  const stageRef = useRef()
  const [images, setImages] = useState([])
  const [classDefinitions, setClassDefinitions] = useState([])

  useEffect(() => {
    socket.on("diagram_persisted", data => setClassDefinitions(JSON.parse(data).classDefinitions))   

    return () => socket.off('diagram_persisted')
  });

  useEffect(() => {
    socket.emit("request_issued", JSON.stringify({
            queryForDiagram: { }
          }))
  }, []);

  const handleDrop = e => {
    // register event position
    stageRef.current.setPointersPositions(e);

    let request = {
      diagram: 
      {
        classDefinitions: (classDefinitions ?? []).concat([
          {
            ...stageRef.current.getPointerPosition()
          }
        ])
      }
    }

    socket.emit("request_issued", JSON.stringify(request))
  }

  const handleDragEnd = index => e => {
    let newState = [...classDefinitions]; // copying the old datas array
    newState[index] = e

    let request = {
      diagram: 
      {
        classDefinitions: newState
      }
    }

    socket.emit("request_issued", JSON.stringify(request))
  }

  return (
    <div>
      Try to trag and image into the stage:
      <br />
      <img
        alt="lion"
        src="https://konvajs.org/assets/lion.png"
        draggable="true"
        onDragStart={e => {
          draggedItemRef.current = 'lion';
        }}
      />
      <div
        onDrop={e => handleDrop(e)}
        onDragOver={e => e.preventDefault()}
      >
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          style={{ border: '1px solid grey' }}
          ref={stageRef}
        >
          <Layer>
            {classDefinitions && classDefinitions.map((classDefinition, index) => 
              <Class 
                key={index} 
                id={classDefinition.id}
                x={classDefinition.x} 
                y={classDefinition.y} 
                onDragEnd={handleDragEnd(index)} />)}

            <Relation 
              points={[450, 20, 900, 400]}
              classDefinitions={classDefinitions} />

            {images.map(image => {
              return <URLImage image={image} />;
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default withRouter(Home)