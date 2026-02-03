import { getAttendanceRecordsAction } from '@/app/admin-actions';
import AttendanceRecordsTable from '@/components/admin/AttendanceRecordsTable';

export default async function AttendancePage() {
    const records = await getAttendanceRecordsAction();

    if ('error' in records) {
        return <div>Error: {records.error}</div>;
    }

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Attendance Records</h1>
                <p className="text-muted">View employee clock-in records with photos and details.</p>
            </header>

            <div className="card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Check-ins (Last 30 Days)</h3>
                <AttendanceRecordsTable records={records} />
            </div>
        </div>
    );
}
