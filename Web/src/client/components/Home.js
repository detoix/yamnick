import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom'   
import { Button, FormControl, InputLabel, Input,
  IconButton, Card, CardContent, CardActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormGroup, Paper, Grid, Container } from '@material-ui/core';
import { Delete, Replay } from '@material-ui/icons'

const Home = ({socket}) => {
  const [queriesData, setQueriesData] = useState(null)
  const [startUrl, setStartUrl] = useState('https://www.bankier.pl/wiadomosc/95')
  const [follow, setFollow] = useState('a.next.btn, span.entry-title a')
  const [collect, setCollect] = useState('span.entry-title, span.lead')

  useEffect(() => {
    socket
      .on("response_received", data => {
        setQueriesData(JSON.parse(data))
      })
      .emit("query_issued", JSON.stringify({
        queryForUser: { }
      }))
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

  const runCrawlAgain = id => {
    let crawlRequest = {
      crawlCommand: 
      {
        id: id
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
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card>
            <CardContent>
              <FormGroup>
                <FormControl>
                  <InputLabel>Start url</InputLabel>
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
                <h2>Query [{queryWithResults.id}], started on {queryWithResults.startUrl}</h2>

                <IconButton onClick={() => runCrawlAgain(queryWithResults.id)}>
                  <Replay />
                </IconButton>

                <IconButton onClick={() => remove(queryWithResults.id)}>
                  <Delete />
                </IconButton>

                {queryWithResults.crawlResults && queryWithResults.crawlResults.map((crawl, index) => 
                  <span key={index}>
                    <h3>Crawl number {index}</h3>

                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Dessert (100g serving)</TableCell>
                            <TableCell align="right">Calories</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {crawl.results && crawl.results.slice(0, 3).map((result, index) => 
                            <TableRow key={index}>
                              <TableCell component="th" scope="row">{result.on}</TableCell>
                              <TableCell align="right">{result.found.substring(0, 100)}</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </span>
                )}
              </CardContent>
              <CardActions>
                <Button size="small">Learn More</Button>
              </CardActions>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default withRouter(Home)