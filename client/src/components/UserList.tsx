import { getInitials } from '../utils/username';

interface User {
    name: string;
    color: string;
}

interface UserListProps {
    users: Map<number, User>;
    currentClientId: number;
}

export default function UserList({ users, currentClientId }: UserListProps) {
    const userList = Array.from(users.entries()).map(([clientId, user]) => ({
        clientId,
        ...user,
        isLocal: clientId === currentClientId,
    }));

    return (
        <div className="user-list">
            {userList.map(({ clientId, name, color, isLocal }) => (
                <div
                    key={clientId}
                    className="user-avatar"
                    style={{ backgroundColor: color }}
                    title={isLocal ? `${name} (you)` : name}
                >
                    {getInitials(name)}
                </div>
            ))}
            <span style={{ fontSize: '13px', color: '#888' }}>
                {userList.length} {userList.length === 1 ? 'user' : 'users'}
            </span>
        </div>
    );
}
