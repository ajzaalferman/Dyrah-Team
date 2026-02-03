import { openDB, DBSchema } from 'idb';

interface OfflineDB extends DBSchema {
    requests: {
        key: string;
        value: {
            id: string;
            url: string; // Action name or API endpoint
            payload: any;
            timestamp: number;
            type: 'CLOCK_IN' | 'CLOCK_OUT';
        };
        indexes: { 'by-timestamp': number };
    };
}

const getDB = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return openDB<OfflineDB>('attendx-offline', 1, {
        upgrade(db) {
            const store = db.createObjectStore('requests', {
                keyPath: 'id',
            });
            store.createIndex('by-timestamp', 'timestamp');
        },
    });
};

export async function addOfflineRequest(type: 'CLOCK_IN' | 'CLOCK_OUT', payload: any) {
    const db = await getDB();
    if (!db) return;
    const id = crypto.randomUUID();
    await db.add('requests', {
        id,
        url: type === 'CLOCK_IN' ? 'clockInAction' : 'clockOutAction',
        payload,
        timestamp: Date.now(),
        type
    });
    return id;
}

export async function getOfflineRequests() {
    const db = await getDB();
    if (!db) return [];
    return db.getAllFromIndex('requests', 'by-timestamp');
}

export async function removeOfflineRequest(id: string) {
    const db = await getDB();
    if (!db) return;
    return db.delete('requests', id);
}
