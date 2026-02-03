import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAttendanceTrendAction } from '@/app/admin-actions';
import AttendanceChart from '@/components/admin/AttendanceChart';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        redirect('/login');
    }

    const companyId = session.companyId;

    // 1. Get Stats (Filtered by Company)
    const totalEmployees = await prisma.user.count({
        where: {
            role: 'EMPLOYEE',
            companyId
        }
    });

    // 2. Get Present Today (Unique Users)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const presentTodayResults = await prisma.attendanceRecord.groupBy({
        by: ['userId'],
        where: {
            user: { companyId },
            date: today,
            checkIn: { not: undefined }
        }
    });
    const presentToday = presentTodayResults.length;

    // 3. Late count (Unique Users)
    const lateTodayResults = await prisma.attendanceRecord.groupBy({
        by: ['userId'],
        where: {
            user: { companyId },
            date: today,
            status: 'LATE'
        }
    });
    const lateToday = lateTodayResults.length;

    // 4. Get Trend Data
    const trendData = await getAttendanceTrendAction();

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Dashboard</h1>
                <p className="text-muted">Overview of your organization's attendance.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card">
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>Total Employees</p>
                    <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>{totalEmployees}</h2>
                </div>
                <div className="card">
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>Present Today</p>
                    <h2 style={{ fontSize: '2rem', color: 'var(--color-success)' }}>{presentToday}</h2>
                </div>
                <div className="card">
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>Late Arrivals</p>
                    <h2 style={{ fontSize: '2rem', color: 'var(--color-warning)' }}>{lateToday}</h2>
                </div>
            </div>

            {trendData && !('error' in trendData) && (
                <AttendanceChart data={trendData as any} />
            )}

            <div className="card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Welcome, Admin</h3>
                <p className="text-muted">Select an option from the sidebar to manage employees or view reports.</p>
            </div>
        </div>
    );
}
