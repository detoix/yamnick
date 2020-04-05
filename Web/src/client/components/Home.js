import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom'   
import { useAuth0 } from "../utils/react-auth0-spa";

const Home = ({socket}) => {
  const [queriesData, setQueriesData] = useState(null)
  const [visit, setVisit] = useState('')
  const [selector, setSelector] = useState('')
  const { loading, user } = useAuth0();

  useEffect(() => {
    socket
      .on("response_received", data => {
        setQueriesData(JSON.parse(data))
      })
      .emit("query_issued", JSON.stringify({
        queryForUser: { }
      }))
  }, []);

  const tell = () => {
    let crawlRequest = {
      crawlCommand: 
      {
        visit: "https://www.money.pl/sekcja/koronawirus/",
        spiders: 
        [
          {
            selector: "p.sc-1mh2gec-0",
          },
          {
            visit: "a.sc-17rdsii-2::attr(href)",
            spiders: 
            [
              {
                selector: "div.b300",
              },
            ]
          }
        ]
      }
    }

    socket.emit("query_issued", JSON.stringify(crawlRequest))
  }

  const handleSubmit = event => {
    event.preventDefault();

    let crawlRequest = {
      crawlCommand: 
      {
        visit: visit,
        spiders: 
        [
          {
            selector: selector,
          }
        ]
      }
    }
    socket.emit("query_issued", JSON.stringify(crawlRequest))
  }

  const runCrawlAgain = id => {
    event.preventDefault();

    let crawlRequest = {
      crawlCommand: 
      {
        id: id
      }
    }
    socket.emit("query_issued", JSON.stringify(crawlRequest))
  }

  return (
    <div>
      {!(loading || !user) && <h1>Hello, {user.name}!</h1>}

      <button onClick={tell}>Run default crawl</button> 

      <form onSubmit={handleSubmit}>
        <label>
          Visit:
          <input type="text" value={visit} onChange={e => setVisit(e.target.value)} />
        </label>
        <label>
          Select:
          <input type="text" value={selector} onChange={e => setSelector(e.target.value)} />
        </label>
        <input type="submit" value="Submit" />
      </form>

      {queriesData && queriesData.queriesWithResults.map(queryWithResults => 
        <div key={queryWithResults.id}>
          <h2>Query [{queryWithResults.id}], {queryWithResults.visit}</h2>
          <button onClick={() => runCrawlAgain(queryWithResults.id)}>Run again</button>

          {queryWithResults.crawlResults && queryWithResults.crawlResults.map((crawl, index) => 
            <span key={index}>
              <h3>Crawl number {index}</h3>
              <ul>
                {crawl.results && crawl.results.slice(0, 20).map((result, index) => 
                  <li key={index}>
                    On {result.on}, found {result.found.substring(0, 30)}
                  </li>
                )}
              </ul>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default withRouter(Home)