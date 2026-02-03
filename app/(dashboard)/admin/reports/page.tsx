'use client';

import { useState } from 'react';
import { exportAttendanceCSV } from '@/app/reporting-actions';
import { toast } from 'sonner';
import { Download } from 'lucide-react';

export default function ReportsPage() {
    const [loading, setLoading] = useState(false);

    async function handleExport() {
        setLoading(true);
        const res = await exportAttendanceCSV();
        if (res?.error) {
            toast.error(res.error);
        } else if (res?.csv) {
            // Download CSV
            const blob = new Blob([res.csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            toast.success('Report downloaded!');
        }
        setLoading(false);
    }

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Reports</h1>
                <p className="text-muted">Generate and export attendance reports.</p>
            </header>

            <div className="card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Attendance Export</h3>
                <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                    Download attendance records from the last 30 days as a CSV file.
                </p>
                <button
                    onClick={handleExport}
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                >
                    <Download size={18} />
                    {loading ? 'Generating...' : 'Export to CSV'}
                </button>
            </div>
        </div>
    );
}
