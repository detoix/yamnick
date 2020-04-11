import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import { useAuth0 } from "./utils/react-auth0-spa";
import history from "./utils/history";
import Home from './components/Home';
import NavBar from './components/NavBar';
import QueryWithResults from './components/QueryWithResults';
import { Container } from '@material-ui/core';

const App = () => {
  const { isAuthenticated, getTokenSilently, loading } = useAuth0();
  const [ready, setReady] = useState(false)
  const [socket, setSocket] = useState(
    socketIOClient(window.location.origin))

  useEffect(() => {
    const authorize = async () => {
      if (!isAuthenticated)
      {
        setReady(true)
        return
      }

      const token = await getTokenSilently();
      socket
        .emit('authenticate', { token: token })
        .on('server_ready', () => {
          setReady(true)
        })
        .on('authenticated', () => {
          
        })
        .on('unauthorized', (msg) => {
          console.log(`unauthorized: ${JSON.stringify(msg.data)}`);
        })
    };
    if (!loading) {
      authorize();
    }
  }, [loading, getTokenSilently]);

  if (!ready)
  {
    return <div>Loading...</div> 
  }

  return (
    <Router history={history}>
      <NavBar />
      <Container style={{ padding: 20 }}>
        <Switch>
          <Route exact path='/' render={(props) => <Home {...props} socket={socket} />} />
          <Route path='/query/:id' render={(props) => <QueryWithResults {...props} socket={socket} />} />
        </Switch>
      </Container>
    </Router>
  );
}

export default App