import React, { useState, useRef, useEffect } from 'react';
import { withRouter, useParams } from 'react-router-dom'  
import { Stage, Layer, Circle } from 'react-konva';
import { Toolbar, Button, Menu, MenuItem } from '@material-ui/core';
import { Class, ArrowRightAlt, GetApp } from '@material-ui/icons'
import { downloadURI, snapPointVisibleRadius, randomColor } from '../utils/utils'
import Entity from './Entity'
import EntityEditor from './EntityEditor'
import Relation from './Relation'
import ExtendedEntity from './ExtendedEntity'
import RelationEditor from './RelationEditor'

const Home = ({socket}) => {
  const { id } = useParams()
  const draggedItemRef = useRef()
  const stageRef = useRef()
  const [color] = useState(randomColor())
  const [participants, setParticipants] = useState([])
  const [entities, setEntities] = useState([])
  const [relations, setRelations] = useState([])
  const [MaybeEditor, setEditor] = useState(() => props => null)
  const [MaybeMenu, setMaybeMenu] = useState(() => props => null)

  useEffect(() => {
    socket.on("DIAGRAM_PERSISTED", data => {
      if (data.id == id) {
        if (data.entities && data.relations) {
          setEntities(data.entities
            .map(e => new ExtendedEntity(e)))
            setRelations(data.relations)
        } else if (data.pointerMoved && data.pointerMoved.color != color) {
          let copy = [...participants]
          let index = copy.findIndex(e => e.color == data.pointerMoved.color)

          if (index > -1) { 
            copy[index] = data.pointerMoved
          } else {
            copy.push(data.pointerMoved)
          }

          setParticipants(copy)
        }
      } else if (!data.id) {
        setEntities([])
        setRelations([])
      }
    })   

    return () => socket.off('DIAGRAM_PERSISTED')
  });

  useEffect(() => {
    socket.emit("REQUEST_ISSUED", JSON.stringify({ queryForDiagram: { id: id } }))
  }, [id]);

  const pushDiagramWith = (upToDateEntities, upToDateRelations) => {
    let request = {
      diagram: 
      {
        id: id,
        entities: upToDateEntities,
        relations: upToDateRelations
      }
    }

    socket.emit("REQUEST_ISSUED", JSON.stringify(request))
  }

  const handleDrop = e => {
    
    // register event position
    stageRef.current.setPointersPositions(e);
    
    let dropPosition = stageRef.current.getPointerPosition()

    let upToDateEntities = (entities ?? []).concat(draggedItemRef.current != 'entity' ? [] : [
      {
        imageId: 0,
        color: 0,
        x: dropPosition.x,
        y: dropPosition.y,
        nameSectionHeight: 50,
        membersSectionHeight: 0,
        width: 150
      }
    ])

    let upToDateRelations = (relations ?? []).concat(draggedItemRef.current != 'relation' ? [] : [
      {
        nodes: [
          {
            point: {
              x: dropPosition.x - 50,
              y: dropPosition.y - 50
            }
          },
          {
            point: {
              x: dropPosition.x + 50,
              y: dropPosition.y + 50
            }
          }
        ]
      }
    ])

    pushDiagramWith(upToDateEntities, upToDateRelations)
  }

  const renderEntityEditor = entity => {
    setEditor(() => props => {
      return <EntityEditor
        editable={entity}
        handleClose={behavior => props.updateEntity(behavior, entity)}
      />
    })
  }

  const renderRelationEditor = relation => {
    setEditor(() => props => {
      return <RelationEditor
        editable={relation}
        handleClose={behavior => props.updateRelation(behavior, relation)}
      />
    })
  }

  const renderMenu = (e, actions) => {
    e.evt.preventDefault();

    setMaybeMenu(() => props => {
      return <Menu
        keepMounted
        anchorReference="anchorPosition"
        anchorPosition={{ top: e.evt.y, left: e.evt.x }}
        open={true}
        onClose={() => setMaybeMenu(() => props => null)}
        >
          {actions && actions.map((action, i) => 
            <MenuItem key={i} onClick={() => {
                action.invoke()
                setMaybeMenu(() => props => null)
              }}>
              {action.description}
            </MenuItem>)}
        </Menu>
    })
  }

  const updateEntity = entity => {
    let upToDateEntities = [...entities]; // copying the old datas array
    let indexOfEntity = entities.findIndex(e => e.id == entity.id)
    upToDateEntities[indexOfEntity] = entity

    pushDiagramWith(upToDateEntities, relations)
  }

  const updateRelation = (index, e) => {
    let upToDateRelations = [...relations]; // copying the old datas array
    upToDateRelations[index] = e

    pushDiagramWith(entities, upToDateRelations)
  }

  const arrangeEntities = (insertFunction, entity) => {
    let indexOfEntity = entities.findIndex(e => e.id == entity.id)
    let upToDateEntities = [...entities]; // copying the old datas array
    upToDateEntities.splice(indexOfEntity, 1)
    insertFunction(upToDateEntities, entity)
    pushDiagramWith(upToDateEntities, relations)
  }

  const handleWheel = e => {
    if (e.evt.ctrlKey) {
      e.evt.preventDefault()

      let scaleBy = 1.03
      let stage = e.target.getStage()
      let oldScale = stage.scaleX()
      let mousePointTo = {
        x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
        y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
      }
      let newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy

      stage.scaleX(newScale)
      stage.scaleY(newScale)
      stage.x(-(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale)
      stage.y(-(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale)
      stage.draw()
    }
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
        <Button
          disableRipple={true}
          onClick={e => downloadURI(stageRef.current.toDataURL())}>
          <GetApp />
          Diagram
        </Button>
      </Toolbar>
      <MaybeEditor 
        updateEntity={(behavior, entity) => {
          let indexOfEntity = entities.findIndex(e => e.id == entity.id)
          let entityToUpdate = behavior(entities[indexOfEntity])

          updateEntity(entityToUpdate)
          setEditor(() => props => null)
        }}
        updateRelation={(behavior, relation) => {
          let start = relation.nodes[0].point
          let end = relation.nodes[relation.nodes.length - 1].point
          let indexOfRelation = relations.filter(e => e.nodes).findIndex(e => 
            (e.nodes[0].point.x == start.x 
              && e.nodes[0].point.y == start.y) 
            || (e.nodes[relation.nodes.length - 1].point.x == end.x 
              && e.nodes[relation.nodes.length - 1].point.y == end.y))
          let relationToUpdate = behavior(relations[indexOfRelation])

          updateRelation(indexOfRelation, relationToUpdate)
          setEditor(() => props => null)
        }}
      />
      <MaybeMenu />
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
          onMouseMove={() => {
            let pointerPosition = stageRef.current.getPointerPosition();
            let request = {
              id: id,
              pointerMoved: {
                x: pointerPosition.x,
                y: pointerPosition.y,
                color: color
              }
            }
        
            socket.emit("REQUEST_ISSUED", JSON.stringify(request))
          }}
          onWheel={handleWheel}
        >
          <Layer>
            {entities && entities.map((entity, index) => 
              <Entity
                key={index} 
                state={entity}
                onContextMenu={e => renderMenu(e, [
                  {invoke: () => arrangeEntities((array, item) => { }, entity), description: 'Delete' },
                  {invoke: () => arrangeEntities((array, item) => array.push(item), entity), description: 'To Front'},
                  {invoke: () => arrangeEntities((array, item) => array.unshift(item), entity), description: 'To Back'}
                ])}
                openModal={() => renderEntityEditor(entity)}
                commitUpdate={updateEntity}
                localUpdate={resizedEntity => {
                  let upToDateEntities = [...entities]
                  upToDateEntities[index] = new ExtendedEntity(resizedEntity)
                  setEntities(upToDateEntities)
                }}
                commitRemove={() => arrangeEntities((array, item) => { }, entity)} />)}

            {relations && relations.map((relation, index) => 
              <Relation
                key={index} 
                state={relation}
                onContextMenu={renderMenu}
                entities={entities}
                openModal={() => renderRelationEditor(relation)}
                commitUpdate={rel => updateRelation(index, rel)}
                localUpdate={result => {
                  let upToDateRelations = [...relations]
                  upToDateRelations[index] = result
                  setRelations(upToDateRelations)
                }}
                commitRemove={() => {
                  let upToDateRelations = [...relations]; // copying the old datas array
                  upToDateRelations.splice(index, 1)
                  pushDiagramWith(entities, upToDateRelations)
                }} 
              />)}

            {participants && participants.map((participant, index) =>
              <Circle
                key={index}
                x={participant.x} 
                y={participant.y} 
                fill={participant.color} 
                radius={snapPointVisibleRadius}
              />)}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default withRouter(Home)