'use client';

import { deleteUserAction } from '@/app/admin-actions';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string | null;
    employeeId: string | null;
    createdAt: Date;
}

export default function UsersList({ users }: { users: User[] }) {
    async function handleDelete(userId: string, name: string) {
        if (!confirm(`Delete ${name}?`)) return;

        const res = await deleteUserAction(userId);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Employee deleted');
            window.location.reload();
        }
    }

    if (users.length === 0) {
        return <p className="text-muted text-center" style={{ padding: '2rem' }}>No employees yet.</p>;
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Name</th>
                        <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Email</th>
                        <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>ID</th>
                        <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Department</th>
                        <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Role</th>
                        <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '0.75rem' }}>{user.name}</td>
                            <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)' }}>{user.email}</td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{user.employeeId || '-'}</td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{user.department || '-'}</td>
                            <td style={{ padding: '0.75rem' }}>
                                <span style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    background: user.role === 'ADMIN' ? 'var(--color-primary)' : 'var(--color-surface)',
                                    color: user.role === 'ADMIN' ? 'white' : 'inherit'
                                }}>
                                    {user.role}
                                </span>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                                <button
                                    onClick={() => handleDelete(user.id, user.name)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
