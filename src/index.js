import ReactDOM from "react-dom";
import React, { Component } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { message } from "antd";

const client = new W3CWebSocket('wss://salty-dawn-74239.herokuapp.com');

export default class App extends Component  {

    state = {
        messages: []
    }

    onButtonClicked = (value) => {
        client.send(JSON.stringify({
            type: "message",
            msg: value
        }));
    }

    componentDidMount(){
        client.onopen = () => {
            console.log("WebSocket Client Connected!");
        };
        client.onmessage = (message) => {
            //const dataFromServer = JSON.parse(message.data);
            console.log('got reply: ', message.data);
            this.setState((state) => ({
                messages: [...state.messages,
                {
                    msg: message.data
                }]
            }))
        }

    }
    render() {
        return (
            <div>
                <button onClick={() => this.onButtonClicked("forward")}> Forward </button>
                <button onClick={() => this.onButtonClicked("backwards")}> Backwards </button>
                <button onClick={() => this.onButtonClicked("auto")}> AUTO </button>
                {this.state.messages.map(msg => <p>message: {msg.msg}</p>)}
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('root'));