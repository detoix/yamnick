import React, { Component } from 'react';
import { Client } from 'paho-mqtt';
import SockJsClient from 'react-stomp';
import StompClient from "react-stomp-client";

export class Home extends Component {
    displayName = Home.name

    constructor(props) {
        super(props);
        this.state = { currentCount: 0, latestMessage: null };
        this.incrementCounter = this.incrementCounter.bind(this);
        this.load = this.load.bind(this);
        this.sd = this.sd.bind(this)
        this.wpiszOkragWKwadrawt = this.wpiszOkragWKwadrawt.bind(this)

        // var wsbroker = "bear.rmq.cloudamqp.com";  // mqtt websocket enabled broker
        // var wsport = 1883; // port for above
        // var client = new Client(wsbroker, wsport, "/ws/mqtt",
        //     "wenivnjk:wenivnjk");
        // client.onConnectionLost = function (responseObject) {
        //     console.log("CONNECTION LOST - " + responseObject.errorMessage);
        // };
        // client.onMessageArrived = function (message) {
        //     console.log("RECEIVE ON " + message.destinationName + " PAYLOAD " + message.payloadString);
        //     console.log(message.payloadString);
        // };

        // var options = {
        //     timeout: 3,
        //     keepAliveInterval: 30,
        //     onSuccess: function () {
        //         console.log("CONNECTION SUCCESS");
        //         client.subscribe('/topic/test', {qos: 1});
        //     },
        //     onFailure: function (message) {
        //         console.log("CONNECTION FAILURE - " + message.errorMessage);
        //     }
        // };
        // options.useSSL = true;

        // client.connect(options);

        var sock = new SockJsClient("http://bear.rmq.cloudamqp.com:61613/stomp");
        
        sock.onopen = function() {
            console.log('open');
            sock.send('test');
        };
       
        sock.onmessage = function(e) {
            console.log('message', e.data);
            sock.close();
        };
       
        sock.onclose = function() {
            console.log('close');
        };

        this.handleMessage = this.handleMessage.bind(this);
    }

    handleMessage(stompMessage) {
        this.setState({
          latestMessage: stompMessage
        });
      }

    sendMessage = (msg) => {
        this.clientRef.sendMessage('/topics/all', msg);
      }

    incrementCounter() {
        fetch('api/circles/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
    }

    load() {
        fetch('api/circles/1', {
            method: 'GET'
        });
    }

    sd() {
        fetch('api/drawing/1', {
            method: 'GET'
        });
    }

    wpiszOkragWKwadrawt() {
        fetch('api/circles/1', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
    }

  render() {
    const { latestMessage } = this.state;
    return (
      <div>
      

        <h1>Hello, world!</h1>
            <button onClick={this.incrementCounter}>Increment</button>
            <button onClick={this.load}>Load</button>
            <button onClick={this.sd}>SD</button>
            <button onClick={this.wpiszOkragWKwadrawt}>wpiszOkragWKwadrawt</button>


        <p>Welcome to your new single-page application, built with:</p>
        <ul>
          <li><a href='https://get.asp.net/'>ASP.NET Core</a> and <a href='https://msdn.microsoft.com/en-us/library/67ef8sbd.aspx'>C#</a> for cross-platform server-side code</li>
          <li><a href='https://facebook.github.io/react/'>React</a> for client-side code</li>
          <li><a href='http://getbootstrap.com/'>Bootstrap</a> for layout and styling</li>
        </ul>
        <p>To help you get started, we've also set up:</p>
        <ul>
          <li><strong>Client-side navigation</strong>. For example, click <em>Counter</em> then <em>Back</em> to return here.</li>
          <li><strong>Development server integration</strong>. In development mode, the development server from <code>create-react-app</code> runs in the background automatically, so your client-side resources are dynamically built on demand and the page refreshes when you modify any file.</li>
          <li><strong>Efficient production builds</strong>. In production mode, development-time features are disabled, and your <code>dotnet publish</code> configuration produces minified, efficiently bundled JavaScript files.</li>
        </ul>
        <p>The <code>ClientApp</code> subdirectory is a standard React application based on the <code>create-react-app</code> template. If you open a command prompt in that directory, you can run <code>npm</code> commands such as <code>npm test</code> or <code>npm install</code>.</p>
      </div>
    );
  }
}
