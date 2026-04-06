import { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface UseYjsOptions {
    roomId: string;
    serverUrl: string;
    username: string;
    userColor: string;
}

interface UseYjsReturn {
    doc: Y.Doc | null;
    provider: WebsocketProvider | null;
    connected: boolean;
    synced: boolean;
}

export function useYjs({ roomId, serverUrl, username, userColor }: UseYjsOptions): UseYjsReturn {
    const [connected, setConnected] = useState(false);
    const [synced, setSynced] = useState(false);
    // Use state (not refs) so the Editor re-renders when doc/provider are ready
    const [doc, setDoc] = useState<Y.Doc | null>(null);
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);

    useEffect(() => {
        // Create Yjs document
        const yjsDoc = new Y.Doc();

        // Create WebSocket provider
        const yjsProvider = new WebsocketProvider(serverUrl, roomId, yjsDoc, {
            connect: true,
        });

        // Set user awareness
        const awareness = yjsProvider.awareness;
        awareness.setLocalStateField('user', {
            name: username,
            color: userColor,
        });

        // Connection status handlers
        yjsProvider.on('status', (event: { status: string }) => {
            setConnected(event.status === 'connected');
        });

        yjsProvider.on('sync', (isSynced: boolean) => {
            setSynced(isSynced);
        });

        // Expose to React so downstream components re-render
        setDoc(yjsDoc);
        setProvider(yjsProvider);

        // Cleanup on unmount
        return () => {
            yjsProvider.disconnect();
            yjsProvider.destroy();
            yjsDoc.destroy();
            setDoc(null);
            setProvider(null);
        };
    }, [roomId, serverUrl, username, userColor]);

    return {
        doc,
        provider,
        connected,
        synced,
    };
}

export function useYjsText(doc: Y.Doc | null, fieldName: string = 'content') {
    const [text, setText] = useState<string>('');
    const textRef = useRef<Y.Text | null>(null);

    useEffect(() => {
        if (!doc) return;

        const yText = doc.getText(fieldName);
        textRef.current = yText;

        // Initialize with current text
        setText(yText.toString());

        // Listen for changes
        const observer = () => {
            setText(yText.toString());
        };
        yText.observe(observer);

        return () => {
            yText.unobserve(observer);
        };
    }, [doc, fieldName]);

    const insertText = useCallback((index: number, content: string) => {
        if (textRef.current) {
            textRef.current.insert(index, content);
        }
    }, []);

    const deleteText = useCallback((index: number, length: number) => {
        if (textRef.current) {
            textRef.current.delete(index, length);
        }
    }, []);

    const setTextContent = useCallback((content: string) => {
        if (textRef.current && doc) {
            doc.transact(() => {
                textRef.current!.delete(0, textRef.current!.length);
                textRef.current!.insert(0, content);
            });
        }
    }, [doc]);

    return { text, insertText, deleteText, setTextContent };
}
