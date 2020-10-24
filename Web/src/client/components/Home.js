import React, { useState, useRef, useEffect } from 'react';
import { withRouter, useParams } from 'react-router-dom'  
import { Stage, Layer } from 'react-konva';
import { Toolbar, Button } from '@material-ui/core';
import { Class, ArrowRightAlt } from '@material-ui/icons'
import Entity from './Entity'
import Relation from './Relation'

const Home = ({socket}) => {
  const { id } = useParams()
  const draggedItemRef = useRef()
  const stageRef = useRef()
  const [entities, setEntities] = useState([])
  const [relations, setRelations] = useState([])

  useEffect(() => {
    socket.on("diagram_persisted", data => {
      let content = JSON.parse(data)
      if (content.id === idInt()) {
        setEntities(content.classDefinitions)
        setRelations(content.relations)
      }
    })   

    return () => socket.off('diagram_persisted')
  });

  useEffect(() => {
    socket.emit("request_issued", JSON.stringify({
            queryForDiagram: { id: idInt() }
          }))
  }, [id]);

  const idInt = () => Number(id)

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
        id: idInt(),
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
        id: idInt(),
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
        id: idInt(),
        classDefinitions: entities,
        relations: newState
      }
    }

    socket.emit("request_issued", JSON.stringify(request))
  }

  return (
    <div>
      <Toolbar>
        <Button
          disableRipple={true}
          draggable="true"
          onDragStart={e => {
            draggedItemRef.current = 'entity';
          }}>
          <Class />
          Entity
        </Button>
        <Button
          disableRipple={true}
          draggable="true"
          onDragStart={e => {
            draggedItemRef.current = 'relation';
          }}>
          <ArrowRightAlt />
          Relation
        </Button>
      </Toolbar>
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
            {entities && entities.map((entity, index) => 
              <Entity 
                key={index} 
                id={entity.id}
                x={entity.x} 
                y={entity.y} 
                onDragEnd={handleEntityDragEnd(index)} />)}

            {relations && relations.map((relation, index) => 
              <Relation 
                key={index} 
                id={relation.id}
                start={relation.start}
                end={relation.end}
                entities={entities}
                onDragEnd={handleRelationDragEnd(index)} />)}

          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default withRouter(Home)