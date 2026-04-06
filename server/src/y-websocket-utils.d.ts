declare module 'y-websocket/bin/utils' {
    import type { IncomingMessage } from 'http';
    import type { WebSocket } from 'ws';

    interface SetupWSConnectionOptions {
        docName?: string;
        gc?: boolean;
    }

    export function setupWSConnection(
        doc: WebSocket,
        req: IncomingMessage,
        options?: SetupWSConnectionOptions
    ): void;
}
