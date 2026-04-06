import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { generateUsername, generateColor } from './utils/username';
import { useYjs } from './hooks/useYjs';
import { useAwareness } from './hooks/useAwareness';
import CodeEditor from './components/Editor';
import UserList from './components/UserList';
import RoomControls from './components/RoomControls';

// Get room ID from URL or generate one
function getRoomId(): string {
    const path = window.location.pathname;
    const match = path.match(/^\/room\/([a-zA-Z0-9_-]+)$/);
    if (match) {
        return match[1];
    }
    // Generate new room ID and redirect
    const newRoomId = nanoid(10);
    window.location.href = `/room/${newRoomId}`;
    return newRoomId;
}

interface LoginScreenProps {
    onLogin: (username: string) => void;
}

function LoginScreen({ onLogin }: LoginScreenProps) {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onLogin(name.trim());
        }
    };

    const handleRandomName = () => {
        const randomName = generateUsername();
        setName(randomName);
    };

    return (
        <div className="login-screen">
            <div className="login-card">
                <h1>Live Code Editor</h1>
                <p>Real-time collaborative code editing</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter your name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
                        Join Editor
                    </button>
                </form>
                <button type="button" className="btn btn-secondary" onClick={handleRandomName}>
                    Use Random Name
                </button>
            </div>
        </div>
    );
}

function LiveEditor({ roomId, username, userColor }: { roomId: string; username: string; userColor: string }) {
    // Use the Vite proxy at /ws (configured to forward to ws://localhost:1234)
    const serverUrl = `ws://${window.location.host}/ws`;
    const { doc, provider, connected, synced } = useYjs({
        roomId,
        serverUrl,
        username,
        userColor,
    });
    const { users, clientId } = useAwareness({ provider });

    return (
        <div className="app">
            <header className="header">
                <h1>Live Code Editor</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <UserList users={users} currentClientId={clientId} />
                    <RoomControls roomId={roomId} connected={connected} />
                </div>
            </header>
            <main className="main-content">
                <div className="editor-container">
                    <CodeEditor doc={doc} provider={provider} language="javascript" />
                </div>
            </main>
            {!synced && connected && (
                <div className="notification">
                    Syncing with server...
                </div>
            )}
        </div>
    );
}

export default function App() {
    const [roomId, setRoomId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [userColor] = useState(() => generateColor());

    useEffect(() => {
        const id = getRoomId();
        setRoomId(id);
    }, []);

    const handleLogin = (name: string) => {
        setUsername(name);
    };

    if (!roomId) {
        return (
            <div className="login-screen">
                <div className="login-card">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!username) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return <LiveEditor roomId={roomId} username={username} userColor={userColor} />;
}
