import React, { useState, useEffect } from 'react';
import { withRouter, useParams } from 'react-router-dom'   
import { IconButton, Box, Grid, Typography,
  Card, CardContent } from '@material-ui/core';
import { Delete, Replay } from '@material-ui/icons'
import CrawlResultsTable from './CrawlResultsTable';

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

  const remove = id => {
    let removeQuery = {
      removeQuery: 
      {
        id: id
      }
    }
    socket.emit("query_issued", JSON.stringify(removeQuery))
  }

  return queryData && (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography color="textSecondary" gutterBottom>
            Query No {queryData.id}
          </Typography>
          <Typography variant="h5" component="h2">
            Starts on {queryData.startUrl}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            Follows {queryData.follow}, collects {queryData.collect}
          </Typography>
          <IconButton onClick={() => runCrawlAgain(queryData.id)}>
            <Replay />
          </IconButton>
          <IconButton onClick={() => remove(queryData.id)}>
            <Delete />
          </IconButton>
        </Grid>

        {queryData.crawlResults && queryData.crawlResults.map((crawl, index) => 
          <CrawlResultsTable key={index} crawl={crawl} />
        )}
      </Grid>
    </Box>
  )
}

export default withRouter(QueryWithResult)