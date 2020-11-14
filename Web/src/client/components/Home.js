import React, { useState, useRef, useEffect } from 'react';
import { withRouter, useParams } from 'react-router-dom'  
import { Stage, Layer } from 'react-konva';
import { Toolbar, Button } from '@material-ui/core';
import { Class, ArrowRightAlt } from '@material-ui/icons'
import Entity from './Entity'
import EntityEditor from './EntityEditor'
import Relation from './Relation'
import ExtendedEntity from '../utils/ExtendedEntity'

const Home = ({socket}) => {
  const { id } = useParams()
  const draggedItemRef = useRef()
  const stageRef = useRef()
  const [entities, setEntities] = useState([])
  const [relations, setRelations] = useState([])
  const [MaybeEntityEditor, setMaybeEntityEditor] = useState(() => props => null)

  useEffect(() => {
    socket.on("diagram_persisted", content => {
      let diagram = content.diagram
      if (diagram.id === idInt()) {
        setEntities(diagram.classDefinitions
          .map(e => new ExtendedEntity(e)))
        setRelations(diagram.relations)
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

  const pushDiagramWith = (upToDateEntities, upToDateRelations) => {
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

    pushDiagramWith(upToDateEntities, upToDateRelations)
  }

  const openRenderEntityEditor = index => e => {
    setMaybeEntityEditor(() => props => {
      return <EntityEditor
        editable={entities[index]}
        handleClose={onModalClosed}
      />
    })
  }

  const closeRenderEntityEditor = () => setMaybeEntityEditor(() => props => null)

  const onModalClosed = (entityToUpdate) => {
    let indexOfEntity = entities.findIndex(
      e => e.id == entityToUpdate.id)
    handleEntityDragEnd(indexOfEntity)(entityToUpdate)
    closeRenderEntityEditor()
  };

  const handleEntityDragEnd = index => e => {
    let upToDateEntities = [...entities]; // copying the old datas array
    upToDateEntities[index] = e

    pushDiagramWith(upToDateEntities, relations)
  }

  const removeEntity = index => e => {
    let upToDateEntities = [...entities]; // copying the old datas array
    upToDateEntities.splice(index, 1)

    pushDiagramWith(upToDateEntities, relations)
  }

  const handleRelationDragEnd = index => e => {
    let upToDateRelations = [...relations]; // copying the old datas array
    upToDateRelations[index] = e

    pushDiagramWith(entities, upToDateRelations)
  }

  const removeRelation = index => e => {
    let upToDateRelations = [...relations]; // copying the old datas array
    upToDateRelations.splice(index, 1)

    pushDiagramWith(entities, upToDateRelations)
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
      <MaybeEntityEditor />
      <div
        id="container"
        style={{ border: '1px solid grey', overflow: 'auto', height: 'calc(100vh - 180px)' }}
        onDrop={e => handleDrop(e)}
        onDragOver={e => e.preventDefault()}
      >
        <Stage
          container='container'
          width={2000}
          height={1000}
          ref={stageRef}
        >
          <Layer>
            {entities && entities.map((entity, index) => 
              <Entity 
                key={index} 
                state={entity}
                openModal={openRenderEntityEditor(index)}
                commitUpdate={handleEntityDragEnd(index)}
                commitRemove={removeEntity(index)} />)}

            {relations && relations.map((relation, index) => 
              <Relation 
                key={index} 
                id={relation.id}
                start={relation.start}
                end={relation.end}
                entities={entities}
                commitUpdate={handleRelationDragEnd(index)}
                commitRemove={removeRelation(index)} />)}

          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default withRouter(Home)