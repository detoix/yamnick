import React, { useState, useEffect } from 'react';
import { withRouter, useParams, useHistory } from 'react-router-dom'   
import { CSVLink } from "react-csv";
import { Grid, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, TablePagination, Paper, IconButton,
  Card, CardContent, Tabs, Tab } from '@material-ui/core';
import { TreeView, TreeItem } from '@material-ui/lab'
import { Delete, GetApp } from '@material-ui/icons'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const CrawlResultsTable = (props) => {
  const history = useHistory();
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedRow, setExpandedRow] = useState(-1);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setExpandedRow(-1)
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setExpandedRow(-1)
  };

  const convertToCsv = () => {
    return props.crawl.results.map(crawl => [crawl.on, crawl.found])
  }

  const groupBy = function(xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  const convertToTree = list => {
    let lookup = {}
    let groups = groupBy(list, 'on')

    Object.keys(groups).forEach(key => {
      let group = groups[key]
      let occurrence = group[0]

      let node = {
        "address": occurrence.on,
        "messages": []
      }

      group.forEach(e => {
        node.messages.push(e.found)
      })

      lookup[occurrence.on] = node

      if (occurrence.from in lookup) {
        let parent = lookup[occurrence.from]
        if ("children" in parent) {
          parent.children.push(node)
        } else {
          parent.children = [node]
        }
      }
    });

    return lookup[Object.keys(lookup)[0]]
  };

  const renderTree = node => {
    return (
      <TreeItem nodeId={node.address} key={node.address} label={node.address}>
        {node.children && node.children.map((result, index) => 
          renderTree(result)
        )}
      </TreeItem>
    )
  }

  return props.crawl && (
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <CSVLink data={convertToCsv()}>
            <IconButton>
              <GetApp />
            </IconButton>
          </CSVLink>
          <IconButton onClick={() => props.remove([{id: props.crawl.id}])}>
            <Delete />
          </IconButton>

          <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth">
            <Tab label="List" />
            <Tab label="Tree" />
          </Tabs>

          <TableContainer hidden={tab !== 0} component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>On</TableCell>
                  <TableCell align="right">Found</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {props.crawl.results && props.crawl.results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((result, index) => 
                  <TableRow key={index} onClick={() => setExpandedRow(expandedRow !== index ? index : -1)}>
                    {index !== expandedRow && <TableCell>{result.on}</TableCell>}
                    {index !== expandedRow && <TableCell>{result.found.substring(0, 100)}...</TableCell>}
                    {index === expandedRow && <TableCell colSpan={2}>{result.found}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            hidden={tab !== 0}
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={props.crawl.results.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
          <Paper hidden={tab !== 1}>
            <TreeView
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
            >
              {renderTree(convertToTree(props.crawl.results))}
            </TreeView> 
          </Paper>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default withRouter(CrawlResultsTable)