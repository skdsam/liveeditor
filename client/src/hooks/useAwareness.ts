import { useEffect, useState, useCallback } from 'react';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

export interface User {
    name: string;
    color: string;
    cursor?: {
        anchor: Y.RelativePosition | null;
        head: Y.RelativePosition | null;
    };
}

export interface AwarenessState {
    clientId: number;
    user: User | null;
}

// Shape returned by awareness.getStates() — each client's state is { user: User }
interface RawAwarenessState {
    user?: User;
}

interface UseAwarenessOptions {
    provider: WebsocketProvider | null;
}

export function useAwareness({ provider }: UseAwarenessOptions) {
    // Use state with array for users to ensure React re-renders on changes
    const [usersArray, setUsersArray] = useState<Array<{ clientId: number; user: User }>>([]);
    const [localUser, setLocalUserState] = useState<User | null>(null);
    const [clientId, setClientId] = useState<number>(0);

    useEffect(() => {
        if (!provider) return;

        const awareness = provider.awareness;

        const handleChange = () => {
            // getStates() shape: Map<clientId, { user: User }>
            const rawStates = awareness.getStates() as Map<number, RawAwarenessState>;
            const newUsers: Array<{ clientId: number; user: User }> = [];
            rawStates.forEach((state, clientId) => {
                if (state?.user) {
                    newUsers.push({ clientId, user: state.user });
                }
            });
            // Create new array reference to trigger React re-render
            setUsersArray([...newUsers]);
            // Update clientId state
            setClientId(awareness.clientID);
        };

        const handleLocalChange = () => {
            const rawLocal = awareness.getLocalState() as RawAwarenessState | null;
            setLocalUserState(rawLocal?.user ?? null);
        };

        const handleSync = (isSynced: boolean) => {
            if (isSynced) {
                // When synced, refresh awareness state to get all users
                handleChange();
            }
        };

        awareness.on('change', handleChange);
        awareness.on('change', handleLocalChange);
        provider.on('sync', handleSync);

        // Initial state
        handleChange();
        handleLocalChange();

        return () => {
            awareness.off('change', handleChange);
            awareness.off('change', handleLocalChange);
            provider.off('sync', handleSync);
        };
    }, [provider]);

    // Convert array to Map for UserList compatibility
    const users = new Map<number, User>();
    usersArray.forEach(({ clientId, user }) => {
        users.set(clientId, user);
    });

    const updateCursor = useCallback((anchor: Y.RelativePosition | null, head: Y.RelativePosition | null) => {
        if (!provider) return;
        const awareness = provider.awareness;
        const localState = awareness.getLocalState() as User | null;
        if (localState) {
            awareness.setLocalStateField('user', {
                ...localState,
                cursor: { anchor, head },
            });
        }
    }, [provider]);

    const setLocalUser = useCallback((user: User) => {
        if (!provider) return;
        provider.awareness.setLocalStateField('user', user);
        setLocalUserState(user);
    }, [provider]);

    return {
        users,
        localUser,
        updateCursor,
        setLocalUser,
        clientId,
    };
}
