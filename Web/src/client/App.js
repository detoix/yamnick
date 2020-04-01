import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import Home from './components/Home';
import NavBar from './components/NavBar';
import './app.css';

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = { socket: socketIOClient(this.props.location) }
  }

  render() {
    return (
      <Router>
        <NavBar />
        <Switch>
          <Route exact path='/' render={(props) => <Home {...props} socket={this.state.socket} />} />
        </Switch>
      </Router>
    );
  }
}
