import React, { useState, useEffect } from 'react';
import { Grid, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, TablePagination, Paper } from '@material-ui/core';

const CrawlResultsTable = (props) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return props.crawl && (
    <Grid item xs={6}>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>On</TableCell>
              <TableCell align="right">Found</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.crawl.results && props.crawl.results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((result, index) => 
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
        count={props.crawl.results.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Grid>
  )
}

export default CrawlResultsTable