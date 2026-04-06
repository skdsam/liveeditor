# Live Collaborative Code Editor - Technical Plan

## 1. Project Overview
A real-time collaborative code editor supporting multiple users simultaneously, featuring live cursor tracking, synchronized code editing, and room-based collaboration with shareable links.

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (SPA)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Monaco      │  │ WebSocket   │  │ Collaboration        │  │
│  │ Editor      │  │ Client      │  │ Cursor Overlay      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ WebSocket (ws://)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Room        │  │ OT Engine   │  │ User/Session        │  │
│  │ Manager     │  │ (Yjs CRDT)  │  │ Manager             │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 3. Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Frontend | React 18 + Vite | Modern, fast dev experience |
| Code Editor | Monaco Editor | VS Code editor, supports JS/TS |
| Real-time Sync | Yjs + y-websocket | CRDT-based, handles conflicts |
| WebSocket Server | y-websocket server | Scales horizontally |
| Backend | Node.js | Unified language, excellent WebSocket support |
| Room IDs | nanoid | Short, URL-safe unique IDs |

## 4. Core Features

- [ ] **Room-based Collaboration**
  - Generate unique room URL on creation
  - Join room via URL link
  - No authentication required
  - Show connected users count

- [ ] **Real-time Code Synchronization**
  - Character-by-character sync using CRDT (Yjs)
  - Automatic conflict resolution
  - Offline editing support with sync on reconnect

- [ ] **Live Cursor Tracking**
  - Display other users' cursor positions
  - Show cursor labels with usernames
  - Different colors per user
  - Broadcast cursor movement throttled to 50ms

- [ ] **Selection Awareness**
  - Show other users' text selections
  - Highlighted regions with user colors

- [ ] **User Presence**
  - Auto-generated usernames (adjective + animal)
  - Random color assignment
  - User joined/left notifications

## 5. File Structure

```
livecodeeditor/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor.tsx       # Monaco editor wrapper
│   │   │   ├── CursorOverlay.tsx # Remote cursor display
│   │   │   ├── UserList.tsx     # Connected users panel
│   │   │   ├── RoomControls.tsx  # Share link, settings
│   │   │   └── Notification.tsx  # Join/leave toasts
│   │   ├── hooks/
│   │   │   ├── useYjs.ts         # Yjs document & provider
│   │   │   └── useAwareness.ts   # Cursor/presence state
│   │   ├── utils/
│   │   │   └── username.ts       # Random username generator
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── server/                    # Backend WebSocket server
│   ├── src/
│   │   ├── index.ts            # Server entry point
│   │   ├── roomManager.ts      # Room lifecycle management
│   │   └── wsServer.ts         # WebSocket handler
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 6. WebSocket Protocol (via Yjs)

Yjs handles the protocol internally. Custom messages used:

| Message Type | Payload | Description |
|--------------|---------|-------------|
| `sync` | Yjs update | Initial sync or full document |
| `awareness` | Cursor/selection | User presence data |

## 7. User Flow

```
1. User visits / or /room/:id
   └── If no room, generate new nanoid → redirect to /room/:id

2. Connect WebSocket to wss://server/room/:id
   └── Yjs WebsocketProvider auto-joins room

3. Yjs syncs document state with server
   └── New users receive full document
   └── Existing users' edits broadcast

4. Awareness (cursors) updates broadcast
   └── Position throttled to 50ms
   └── On disconnect, awareness removed
```

## 8. Deployment Architecture (Self-hosted with Caddy)

Using Caddy for ultra-simple deployment with automatic HTTPS:

```
┌─────────────────────────────────────────────────────────────┐
│                         Caddy                               │
│   ┌─────────────────────────────────────────────────────┐ │
│   │  Reverse Proxy + WebSocket + AutoHTTPS (one file!)   │ │
│   └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Client (443)   │  │  WS Server      │  │  Static Files   │
│  React App      │  │  (port 1234)    │  │  (port 3000)    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Caddyfile (simple one-liner!):**
```
example.com {
    reverse_proxy /ws 127.0.0.1:1234
    reverse_proxy localhost:3000
}
```

**Why Caddy:**
- **Zero config HTTPS** - automatically provisions Let's Encrypt certificates
- **WebSocket support** - just works with reverse_proxy
- **Single config file** - no complex nginx/apache configs
- **Hot reload** - `caddy reload` applies changes instantly
- **Minimal resource usage** - ~10MB RAM

**Deployment Steps:**
1. Install Caddy: `curl -fsSL https://getcaddy.com | bash`
2. Copy Caddyfile to server
3. Build and start: `cd server && npm start &`
4. `caddy run` - Caddy handles the rest

**Server Requirements:**
- Linux (Ubuntu 20.04+, Debian 10+)
- Port 80/443 available
- Domain pointing to server (for HTTPS)

## 9. Implementation Steps

### Phase 1: Project Setup
1. Initialize client with Vite + React + TypeScript
2. Initialize server with Node.js + TypeScript
3. Install dependencies (Monaco, Yjs, y-websocket)

### Phase 2: Backend Foundation
1. Set up y-websocket server
2. Implement basic room management
3. Add health check endpoint

### Phase 3: Frontend Foundation
1. Configure Monaco Editor integration
2. Set up Yjs document and WebSocket provider
3. Implement basic code synchronization

### Phase 4: Collaboration Features
1. Add awareness (cursor tracking)
2. Create cursor overlay component
3. Implement user list and presence
4. Add username generation

### Phase 5: Polish & Room Management
1. Implement room URL routing
2. Add share link functionality
3. Add join/leave notifications
4. Implement user color assignment

### Phase 6: Deployment
1. Configure Nginx for production
2. Set up SSL certificates
3. Create deployment scripts
4. Write documentation

## 10. Dependencies

**Client (package.json)**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "yjs": "^13.6.0",
    "y-websocket": "^1.5.0",
    "@monaco-editor/react": "^4.6.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0"
  }
}
```

**Server (package.json)**
```json
{
  "dependencies": {
    "ws": "^8.14.0",
    "y-websocket": "^1.5.0",
    "yjs": "^13.6.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsx": "^4.0.0",
    "@types/ws": "^8.5.0"
  }
}
```
