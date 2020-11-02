import React, { useState, useEffect } from 'react';
import { Modal, Paper, TextField } from '@material-ui/core';

const EntityEditor = props => {
  const [state, setState] = useState({...props.editable})

  const handleClose = () => props.handleClose(state)
  
  const handleNameChange = e => {
    let newState = state
    newState.name = e.target.value
    setState(newState)
  }

  const getModalStyle = () => {
    const top = 50;
    const left = 50;
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
      position: 'absolute'
    };
  }

  return (
    <Modal open={true} onClose={handleClose}>
      <Paper style={getModalStyle()}>
        <TextField 
          label="Entity name" 
          fullWidth
          defaultValue={props.editable.name} 
          onChange={handleNameChange} />
        <TextField
          label="Multiline"
          fullWidth
          multiline
          rows={4}
          defaultValue="Default Value"
        />
      </Paper>
    </Modal>
  )
}

export default EntityEditor