import React, { useState, useEffect } from 'react';
import { Modal, Paper, Box, Button, TextField, 
  Select, MenuItem } from '@material-ui/core';
import { images, colors, entityMemberRowHeight } from '../utils/Consts'

const EntityEditor = props => {
  const [activeImageId, setActiveImageId] = useState(props.editable.imageId) //required to keep select value up-to-date
  const [activeColor, setActiveColor] = useState(props.editable.color) //required to keep select value up-to-date
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

  const handleColorChange = e => {
    setActiveColor(e.target.value) //required to keep select value up-to-date

    let newValue = e.target.value
    let newBehavior = state => {
      let newState = behavior(state)
      newState.color = newValue

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
        <Box
          display="flex"
          flexWrap="nowrap"
          alignItems="center"
        >
          <Box m={1}>
            <TextField 
              id="name"
              label="Name" 
              fullWidth
              variant="outlined"
              defaultValue={props.editable.name} 
              onChange={handleNameChange} />
          </Box>
          <Box m={1}>
            <Select
              value={activeColor}
              onChange={handleColorChange}
              variant="outlined"
              SelectDisplayProps={{ "data-testid": "color-selector" }}
            >
              {colors.map((color, index) => 
                <MenuItem value={index} key={index}>
                  <Button style={{ backgroundColor: color, color: color }}>{color}</Button>
                </MenuItem> 
              )}
            </Select>
          </Box>
          <Box m={1}>
            <Select
              value={activeImageId}
              onChange={handleImageChange}
              variant="outlined"
              SelectDisplayProps={{ "data-testid": "image-selector" }}
              MenuProps={{ "data-testid": "image-option"}}
            >
              {images.map((image, index) => 
                <MenuItem value={index} key={index}><img src={image} height={25} width={25} />{image}</MenuItem> 
              )}
            </Select>
          </Box>
        </Box>
        <Box
          display="flex"
          flexWrap="nowrap"
        >
          <Box m={1} flexGrow={1}>
            <TextField
              id="members"
              label="Members"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              defaultValue={props.editable.members && props.editable.members.length 
                ? props.editable.members.map(e => e.name).reduce((prev, curr) => prev + ("\n") + curr)
                : null}
              onChange={handleMembersChange} />
          </Box>
        </Box>
      </Paper>
    </Modal>
  )
}

export default EntityEditor