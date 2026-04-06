import { useState } from 'react';

interface RoomControlsProps {
    roomId: string;
    connected: boolean;
}

export default function RoomControls({ roomId, connected }: RoomControlsProps) {
    const [copied, setCopied] = useState(false);

    const roomUrl = `${window.location.origin}/room/${roomId}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(roomUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="header-actions">
            <div className="room-url">
                <input
                    type="text"
                    value={roomUrl}
                    readOnly
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button className="btn btn-primary" onClick={copyToClipboard}>
                    {copied ? 'Copied!' : 'Copy Link'}
                </button>
            </div>
            <div className={`status-dot ${connected ? '' : 'disconnected'}`} />
            <span style={{ fontSize: '13px', color: '#888' }}>
                {connected ? 'Connected' : 'Disconnected'}
            </span>
        </div>
    );
}
