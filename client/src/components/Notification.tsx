import { useEffect } from 'react';

interface NotificationProps {
    message: string;
    type?: 'info' | 'join' | 'leave';
    onClose: () => void;
}

export default function Notification({ message, type = 'info', onClose }: NotificationProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const borderColor = type === 'join' ? '#4caf50' : type === 'leave' ? '#f44336' : '#2196f3';

    return (
        <div
            className="notification"
            style={{ borderLeft: `4px solid ${borderColor}` }}
        >
            {message}
        </div>
    );
}
