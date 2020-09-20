import React, { useState, useRef, useEffect } from 'react';
import { withRouter } from 'react-router-dom'  
import { Stage, Layer, Image, Line, Arrow } from 'react-konva';
import useImage from 'use-image';
import Class from './Class'

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
  const draggedItemRef = useRef();
  const stageRef = useRef();
  const [images, setImages] = useState([]);
  const [classDefinitions, setClassDefinitions] = useState([]);

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

  const [linePoints, setLinePoints] = useState([450, 20, 900, 400]);

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
      {/* <img
        alt="sth"
        src="https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png"
        draggable="true"
        onDragStart={e => {
          draggedItemRef.current = 'newClass';
        }}
      /> */}
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
            {classDefinitions && classDefinitions.map((classDefinition, index) => {
              return <Class key={index} x={classDefinition.x} y={classDefinition.y} onDragend={handleDragEnd(index)} />
            })}

            {/* <Class x={450} y={20} onDragmove={e => setLinePoints(e)} />
            <Class x={900} y={400} onDragmove={() => setLinePoints([460, 30, 900, 400])} /> */}
            <Arrow
              points={linePoints}
              fill='white'
              stroke='black'
              strokeWidth={1} 
              draggable
            />

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