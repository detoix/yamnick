import React, { useState, useRef, useEffect } from 'react';
import { withRouter } from 'react-router-dom'  
import { Stage, Layer, Image, Line, Arrow } from 'react-konva';
import Class from './Class'
import Relation from './Relation'

const Home = ({socket}) => {
  const draggedItemRef = useRef()
  const stageRef = useRef()
  const [entities, setEntities] = useState([])
  const [relations, setRelations] = useState([])

  useEffect(() => {
    socket.on("diagram_persisted", data => {
      let content = JSON.parse(data)
      setEntities(content.classDefinitions)
      setRelations(content.relations)
    })   

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
    
    let dropPosition = stageRef.current.getPointerPosition()

    let upToDateEntities = (entities ?? []).concat(draggedItemRef.current != 'entity' ? [] : [dropPosition])

    let upToDateRelations = (relations ?? []).concat(draggedItemRef.current != 'relation' ? [] : [
      {
        start: {
          point: {
            x: dropPosition.x - 50,
            y: dropPosition.y - 50
          }
        },
        end: {
          point: {
            x: dropPosition.x + 50,
            y: dropPosition.y + 50
          }
        }
      }
    ])
    
    let request = {
      diagram: 
      {
        classDefinitions: upToDateEntities,
        relations: upToDateRelations
      }
    }

    socket.emit("request_issued", JSON.stringify(request))
  }

  const handleEntityDragEnd = index => e => {
    let newState = [...entities]; // copying the old datas array
    newState[index] = e

    let request = {
      diagram: 
      {
        classDefinitions: newState,
        relations: relations
      }
    }

    socket.emit("request_issued", JSON.stringify(request))
  }

  const handleRelationDragEnd = index => e => {
    let newState = [...relations]; // copying the old datas array
    newState[index] = e

    let request = {
      diagram: 
      {
        classDefinitions: entities,
        relations: newState
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
          draggedItemRef.current = 'entity';
        }}
      />
      <img
        alt="lion"
        src="https://konvajs.org/assets/lion.png"
        draggable="true"
        onDragStart={e => {
          draggedItemRef.current = 'relation';
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
            {entities && entities.map((classDefinition, index) => 
              <Class 
                key={index} 
                id={classDefinition.id}
                x={classDefinition.x} 
                y={classDefinition.y} 
                onDragEnd={handleEntityDragEnd(index)} />)}

            {relations && relations.map((relation, index) => 
              <Relation 
                key={index} 
                id={relation.id}
                start={relation.start}
                end={relation.end}
                points={[relation.start.point.x, relation.start.point.y, relation.end.point.x, relation.end.point.y]}
                entities={entities}
                onDragEnd={handleRelationDragEnd(index)} />)}

          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default withRouter(Home)