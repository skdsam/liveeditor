import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';

const PORT = parseInt(process.env.PORT || '1234', 10);

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws, req) => {
    // Extract room name from URL path (e.g., /room-123 → room-123)
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const roomName = url.pathname.slice(1) || 'default';

    console.log(`[${new Date().toISOString()}] Client connected to room: ${roomName}`);

    setupWSConnection(ws, req, {
        docName: roomName,
        gc: true,
    });

    ws.on('close', () => {
        console.log(`[${new Date().toISOString()}] Client disconnected from room: ${roomName}`);
    });
});

console.log(`
╔════════════════════════════════════════════════════════════╗
║           Live Code Editor - WebSocket Server              ║
╠════════════════════════════════════════════════════════════╣
║  Status:  Running                                           ║
║  Port:    ${String(PORT).padEnd(50)}║
║  Rooms:   Dynamic (based on URL path)                       ║
╚════════════════════════════════════════════════════════════╝

Ready to accept connections!
`);
