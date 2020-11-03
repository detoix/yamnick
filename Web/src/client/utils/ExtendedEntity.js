import { snapPointRadius } from './Consts'

function ExtendedEntity(wrappee) {
  this.id = wrappee.id
  this.name = wrappee.name
  this.x = wrappee.x
  this.y = wrappee.y
  this.height = 100
  this.width = 150
  this.edgePoints = [
    {x: this.x, y: this.y},
    {x: this.x + this.width / 2, y: this.y},
    {x: this.x + this.width, y: this.y},
    {x: this.x + this.width, y: this.y + this.height / 2},
    {x: this.x + this.width, y: this.y + this.height},
    {x: this.x + this.width / 2, y: this.y + this.height},
    {x: this.x, y: this.y + this.height},
    {x: this.x, y: this.y + this.height / 2}
  ]

  this.pointCloseTo = (x, y) => {
    let result = this.edgePoints.find(
      point => this.pointIsInSnapArea(x, y, point.x, point.y))
    let indexOfResult = this.edgePoints.indexOf(result);

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