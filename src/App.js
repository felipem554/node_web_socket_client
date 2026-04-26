import React, { useState, useEffect, useRef, useCallback } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";

const WS_URL =
  process.env.REACT_APP_WS_URL || "wss://salty-dawn-74239.herokuapp.com";

const COMMANDS = [
  { label: "Forward", value: "forward" },
  { label: "Backwards", value: "backwards" },
  { label: "AUTO", value: "auto" },
];

function App() {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const clientRef = useRef(null);

  useEffect(() => {
    const client = new W3CWebSocket(WS_URL);
    clientRef.current = client;

    client.onopen = () => {
      setConnected(true);
      setError(null);
      console.log("WebSocket client connected");
    };

    client.onmessage = (event) => {
      console.log("Message received:", event.data);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), data: event.data },
      ]);
    };

    client.onerror = () => {
      setError("Connection error. Check that the server is reachable.");
      console.error("WebSocket connection error");
    };

    client.onclose = () => {
      setConnected(false);
      console.log("WebSocket connection closed");
    };

    return () => {
      client.close();
    };
  }, []);

  const sendCommand = useCallback((command) => {
    const client = clientRef.current;
    if (client && client.readyState === W3CWebSocket.OPEN) {
      client.send(JSON.stringify({ type: "message", msg: command }));
    }
  }, []);

  return (
    <div className="app">
      <h1>WebSocket Client</h1>

      <p className="status">
        Status:{" "}
        <span className={connected ? "connected" : "disconnected"}>
          {connected ? "Connected" : "Disconnected"}
        </span>
      </p>

      {error && <p className="error">{error}</p>}

      <div className="controls">
        {COMMANDS.map(({ label, value }) => (
          <button
            key={value}
            className="command-btn"
            disabled={!connected}
            onClick={() => sendCommand(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="messages">
        <h2>Messages</h2>
        {messages.length === 0 ? (
          <p className="no-messages">No messages received yet.</p>
        ) : (
          messages.map(({ id, data }) => (
            <p key={id} className="message">
              {data}
            </p>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
