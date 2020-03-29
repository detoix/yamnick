import React, { Component } from 'react';
import socketIOClient from "socket.io-client";

export class Home extends Component {
  displayName = Home.name

  constructor(props) {
      super(props)
      this.state = {
        socket: socketIOClient(this.props.location),
        visit: '',
        selector: ''
      }
      this.handleSubmit = this.handleSubmit.bind(this);
      this.tell = this.tell.bind(this)
      this.receive = this.receive.bind(this)
      this.state.socket.on("response_received", data => this.receive(data))
      this.state.socket.on("event", data => this.receive(data))
      
  }

  tell() {
    let crawlRequest = {
      crawlCommand: 
      {
        visit: "https://www.money.pl/sekcja/koronawirus/",
        spiders: 
        [
          {
            selector: "p.sc-1mh2gec-0",
            tag: "extracted_nested"
          },
          {
            visit: "a.sc-17rdsii-2::attr(href)",
            spiders: 
            [
              {
                selector: "div.b300",
                tag: "found"
              },
            ]
          }
        ]
      }
    }
    this.state.socket.emit("query_issued", JSON.stringify(crawlRequest))
  }

  receive(data) {
    console.log(data)
  }

  handleSubmit(event) {
    event.preventDefault();

    let crawlRequest = {
      crawlCommand: 
      {
        visit: this.state.visit,
        spiders: 
        [
          {
            selector: this.state.selector,
            tag: "data"
          }
        ]
      }
    }
    this.state.socket.emit("query_issued", JSON.stringify(crawlRequest))
  }
  
  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
            <button onClick={this.tell}>Increment</button>
            <button onClick={this.load}>Load</button>
            <button onClick={this.sd}>SD</button>
            <button onClick={this.wpiszOkragWKwadrawt}>wpiszOkragWKwadrawt</button>
            <form onSubmit={this.handleSubmit}>
              <label>
                Visit:
                <input type="text" value={this.state.visit} onChange={e => this.setState({visit: e.target.value})} />
              </label>
              <label>
                Select:
                <input type="text" value={this.state.selector} onChange={e => this.setState({selector: e.target.value})} />
              </label>
              <input type="submit" value="Submit" />
            </form>
      </div>
    );
  }
}
