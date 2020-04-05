import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom'   
import { useAuth0 } from "../utils/react-auth0-spa";

const Home = ({socket}) => {
  const [queriesData, setQueriesData] = useState(null)
  const [startUrl, setStartUrl] = useState('')
  const [follow, setFollow] = useState('')
  const [collect, setCollect] = useState('')
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
        startUrl: "https://www.bankier.pl/wiadomosc/95",
        follow: ['a.next.btn', 'span.entry-title a'],
        collect: ['span.entry-title', 'span.lead']
      }
    }

    socket.emit("query_issued", JSON.stringify(crawlRequest))
  }

  const handleSubmit = event => {
    event.preventDefault();

    let crawlRequest = {
      crawlCommand: 
      {
        startUrl: startUrl,
        follow: follow,
        collect: collect
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
          Start url:
          <input type="text" value={startUrl} onChange={e => setStartUrl(e.target.value)} />
        </label>
        <label>
          Follow:
          <input type="text" value={follow} onChange={e => setFollow(e.target.value)} />
        </label>
        <label>
          Collect:
          <input type="text" value={collect} onChange={e => setCollect(e.target.value)} />
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