import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import socketIOClient from 'socket.io-client'
import { useAuth0 } from "./utils/react-auth0-spa"
import history from "./utils/history"
import Home from './components/Home'
import NavBar from './components/NavBar'
import { Container } from '@material-ui/core'
import short from 'short-uuid'

const App = () => {
  const { isAuthenticated, getTokenSilently, loading } = useAuth0();
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const authorize = async () => {
      // const socket = socketIOClient("https://secure-brushlands-76941.herokuapp.com", {
      //   transports: ['websocket'],
      // })
      const socket = socketIOClient(window.location.origin)
      socket.once('SERVER_READY', () => {
        setSocket(socket)
      })

      if (!isAuthenticated)
      {
        return
      }

      const token = await getTokenSilently();
      socket
        .emit('authenticate', { token: token })
        .once('authenticated', () => {
          
        })
        .once('unauthorized', (msg) => {
          console.log(`unauthorized: ${JSON.stringify(msg.data)}`);
        })
    };
    if (!loading) {
      authorize();
    }
  }, [loading, getTokenSilently]);

  return (
    <Router history={history}>
      <NavBar />
      {socket && <Container>
        <Switch>
          <Route exact path='/'>
            <Redirect to={'/diagram/' + short.generate()} />
          </Route>
          <Route path='/diagram/:id' render={(props) => <Home {...props} socket={socket} />} />
        </Switch>
      </Container>}
    </Router>
  )
}

export default App