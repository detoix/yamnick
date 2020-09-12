import React, { useState, useRef, useEffect } from 'react';
import { withRouter } from 'react-router-dom'  
import { Stage, Layer, Image } from 'react-konva';
import useImage from 'use-image';

const URLImage = ({ image }) => {
  const [img] = useImage(image.src);
  return (
    <Image
      image={img}
      x={image.x}
      y={image.y}
      // I will use offset to set origin to the center of the image
      offsetX={img ? img.width / 2 : 0}
      offsetY={img ? img.height / 2 : 0}
    />
  );
};

const Home = ({socket}) => {
  const dragUrl = useRef();
  const stageRef = useRef();
  const [images, setImages] = useState([]);

  useEffect(() => {
    socket.on("diagram_persisted", data => setImages(JSON.parse(data).positions))   

    return () => socket.off('diagram_persisted')
  });

  useEffect(() => {
    socket.emit("diagram_queried", JSON.stringify({
            queryForDiagram: { }
          }))
  }, []);

  const onDrop = e => {
    // register event position
    stageRef.current.setPointersPositions(e);

    let request = {
      diagram: 
      {
        positions: images.concat([
          {
            ...stageRef.current.getPointerPosition(),
            src: "https://konvajs.org/assets/lion.png"
          }
        ])
      }
    }

    socket.emit("diagram_changed", JSON.stringify(request))
  }

  return (
    <div>
      Try to trag and image into the stage:
      <br />
      <img
        alt="lion"
        src="https://konvajs.org/assets/lion.png"
        draggable="true"
        onDragStart={e => {
          dragUrl.current = e.target.src;
        }}
      />
      <div
        onDrop={e => onDrop(e)}
        onDragOver={e => e.preventDefault()}
      >
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          style={{ border: '1px solid grey' }}
          ref={stageRef}
        >
          <Layer>
            {images.map(image => {
              return <URLImage image={image} />;
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default withRouter(Home)


// import React, { useState, useEffect } from 'react';
// import { Link, withRouter } from 'react-router-dom'   
// import { Button, FormControl, InputLabel, Input,
//   IconButton, Card, CardContent, CardActions,
//   FormGroup, Grid, Typography} from '@material-ui/core';
// import { Delete, Launch } from '@material-ui/icons'
// import { useStyles } from "../utils/useStyles";
// import { Stage, Layer, Image } from 'react-konva';
// import Konva from 'konva';

// import {
//   mxGraph,
//   mxEditor,
//   mxGeometry,
//   mxStylesheet,
//   mxDefaultKeyHandler,
//   mxDefaultPopupMenu,
//   mxDefaultToolbar,
//   mxGraphHandler,
//   mxGraphModel,
// } from "mxgraph";

// const URLImage = ({ image }) => {
//   const [img] = useImage(image.src);
//   return (
//     <Image
//       image={img}
//       x={image.x}
//       y={image.y}
//       // I will use offset to set origin to the center of the image
//       offsetX={img ? img.width / 2 : 0}
//       offsetY={img ? img.height / 2 : 0}
//     />
//   );
// };

// const Home = ({socket}) => {
//   const [queriesData, setQueriesData] = useState(null)
//   const [startUrl, setStartUrl] = useState('https://www.bankier.pl/wiadomosc/95')
//   const [follow, setFollow] = useState('a.next.btn, span.entry-title a')
//   const [collect, setCollect] = useState('span.entry-title, span.lead')
//   const [color, setColor] = useState('green')
//   const classes = useStyles();






//   useEffect(() => {
//     socket
//       .on("response_received", data => {
//         setQueriesData(JSON.parse(data))
//       })
//       .emit("query_issued", JSON.stringify({
//         queryForUser: { }
//       }))





//     return () => socket.off('response_received')
//   }, []);

//   const handleSubmit = () => {
//     let crawlRequest = {
//       crawlCommand: 
//       {
//         startUrl: startUrl,
//         follow: follow.split(','),
//         collect: collect.split(',')
//       }
//     }

//     socket.emit("query_issued", JSON.stringify(crawlRequest))
//   }

//   const handleClick = () => {
//     console.log('dd')
//   };

//   const remove = id => {
//     let removeQuery = {
//       removeQuery: 
//       {
//         id: id
//       }
//     }
//     socket.emit("query_issued", JSON.stringify(removeQuery))
//   }


//   const dragUrl = React.useRef();
//   const stageRef = React.useRef();
//   const [images, setImages] = React.useState([]);


  


//   return (

//     <div>
//       Try to trag and image into the stage:
//       <br />


//       {/* <Rect
//         x={20}
//         y={20}
//         width={50}
//         height={50}
//         draggable="true"
//         onDragStart={e => {
//           dragUrl.current = e.target.src;
//         }}
//       /> */}

//       <img
//         alt="lion"
//         src="https://konvajs.org/assets/lion.png"
//         draggable="true"
//         onDragStart={e => {
//           dragUrl.current = e.target.src;
//         }}
//       />
//       <div
//         onDrop={e => {
//           // register event position
//           stageRef.current.setPointersPositions(e);
//           // add image
//           setImages(
//             images.concat([
//               {
//                 ...stageRef.current.getPointerPosition(),
//                 src: dragUrl.current
//               }
//             ])
//           );
//         }}
//         onDragOver={e => e.preventDefault()}
//       >
//         <Stage
//           width={window.innerWidth}
//           height={window.innerHeight}
//           style={{ border: '1px solid grey' }}
//           ref={stageRef}
//         >
//           <Layer>
//             {images.map(image => {
//               return <URLImage image={image} />;
//             })}
//           </Layer>
//         </Stage>
//       </div>
//     </div>

//     // <Grid container spacing={2}>
//     //   <Grid item xs={6}>
//     //     <Card>
//     //       <CardContent>
//     //       <Stage width={window.innerWidth} height={window.innerHeight}>
//     //     <Layer>
//     //       <Text text="Try click on rect" />
//     //       <Rect
//     //     x={20}
//     //     y={20}
//     //     width={50}
//     //     height={50}
//     //     fill={color}
//     //     onClick={handleClick}
//     //   />
//     //     </Layer>
//     //   </Stage>

//     //   <div id='xdd' />

         
//     //       </CardContent>
//     //     </Card>
//     //   </Grid>

//     //   {queriesData && queriesData.queriesWithResults.map(queryWithResults => 
//     //     <Grid item xs={6} key={queryWithResults.id}>
//     //       <Card>
//     //         <CardContent>
//     //           <Typography color="textSecondary" gutterBottom>
//     //             Query No {queryWithResults.id}
//     //           </Typography>
//     //           <Typography variant="h5" component="h2">
//     //             Started on {queryWithResults.startUrl}
//     //           </Typography>
//     //           <Typography color="textSecondary">
//     //             Results from {queryWithResults.crawlResults.length} runs
//     //           </Typography>
//     //         </CardContent>
//     //         <CardActions>
//     //           <Link to={'/query/' + queryWithResults.id}>
//     //             <IconButton>
//     //               <Launch />
//     //             </IconButton>
//     //           </Link>
//     //           <IconButton onClick={() => remove(queryWithResults.id)}>
//     //             <Delete />
//     //           </IconButton>
//     //         </CardActions>
//     //       </Card>
//     //     </Grid>
//     //   )}
//     // </Grid>
//   );
// }

// export default withRouter(Home)