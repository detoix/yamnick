import React, { useState, useEffect } from 'react';
import { withRouter, useParams } from 'react-router-dom'   
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, Box, Grid, Typography } from '@material-ui/core';
import { Delete, Replay } from '@material-ui/icons'

const QueryWithResult = ({socket}) => {
  const { id } = useParams()
  const [queryData, setQueryData] = useState(null)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return queryData && (
    <Box>
      <Typography color="textSecondary" gutterBottom>
        Query No {queryData.id}
      </Typography>
      <Typography variant="h5" component="h2">
        Started on {queryData.startUrl}
      </Typography>
      <IconButton onClick={() => runCrawlAgain(queryData.id)}>
        <Replay />
      </IconButton>
      <IconButton onClick={() => remove(queryData.id)}>
        <Delete />
      </IconButton>
      <Grid container spacing={2}>
        {queryData.crawlResults && queryData.crawlResults.map((crawl, index) => 
          <Grid item xs={6} key={index}>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>On</TableCell>
                    <TableCell align="right">Found</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {crawl.results && crawl.results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((result, index) => 
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">{result.on}</TableCell>
                      <TableCell align="right">{result.found.substring(0, 100)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={crawl.results.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default withRouter(QueryWithResult)