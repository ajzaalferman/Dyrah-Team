'use client';

import { useState, useEffect } from 'react';
import { clockInAction, clockOutAction, getStatusAction } from '@/app/actions';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { addOfflineRequest } from '@/lib/offline-db';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const WebcamCapture = dynamic(() => import('@/components/WebcamCapture'), { ssr: false });

export default function EmployeeHome() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showWebcam, setShowWebcam] = useState(false);
    const { isOnline } = useOfflineSync();

    useEffect(() => {
        loadStatus();
    }, [isOnline]); // Reload when back online

    async function loadStatus() {
        if (!isOnline) {
            setLoading(false);
            return;
        }
        const record = await getStatusAction();
        setStatus(record);
        setLoading(false);
    }

    function initiateClockIn() {
        setShowWebcam(true);
    }

    async function handlePunchWithPhoto(photoUrl?: string) {
        const punchLabel = 'Clock In';

        // 1. Get Location
        let lat, lng;
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
            });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
        } catch (e) {
            console.warn('Location failed', e);
        }

        // 2. Offline Mode
        if (!isOnline) {
            await addOfflineRequest('CLOCK_IN', { lat, lng, photoUrl });
            toast.info(`${punchLabel} saved locally. Will sync when online.`);
            setStatus((prev: any) => ({
                ...prev,
                status: 'PENDING_SYNC',
                checkIn: new Date(),
                checkOut: undefined
            }));
            return;
        }

        // 3. Online Mode
        try {
            const res = await clockInAction(lat, lng, photoUrl);
            if (res?.error) {
                toast.error(res.error);
            } else {
                toast.success(`${punchLabel} Successful`);
                loadStatus();
            }
        } catch (e) {
            toast.error('Network Error. Saved to offline queue.');
            await addOfflineRequest('CLOCK_IN', { lat, lng, photoUrl });
        }
    }

    async function handlePunch(type: 'in' | 'out') {
        if (type === 'in') {
            initiateClockIn();
            return;
        }

        // Clock Out logic
        const punchLabel = 'Clock Out';
        let lat, lng;
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
            });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
        } catch (e) {
            console.warn('Location failed', e);
        }

        if (!isOnline) {
            await addOfflineRequest('CLOCK_OUT', { lat, lng });
            toast.info(`${punchLabel} saved locally.`);
            setStatus((prev: any) => ({
                ...prev,
                checkOut: new Date()
            }));
            return;
        }

        try {
            const res = await clockOutAction(lat, lng);
            if (res?.error) {
                toast.error(res.error);
            } else {
                toast.success(`${punchLabel} Successful`);
                loadStatus();
            }
        } catch (e) {
            toast.error('Network Error. Saved to offline queue.');
            await addOfflineRequest('CLOCK_OUT', { lat, lng });
        }
    }

    if (loading) return <div className="p-4">Loading...</div>;

    const isCheckedIn = status && !status.checkOut;

    return (
        <div>
            {showWebcam && (
                <WebcamCapture
                    onCapture={(photo) => {
                        setShowWebcam(false);
                        handlePunchWithPhoto(photo);
                    }}
                />
            )}

            <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem' }}>Today</h1>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>{new Date().toDateString()}</p>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                    JD
                </div>
            </header>

            {/* Offline Banner */}
            {!isOnline && (
                <div style={{ background: 'var(--color-warning)', color: 'black', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
                    You are offline. Changes will be synced later.
                </div>
            )}

            <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '2rem 1rem' }}>
                <p className="text-muted" style={{ marginBottom: '0.5rem' }}>My Status</p>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                    {status?.status === 'PENDING_SYNC' ? 'Pending Sync...' : (isCheckedIn ? 'Checked In' : 'Not Checked In')}
                </h2>

                {!isCheckedIn ? (
                    <button onClick={() => handlePunch('in')} className="btn btn-primary" style={{ width: '100%' }}>
                        Clock In
                    </button>
                ) : (
                    <button onClick={() => handlePunch('out')} className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>
                        Clock Out
                    </button>
                )}
            </div>

            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Recent Activity</h3>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {status ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Check In</span>
                            <span className="text-muted">{status.checkIn ? new Date(status.checkIn).toLocaleTimeString() : '-'}</span>
                        </div>
                        {status.checkOut && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Check Out</span>
                                <span className="text-muted">{new Date(status.checkOut).toLocaleTimeString()}</span>
                            </div>
                        )}
                        <div>Status: <strong>{status.status}</strong></div>
                    </>
                ) : (
                    <p className="text-muted text-center" style={{ fontSize: '0.875rem' }}>No activity today</p>
                )}
            </div>
        </div>
    );
}
