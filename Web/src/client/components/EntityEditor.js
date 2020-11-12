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
        <TextField 
          label="Name" 
          fullWidth
          defaultValue={props.editable.name} 
          onChange={handleNameChange} />
        <TextField
          label="Members"
          fullWidth
          multiline
          rows={4}
          defaultValue={(props.editable.members ?? [{name: ''}]).map(e => e.name).reduce((prev, curr) => prev + ("\n") + curr)}
          onChange={handleMembersChange} />
      </Paper>
    </Modal>
  )
}

export default EntityEditor