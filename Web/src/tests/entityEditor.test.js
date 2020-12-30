import React from 'react';
import { render, fireEvent, queryHelpers, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/extend-expect'
import { colors } from '../client/utils/Consts'
import EntityEditor from '../client/components/EntityEditor'
import ExtendedEntity from '../client/components/ExtendedEntity'

test('prepares complex function to change entity', () => {
  let result = {}
  let originalState = new ExtendedEntity({
    imageId: 2,
    color: 2
  })

  const { container } = render(
    <EntityEditor 
      editable={originalState} 
      handleClose={behavior => result = behavior(originalState)}
    />)

  let expected = {
    name: 'test name',
    members: [{name: 'test member'}],
    color: 3,
    imageId: 1
  }

  fireEvent.change(
    screen.getByLabelText("Name"),
    { target: { value: expected.name } }
  )

  fireEvent.change(
    screen.getByLabelText("Members"),
    { target: { value: expected.members[0].name } }
  )

  fireEvent.mouseDown(screen.getByTestId("color-selector"))
  fireEvent.click(screen.getByText(colors[expected.color]))

  fireEvent.mouseDown(screen.getByTestId("image-selector"))
  within(screen.getByTestId("image-option"))
    .getAllByRole("option")
    .slice(expected.imageId, expected.imageId + 1)
    .forEach(e => fireEvent.click(e))

  screen.getAllByRole('presentation')
    .forEach(e => fireEvent.click(e.firstChild)) //removes focus, quits the editor

  expect(result).toMatchObject(expected)
})