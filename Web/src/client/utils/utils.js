import lion from '../../../public/lion.png'
import dog from '../../../public/dog.png'
import duck from '../../../public/duck.png'

const snapPointRadius = 15
const snapPointVisibleRadius = 4
const entityMemberRowHeight = 15
const images = [
  null,
  lion,
  dog,
  duck
]
const colors = [
  '#ffffff',
  '#ffe6cc',
  '#d5e8d4',
  '#f8cecc',
  '#dae8fc',
  '#e1d5e7'
]

// function from https://stackoverflow.com/a/15832662/512042
const downloadURI = (uri, name) => {
  var link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

const none = "None"

const arrowFills = [
  'white',
  'black'
]

const changeCursor = (e, style) => {
  const container = e.target.getStage().container()
  container.style.cursor = style
}

export { 
  snapPointRadius, 
  snapPointVisibleRadius,
  entityMemberRowHeight,
  images,
  colors,
  arrowFills,
  none,
  downloadURI,
  getModalStyle,
  changeCursor
}