'use server';

import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function exportAttendanceCSV(startDate?: string, endDate?: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const end = endDate ? new Date(endDate) : new Date();

    const records = await prisma.attendanceRecord.findMany({
        where: {
            user: { companyId: session.companyId },
            date: { gte: start, lte: end }
        },
        include: {
            user: {
                select: {
                    name: true,
                    employeeId: true,
                    department: true
                }
            }
        },
        orderBy: { date: 'desc' }
    });

    // Generate CSV
    const headers = ['Date', 'Employee Name', 'Employee ID', 'Department', 'Check In', 'Check Out', 'Status', 'Method'];
    const rows = records.map(r => [
        r.date.toISOString().split('T')[0],
        r.user.name,
        r.user.employeeId || '-',
        r.user.department || '-',
        r.checkIn.toLocaleTimeString(),
        r.checkOut ? r.checkOut.toLocaleTimeString() : '-',
        r.status,
        r.method
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    return { csv };
}
