import React from 'react';
import { render, fireEvent, createEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/extend-expect'
import Entity from '../client/components/Entity'
import ExtendedEntity from '../client/components/ExtendedEntity'

test('pushes new position when dragged', () => {
  let result = {}
  let originalState = new ExtendedEntity({})

  const { container } = render(
    <Entity 
      state={originalState} 
      commitUpdate={clone => result = clone}
    />)

  const group = container.querySelector('group')

  let newPosition = {
    x: 9.1,
    y: 9.9
  }

  fireEvent['dragEnd'](group, {
    target: {
      attrs: newPosition
    }
  })

  expect(result).toMatchObject(newPosition)
})

test('resizes and keeps ratio when resize node dragged', () => {
  let result = {}
  let originalState = new ExtendedEntity({
    nameSectionHeight: 25,
    membersSectionHeight: 75,
  })

  const { container } = render(
    <Entity 
      state={originalState} 
      commitUpdate={clone => result = clone}
    />)

  const resizeNode = container.querySelector('circle[draggable]')

  let newPosition = {
    x: 140,
    y: 200,
    resizeNode: true
  }

  fireEvent['dragEnd'](resizeNode, {
    target: {
      attrs: newPosition
    }
  })

  expect(result).toMatchObject({
    nameSectionHeight: 50,
    membersSectionHeight: 150,
    width: 140
  })
})

test('opens context menu when event fires', () => {
  let originalState = new ExtendedEntity({})
  let onContextMenu = jest.fn()

  const { container } = render(
    <Entity 
      state={originalState} 
      onContextMenu={onContextMenu}
    />)

  const group = container.querySelector('group')

  fireEvent['contextMenu'](group)

  expect(onContextMenu).toHaveBeenCalledTimes(1)
})

// test('removes entity when clicked with shift', () => {
//   //TODO
// })

// test('opens editor when clicked double time', () => {
//   //TODO
// })