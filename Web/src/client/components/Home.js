import React, { useState, useEffect } from 'react';
import { Link, withRouter } from 'react-router-dom'   
import { Button, FormControl, InputLabel, Input,
  IconButton, Card, CardContent, CardActions,
  FormGroup, Grid, Typography} from '@material-ui/core';
import { Delete, Launch } from '@material-ui/icons'
import { useStyles } from "../utils/useStyles";

const Home = ({socket}) => {
  const [queriesData, setQueriesData] = useState(null)
  const [startUrl, setStartUrl] = useState('https://www.bankier.pl/wiadomosc/95')
  const [follow, setFollow] = useState('a.next.btn, span.entry-title a')
  const [collect, setCollect] = useState('span.entry-title, span.lead')
  const classes = useStyles();

  useEffect(() => {
    socket
      .on("response_received", data => {
        setQueriesData(JSON.parse(data))
      })
      .emit("query_issued", JSON.stringify({
        queryForUser: { }
      }))

    return () => socket.off('response_received')
  }, []);

  const handleSubmit = () => {
    let crawlRequest = {
      crawlCommand: 
      {
        startUrl: startUrl,
        follow: follow.split(','),
        collect: collect.split(',')
      }
    }

    socket.emit("query_issued", JSON.stringify(crawlRequest))
  }

  const remove = id => {
    let removeQuery = {
      removeQuery: 
      {
        id: id
      }
    }
    socket.emit("query_issued", JSON.stringify(removeQuery))
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Card>
          <CardContent>
            <FormGroup className={classes.root}>
              <FormControl>
                <InputLabel>Start crawling on</InputLabel>
                <Input value={startUrl} onChange={e => setStartUrl(e.target.value)} />
              </FormControl>
              <FormControl>
                <InputLabel>Follow</InputLabel>
                <Input value={follow} onChange={e => setFollow(e.target.value)} />
              </FormControl>
              <FormControl>
                <InputLabel>Collect</InputLabel>
                <Input value={collect} onChange={e => setCollect(e.target.value)} />
              </FormControl>
              <Button variant="contained" color="primary" onClick={() => handleSubmit()}>Submit</Button>
            </FormGroup>
          </CardContent>
        </Card>
      </Grid>

      {queriesData && queriesData.queriesWithResults.map(queryWithResults => 
        <Grid item xs={6} key={queryWithResults.id}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Query No {queryWithResults.id}
              </Typography>
              <Typography variant="h5" component="h2">
                Started on {queryWithResults.startUrl}
              </Typography>
              <Typography color="textSecondary">
                Results from {queryWithResults.crawlResults.length} runs
              </Typography>
            </CardContent>
            <CardActions>
              <Link to={'/query/' + queryWithResults.id}>
                <IconButton>
                  <Launch />
                </IconButton>
              </Link>
              <IconButton onClick={() => remove(queryWithResults.id)}>
                <Delete />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}

export default withRouter(Home)