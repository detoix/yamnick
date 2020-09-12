import React, { useState, useRef, useEffect } from 'react';
import { withRouter } from 'react-router-dom'  
import { Stage, Layer, Image } from 'react-konva';
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
  const dragUrl = useRef();
  const stageRef = useRef();
  const [images, setImages] = useState([]);

  useEffect(() => {
    socket.on("diagram_persisted", data => setImages(JSON.parse(data).positions))   

    return () => socket.off('diagram_persisted')
  });

  useEffect(() => {
    socket.emit("request_issued", JSON.stringify({
            queryForDiagram: { }
          }))
  }, []);

  const onDrop = e => {
    // register event position
    stageRef.current.setPointersPositions(e);

    let request = {
      diagram: 
      {
        positions: images.concat([
          {
            ...stageRef.current.getPointerPosition(),
            src: "https://konvajs.org/assets/lion.png"
          }
        ])
      }
    }

    socket.emit("request_issuedtrue", JSON.stringify(request))
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
          dragUrl.current = e.target.src;
        }}
      />
      <div
        onDrop={e => onDrop(e)}
        onDragOver={e => e.preventDefault()}
      >
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          style={{ border: '1px solid grey' }}
          ref={stageRef}
        >
          <Layer>

            <Class x={450} y={20} />
            <Class x={900} y={400} />

            {images.map(image => {
              return <URLImage image={image} />;11
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default withRouter(Home)