import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom'   
import { useAuth0 } from "../utils/react-auth0-spa";

const Home = ({socket}) => {
  const [visit, setVisit] = useState('')
  const [selector, setSelector] = useState('')
  const { loading, user } = useAuth0();

  useEffect(() => {
    socket
      .on("event", data => console.log(data))
      .on("response_received", data => console.log(data))
  });

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

  return (
    <div>
      
      <h1>Hello, world!</h1>
          <button onClick={tell}>Increment</button>




                  {!(loading || !user) &&
                
                  <p>{user.name}
                      {user.email} {user.sub}</p>}



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
    </div>
  );
}

export default withRouter(Home)