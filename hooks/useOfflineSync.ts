import { useState, useEffect } from 'react';
import { getOfflineRequests, removeOfflineRequest } from '@/lib/offline-db';
import { clockInAction, clockOutAction } from '@/app/actions';
import { toast } from 'sonner';

export function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Initial check
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            toast.success('You are back online!');
            syncRequests();
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast.warning('You are offline. Changes will save locally.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    async function syncRequests() {
        const requests = await getOfflineRequests();
        if (requests.length === 0) return;

        toast.info(`Syncing ${requests.length} offline requests...`);

        for (const req of requests) {
            try {
                if (req.type === 'CLOCK_IN') {
                    const { lat, lng } = req.payload;
                    await clockInAction(lat, lng);
                } else {
                    const { lat, lng } = req.payload;
                    await clockOutAction(lat, lng);
                }
                await removeOfflineRequest(req.id);
            } catch (e) {
                console.error('Failed to sync request', req);
                // Keep in DB? Or move to 'failed' store?
                // For MVP, if server error, we might want to alert user.
            }
        }
        toast.success('Sync complete!');
    }

    return { isOnline, syncRequests };
}
