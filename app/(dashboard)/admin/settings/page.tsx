'use client';

import { useEffect, useState } from 'react';
import { getCompanyAction, updateCompanySettingsAction } from '@/app/admin-actions';
import { toast } from 'sonner';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState<any>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        const data = await getCompanyAction();
        if ('error' in data) {
            toast.error(data.error as string);
        } else {
            setCompany(data);
        }
        setLoading(false);
    }

    async function handleSubmit(formData: FormData) {
        const res = await updateCompanySettingsAction(formData);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Settings updated successfully');
            loadSettings();
        }
    }

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Settings</h1>
                <p className="text-muted">Manage your organization's general configuration.</p>
            </header>

            <div className="card" style={{ maxWidth: '600px' }}>
                <form action={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Company Details</h3>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Company Name</label>
                            <input
                                name="name"
                                type="text"
                                defaultValue={company?.name || ''}
                                className="card"
                                style={{ width: '100%', padding: '0.75rem' }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Working Hours</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Work Start Time</label>
                                <input
                                    name="workStartTime"
                                    type="time"
                                    defaultValue={company?.workStartTime || "09:00"}
                                    className="card"
                                    style={{ width: '100%', padding: '0.75rem' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Work End Time</label>
                                <input
                                    name="workEndTime"
                                    type="time"
                                    defaultValue={company?.workEndTime || "18:00"}
                                    className="card"
                                    style={{ width: '100%', padding: '0.75rem' }}
                                    required
                                />
                            </div>
                        </div>
                        <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                            Employees checking in after start time will be marked as 'LATE'.
                        </p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Office Location (Geofencing)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Latitude</label>
                                <input
                                    name="officeLatitude"
                                    type="number"
                                    step="any"
                                    defaultValue={company?.officeLatitude || 0}
                                    className="card"
                                    style={{ width: '100%', padding: '0.75rem' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Longitude</label>
                                <input
                                    name="officeLongitude"
                                    type="number"
                                    step="any"
                                    defaultValue={company?.officeLongitude || 0}
                                    className="card"
                                    style={{ width: '100%', padding: '0.75rem' }}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Radius (Meters)</label>
                            <input
                                name="geofenceRadius"
                                type="number"
                                defaultValue={company?.geofenceRadius || 100}
                                className="card"
                                style={{ width: '100%', padding: '0.75rem' }}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}
