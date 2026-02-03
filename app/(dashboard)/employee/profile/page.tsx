'use client';

import { logoutAction } from '@/app/actions';

export default function EmployeeProfile() {
    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>My Profile</h1>
            </header>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>
                        JD
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem' }}>John Doe</h2>
                        <p className="text-muted">Software Engineer</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                        <span className="text-muted">Email</span>
                        <span>john@acme.com</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                        <span className="text-muted">Employee ID</span>
                        <span>EMP-001</span>
                    </div>
                </div>
            </div>

            <form action={logoutAction}>
                <button type="submit" className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>
                    Sign Out
                </button>
            </form>
        </div>
    );
}
