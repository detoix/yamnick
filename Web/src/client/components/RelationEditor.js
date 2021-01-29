import React, { useState, useEffect } from 'react';
import { Modal, Paper, Button, 
  Select, MenuItem, Grid } from '@material-ui/core';
import { getModalStyle, colors, arrowFills, none } from '../utils/utils'

const RelationEditor = props => {
  const [behavior, setBehavior] = useState(() => state => state)

  const handleDashChange = e => enqueueChange(state => {
    state.dash = e.target.value
    return state
  })

  const handleArrowFillChange = e => enqueueChange(state => {
    state.arrowFill = e.target.value
    return state
  })

  const handleThicknessChange = e => enqueueChange(state => {
    state.thickness = e.target.value
    return state
  })

  const enqueueChange = change => {
    let newBehavior = state => {
      let newState = change(behavior(state))

      return newState
    }

    setBehavior(() => newBehavior)
  }

  const selectStyle = {
    width: "100%"
  }

  return (
    <Modal open={true} onClose={() => props.handleClose(behavior)}>
      <Paper style={getModalStyle()}>
        <Grid container spacing={2} justify="space-evenly">
          <Grid item xs={4}>
            <Select
              style={selectStyle}
              value={4}
              // onChange={handleColorChange}
              variant="outlined"
            >
              {colors.map((color, index) => 
                <MenuItem value={index} key={index}>
                  <Button style={{ backgroundColor: color, color: color }}>{color}</Button>
                </MenuItem> 
              )}
            </Select>
          </Grid>
          <Grid item xs={4}>
            <Select
              style={selectStyle}
              value={behavior(props.editable).dash ?? none}
              onChange={handleDashChange}
              variant="outlined"
            >
              {[none, JSON.stringify([10, 5])].map((option, index) => 
                <MenuItem value={option} key={index}>
                  Dash: {option}
                </MenuItem> 
              )}
            </Select>
          </Grid>
          <Grid item xs={4}>
            <Select
              style={selectStyle}
              value={behavior(props.editable).arrowFill ?? arrowFills[0]}
              onChange={handleArrowFillChange}
              variant="outlined"
            >
              {arrowFills.map((fill, index) => 
                <MenuItem value={fill} key={index}>
                  Fill: {fill}
                </MenuItem> 
              )}
            </Select>
          </Grid>
          <Grid item xs={4}>
            <Select
              style={selectStyle}
              value={4}
              // onChange={handleColorChange}
              variant="outlined"
            >
              {colors.map((color, index) => 
                <MenuItem value={index} key={index}>
                  <Button style={{ backgroundColor: color, color: color }}>{color}</Button>
                </MenuItem> 
              )}
            </Select>
          </Grid>
          <Grid item xs={4}>
            <Select
              style={selectStyle}
              value={behavior(props.editable).thickness ?? 1}
              onChange={handleThicknessChange}
              variant="outlined"
            >
              {[1, 2, 3, 4, 5].map(index => 
                <MenuItem value={index} key={index}>
                  Thickness: {index}
                </MenuItem> 
              )}
            </Select>
          </Grid>
          <Grid item xs={4}>
            <Select
              style={selectStyle}
              value={2}
              // onChange={handleColorChange}
              variant="outlined"
            >
              {colors.map((color, index) => 
                <MenuItem value={index} key={index}>
                  <Button style={{ backgroundColor: color, color: color }}>{color}</Button>
                </MenuItem> 
              )}
            </Select>
          </Grid>
        </Grid>
      </Paper>
    </Modal>
  )
}

export default RelationEditor