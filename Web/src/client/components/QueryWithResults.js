import React, { useState, useEffect } from 'react';
import { withRouter, useParams } from 'react-router-dom'   
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Box, Grid } from '@material-ui/core';
import { Delete, Replay } from '@material-ui/icons'

const QueryWithResult = ({socket}) => {
  const { id } = useParams()
  const [queryData, setQueryData] = useState(null)

  useEffect(() => {
    socket
      .on("response_received", data => {
        let result = JSON.parse(data)
          .queriesWithResults
          .find(query => query.id == id)
        setQueryData(result)
      })
      .emit("query_issued", JSON.stringify({
        queryForUser: { }
      }))

    return () => socket.off('response_received')
  }, []);

  const runCrawlAgain = id => {
    let crawlRequest = {
      crawlCommand: 
      {
        id: id
      }
    }
    socket.emit("query_issued", JSON.stringify(crawlRequest))
  }

  return queryData && (
    <Box>
      <h2>Query [{queryData.id}], started on {queryData.startUrl}</h2>

      <IconButton onClick={() => runCrawlAgain(queryData.id)}>
        <Replay />
      </IconButton>

      <IconButton onClick={() => remove(queryData.id)}>
        <Delete />
      </IconButton>

      <Grid container spacing={2}>
        {queryData.crawlResults && queryData.crawlResults.map((crawl, index) => 
          <Grid item xs={6} key={index}>
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
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default withRouter(QueryWithResult)