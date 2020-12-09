import React, { useState, useEffect } from 'react';
import { Modal, Paper, Grid, TextField, 
  Select, InputLabel, MenuItem } from '@material-ui/core';
import { images, entityMemberRowHeight } from '../utils/Consts'

const EntityEditor = props => {
  const [activeImageId, setActiveImageId] = useState(props.editable.imageId) //required to keep select value up-to-date
  const [behavior, setBehavior] = useState(() => state => state)

  const handleClose = () => props.handleClose(behavior)
  
  const handleNameChange = e => {
    let newValue = e.target.value
    let newBehavior = state => {
      let newState = behavior(state)
      newState.name = newValue

      return newState
    }

    setBehavior(() => newBehavior)
  }

  const handleMembersChange = e => {

    let newValue = e.target.value
      .split(/\n/).filter(input => input.length)
    let newBehavior = state => {
      let newState = behavior(state)
      newState.members = newValue
        .map(memberName => {
          return {
            name: memberName
          }
        })
      newState.membersSectionHeight 
        = newState.members.length * entityMemberRowHeight + Math.sign(newState.members.length) * 5

      return newState
    }

    setBehavior(() => newBehavior)
  }

  const handleImageChange = e => {
    setActiveImageId(e.target.value) //required to keep select value up-to-date

    let newValue = e.target.value
    let newBehavior = state => {
      let newState = behavior(state)
      newState.imageId = newValue

      return newState
    }

    setBehavior(() => newBehavior)
  }

  const getModalStyle = () => {
    const top = 50;
    const left = 50;
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
      position: 'absolute',
      padding: '10px'
    };
  }

  return (
    <Modal open={true} onClose={handleClose}>
      <Paper style={getModalStyle()}>
        <Grid container spacing={1}>
          <Grid item xs={10}>
            <TextField 
              label="Name" 
              fullWidth
              variant="outlined"
              defaultValue={props.editable.name} 
              onChange={handleNameChange} />
          </Grid>
          <Grid item xs={2}>
            <Select
              value={activeImageId}
              onChange={handleImageChange}
              variant="outlined"
            >
              {images.map((image, index) => 
                <MenuItem value={index} key={index}><img src={image} height={25} width={25} /></MenuItem> 
              )}
            </Select>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Members"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              defaultValue={props.editable.members && props.editable.members.length 
                ? props.editable.members.map(e => e.name).reduce((prev, curr) => prev + ("\n") + curr)
                : null}
              onChange={handleMembersChange} />
          </Grid>
        </Grid>
      </Paper>
    </Modal>
  )
}

export default EntityEditor