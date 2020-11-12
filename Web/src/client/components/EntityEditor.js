import React, { useState, useEffect } from 'react';
import { Modal, Paper, Grid, TextField, 
  Select, InputLabel, MenuItem } from '@material-ui/core';
import { images } from '../utils/Consts'

const EntityEditor = props => {
  const [state, setState] = useState({...props.editable})
  const [activeImageId, setActiveImageId] = useState(props.editable.imageId) //required to keep select value up-to-date

  const handleClose = () => props.handleClose(state)
  
  const handleNameChange = e => {
    let newState = state
    newState.name = e.target.value
    setState(newState)
  }

  const handleMembersChange = e => {
    let newState = state
    newState.members = e.target.value.split(/\n/)
      .map(memberName => {
        return {
          name: memberName
        }
      })
    setState(newState)
  }

  const handleImageChange = e => {
    let newState = state
    newState.imageId = e.target.value
    setState(newState)
    setActiveImageId(e.target.value)
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
              defaultValue={(props.editable.members ?? [{name: ''}]).map(e => e.name).reduce((prev, curr) => prev + ("\n") + curr)}
              onChange={handleMembersChange} />
          </Grid>
        </Grid>
      </Paper>
    </Modal>
  )
}

export default EntityEditor