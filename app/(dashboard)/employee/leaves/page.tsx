'use client';

import { useState, useEffect } from 'react';
import { requestLeaveAction, getMyLeavesAction } from '@/app/leave-actions';
import { toast } from 'sonner';

export default function EmployeeLeavesPage() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadLeaves();
    }, []);

    async function loadLeaves() {
        const data = await getMyLeavesAction();
        setLeaves(data || []);
    }

    async function handleSubmit(formData: FormData) {
        const res = await requestLeaveAction(formData);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Leave request submitted!');
            setShowForm(false);
            loadLeaves();
        }
    }

    return (
        <div>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem' }}>My Leaves</h1>
                </div>
                {!showForm && (
                    <button onClick={() => setShowForm(true)} className="btn btn-primary">
                        Request Leave
                    </button>
                )}
            </header>

            {showForm && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>New Leave Request</h3>
                    <form action={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Type</label>
                            <select name="type" required style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                <option value="SICK">Sick Leave</option>
                                <option value="CASUAL">Casual Leave</option>
                                <option value="VACATION">Vacation</option>
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Start Date</label>
                                <input name="startDate" type="date" required style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>End Date</label>
                                <input name="endDate" type="date" required style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Reason</label>
                            <textarea name="reason" required rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Cancel</button>
                            <button type="submit" className="btn btn-primary">Submit Request</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Leave History</h3>
                {leaves.length === 0 ? (
                    <p className="text-muted text-center" style={{ padding: '2rem' }}>No leave requests yet.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {leaves.map((leave) => (
                            <div key={leave.id} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{leave.type}</h4>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: leave.status === 'APPROVED' ? 'var(--color-success)' : leave.status === 'REJECTED' ? 'var(--color-error)' : 'var(--color-warning)',
                                        color: 'white'
                                    }}>
                                        {leave.status}
                                    </span>
                                </div>
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                </p>
                                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{leave.reason}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
