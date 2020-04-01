import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom'   
import socketIOClient from "socket.io-client";
import NavBar from "./NavBar";

const Home = ({ location }) => {
  const [socket, setSocket] = useState(() => socketIOClient(location))
  const [visit, setVisit] = useState('')
  const [selector, setSelector] = useState('')

  useEffect(() => {
    socket.on("event", data => console.log(data))
    socket.on("response_received", data => console.log(data))
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
      <NavBar />
      <h1>Hello, world!</h1>
          <button onClick={tell}>Increment</button>
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