import React, { useState, useEffect } from 'react';
import { Modal, Paper, Button, 
  Select, MenuItem, Grid } from '@material-ui/core';
import { getModalStyle, colors } from '../utils/utils'

const RelationEditor = props => {
  const [behavior, setBehavior] = useState(() => state => state)

  const handleClose = () => props.handleClose(behavior)

  const selectStyle = {
    width: "100%"
  }
  
  return (
    <Modal open={true} onClose={handleClose}>
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
              value={3}
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
              value={3}
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