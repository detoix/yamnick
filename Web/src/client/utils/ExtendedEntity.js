import { snapPointRadius } from './Consts'

function ExtendedEntity(wrappee) {
  this.id = wrappee.id
  this.name = wrappee.name
  this.imageId = Number(wrappee.imageId)
  this.members = wrappee.members
  this.x = wrappee.x
  this.y = wrappee.y
  this.nameSectionHeight = wrappee.nameSectionHeight
  this.membersSectionHeight = wrappee.membersSectionHeight
  this.width = wrappee.width

  this.height = () => this.nameSectionHeight + this.membersSectionHeight

  this.edgePoints = () => [
    {x: this.x, y: this.y, direction: 'default'},
    {x: this.x + this.width / 2, y: this.y, direction: 'default'},
    {x: this.x + this.width, y: this.y, direction: 'default'},
    {x: this.x + this.width, y: this.y + this.height() / 2, direction: 'e-resize'},
    {x: this.x + this.width, y: this.y + this.height(), direction: 'default'},
    {x: this.x + this.width / 2, y: this.y + this.height(), direction: 's-resize'},
    {x: this.x, y: this.y + this.height(), direction: 'default'},
    {x: this.x, y: this.y + this.height() / 2, direction: 'default'}
  ]

  this.pointCloseTo = (x, y) => {
    let tmpEdgePoints = this.edgePoints()
    let result = tmpEdgePoints.find(
      point => this.pointIsInSnapArea(x, y, point.x, point.y))
    let indexOfResult = tmpEdgePoints.indexOf(result);

    return [result, indexOfResult]
  }
  
  this.pointIsInSnapArea = (pointX, pointY, circleX, circleY) => {
    let radius = snapPointRadius
    let dist_points = (pointX - circleX) * (pointX - circleX) + (pointY - circleY) * (pointY - circleY);
    radius *= radius;
    if (dist_points < radius) {
        return true;
    }
    return false;
  }
}

export default ExtendedEntity