'use client';

import { useState } from 'react';
import { Camera, MapPin, Clock, User } from 'lucide-react';

interface AttendanceRecord {
    id: string;
    userId: string;
    date: Date;
    checkIn: Date;
    checkOut: Date | null;
    status: string;
    location: string | null;
    method: string;
    photoUrl: string | null;
    user: {
        name: string;
        email: string;
        employeeId: string | null;
        department: string | null;
    };
}

export default function AttendanceRecordsTable({ records }: { records: AttendanceRecord[] }) {
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    if (records.length === 0) {
        return <p className="text-muted text-center" style={{ padding: '2rem' }}>No attendance records found for this period.</p>;
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Employee</th>
                        <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Date</th>
                        <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Check In/Out</th>
                        <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Status</th>
                        <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Photo</th>
                        <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Details</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record) => {
                        const locationData = record.location ? JSON.parse(record.location) : null;

                        return (
                            <tr key={record.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '0.75rem' }}>
                                    <div style={{ fontWeight: 600 }}>{record.user.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{record.user.email}</div>
                                </td>
                                <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                    {new Date(record.date).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={14} className="text-muted" />
                                        In: {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    {record.checkOut && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <Clock size={14} className="text-muted" />
                                            Out: {new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: record.status === 'PRESENT' ? 'rgba(16, 185, 129, 0.1)' :
                                            record.status === 'LATE' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: record.status === 'PRESENT' ? 'var(--color-success)' :
                                            record.status === 'LATE' ? 'var(--color-warning)' : 'var(--color-error)'
                                    }}>
                                        {record.status}
                                    </span>
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    {record.photoUrl ? (
                                        <div
                                            onClick={() => setSelectedPhoto(record.photoUrl)}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: 'var(--radius-sm)',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: '1px solid var(--color-border)'
                                            }}
                                        >
                                            <img
                                                src={record.photoUrl}
                                                alt="Check-in"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>No photo</div>
                                    )}
                                </td>
                                <td style={{ padding: '0.75rem', fontSize: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <User size={12} className="text-muted" />
                                        Method: {record.method}
                                    </div>
                                    {locationData && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                                            <MapPin size={12} className="text-muted" />
                                            Loc: {locationData.lat.toFixed(4)}, {locationData.lng.toFixed(4)}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Photo Modal */}
            {selectedPhoto && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '2rem'
                    }}
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
                        <img
                            src={selectedPhoto}
                            alt="Full size"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '90vh',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                            }}
                        />
                        <button
                            style={{
                                position: 'absolute',
                                top: '-40px',
                                right: '0',
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            Click anywhere to close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
