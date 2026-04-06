# Live Collaborative Code Editor

A real-time collaborative code editor that allows multiple users to edit code simultaneously with live cursor tracking.

## Features

- **Real-time Collaboration** - Multiple users can edit the same code at the same time
- **Live Cursor Tracking** - See where other users' cursors are positioned
- **User Presence** - See who else is in the room with you
- **Room-based** - Each room has a unique URL that can be shared
- **No Authentication** - Anyone with the room link can join and edit
- **Auto-save** - All changes are synchronized instantly via CRDT

## Tech Stack

- **Frontend**: React 18, Vite, Monaco Editor
- **Backend**: Node.js, y-websocket
- **Sync**: Yjs (CRDT for conflict-free collaboration)
- **Deployment**: Caddy (automatic HTTPS)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Development

1. Install dependencies for server:
```bash
cd server
npm install
```

2. Install dependencies for client:
```bash
cd client
npm install
```

3. Start the WebSocket server:
```bash
cd server
npm run dev
```

4. Start the frontend (in another terminal):
```bash
cd client
npm run dev
```

5. Open `http://localhost:3000` in your browser

## Deployment with Caddy

### Server Setup

1. Install Caddy on your server:
```bash
curl -fsSL https://getcaddy.com | bash
```

2. Create a Caddyfile:
```Caddyfile
yourdomain.com {
    # Proxy WebSocket connections to the Node.js server
    reverse_proxy /ws 127.0.0.1:1234
    
    # Proxy everything else to the frontend
    reverse_proxy localhost:3000
}
```

3. Build and start the services:
```bash
# Build client
cd client && npm run build

# Copy client build to your server's web root

# Start WebSocket server
cd server && npm run build && npm start
```

4. Start Caddy:
```bash
caddy run
```

Caddy will automatically obtain SSL certificates and configure HTTPS.

## Project Structure

```
livecodeeditor/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks (Yjs integration)
│   │   ├── utils/         # Utility functions
│   │   ├── App.tsx        # Main application
│   │   └── main.tsx       # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── server/                # Node.js backend
│   ├── src/
│   │   └── index.ts       # WebSocket server
│   ├── package.json
│   └── tsconfig.json
├── plan.md               # Technical specification
└── README.md
```

## How It Works

1. **Room Creation**: When you visit the app, a unique room ID is generated
2. **Share Link**: Copy the URL to share with others
3. **Real-time Sync**: All code changes are synchronized via Yjs CRDT
4. **Cursor Tracking**: Awareness protocol broadcasts cursor positions
5. **Conflict Resolution**: CRDT ensures all users converge to the same state

## Environment Variables

### Client
- `VITE_WS_URL` - WebSocket server URL (default: `ws://localhost:1234`)

### Server
- `PORT` - WebSocket server port (default: `1234`)

## License

MIT
