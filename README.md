# WebSocket Client

A React application for sending commands to and receiving messages from a WebSocket server in real time.

## Features

- Connects to a configurable WebSocket server on startup
- Sends predefined commands: **Forward**, **Backwards**, **AUTO**
- Displays all incoming messages in chronological order
- Shows live connection status (Connected / Disconnected)
- Displays an error banner when the connection fails

## Prerequisites

- Node.js 16+
- npm 8+

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure the WebSocket server URL
cp .env.example .env
# Edit .env and set REACT_APP_WS_URL to your server's address

# 3. Start the development server (runs on http://localhost:1992)
npm start
```

## Environment Variables

| Variable             | Default                                       | Description                       |
|----------------------|-----------------------------------------------|-----------------------------------|
| `REACT_APP_WS_URL`   | `wss://salty-dawn-74239.herokuapp.com`        | WebSocket server URL              |

Create a `.env` file at the project root (use `.env.example` as a template):

```
REACT_APP_WS_URL=wss://your-websocket-server.example.com
```

> Variables must be prefixed with `REACT_APP_` to be picked up by Create React App.

## Running Tests

```bash
# Interactive watch mode
npm test

# Single run (CI)
npm run test:ci
```

The test suite covers:

- Initial render (heading, status, placeholder, button states)
- Connection lifecycle (open, close, error)
- Command dispatch (correct JSON payload per button)
- Message rendering (single, multiple, placeholder removal)
- WebSocket cleanup on unmount

## Project Structure

```
node_web_socket_client/
├── public/
│   └── index.html          # HTML entry point
├── src/
│   ├── App.js              # Main component
│   ├── App.test.js         # Component tests
│   ├── index.js            # React DOM entry point
│   ├── index.css           # Application styles
│   └── setupTests.js       # Jest / Testing Library setup
├── .env.example            # Environment variable template
├── package.json
└── README.md
```

## How It Works

`App.js` creates a WebSocket connection inside a `useEffect` hook. The connection is torn down automatically when the component unmounts, preventing memory leaks. Each button click serialises a command as JSON and sends it over the open socket:

```json
{ "type": "message", "msg": "forward" }
```

Incoming `message` events are appended to the component state and rendered as individual rows.

## License

MIT © 2025 felipem554
