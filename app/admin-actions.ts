'use server';

import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function createUserAction(formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string || 'EMPLOYEE';
    const department = formData.get('department') as string;
    const employeeId = formData.get('employeeId') as string;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return { error: 'User with this email already exists' };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            email,
            name,
            passwordHash,
            role,
            department,
            employeeId,
            companyId: session.companyId
        }
    });

    return { success: true };
}

export async function getUsersAction() {
    const session = await getSession();
    if (!session) return null;

    const users = await prisma.user.findMany({
        where: { companyId: session.companyId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true,
            employeeId: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return users;
}

export async function deleteUserAction(userId: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    await prisma.user.delete({ where: { id: userId } });
    return { success: true };
}

export async function getAttendanceRecordsAction(dateFilter?: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    // Default to last 30 days
    const date = dateFilter ? new Date(dateFilter) : new Date();
    date.setDate(date.getDate() - 30);
    date.setHours(0, 0, 0, 0);

    const records = await prisma.attendanceRecord.findMany({
        where: {
            user: { companyId: session.companyId },
            date: { gte: date }
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    employeeId: true,
                    department: true
                }
            }
        },
        orderBy: { date: 'desc' },
        take: 100 // Limit to most recent 100 records
    });

    return records;
}

export async function getCompanyAction() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    const company = await prisma.company.findUnique({
        where: { id: session.companyId }
    });

    return company;
}

export async function updateCompanySettingsAction(formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const workStartTime = formData.get('workStartTime') as string;
    const workEndTime = formData.get('workEndTime') as string;
    const officeLatitude = parseFloat(formData.get('officeLatitude') as string) || 0;
    const officeLongitude = parseFloat(formData.get('officeLongitude') as string) || 0;
    const geofenceRadius = parseInt(formData.get('geofenceRadius') as string) || 100;

    try {
        await prisma.company.update({
            where: { id: session.companyId },
            data: {
                name,
                workStartTime,
                workEndTime,
                officeLatitude,
                officeLongitude,
                geofenceRadius
            } as any // Cast to any to bypass the out-of-sync Prisma types
        });
        return { success: true };
    } catch (e: any) {
        console.error('Update settings error:', e);
        return { error: e.message || 'Failed to update settings' };
    }
}

export async function getAttendanceTrendAction() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29); // Total 30 days

    const records = await prisma.attendanceRecord.findMany({
        where: {
            user: { companyId: session.companyId },
            date: { gte: startDate, lte: today }
        },
        select: {
            date: true,
            status: true,
            userId: true
        },
        orderBy: { date: 'asc' }
    });

    // Group by date
    const dailyData: Record<string, { date: string, present: number, late: number }> = {};

    const getLocalDateStr = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Initialize all dates in range
    const current = new Date(startDate);
    while (current <= today) {
        const dateStr = getLocalDateStr(current);
        dailyData[dateStr] = { date: dateStr, present: 0, late: 0 };
        current.setDate(current.getDate() + 1);
    }

    // Tracks unique users per day
    const seenUsersPerDay: Record<string, Set<string>> = {};

    records.forEach(r => {
        const dateStr = getLocalDateStr(r.date);
        if (!dailyData[dateStr]) return;

        if (!seenUsersPerDay[dateStr]) {
            seenUsersPerDay[dateStr] = new Set();
        }

        if (!seenUsersPerDay[dateStr].has(r.userId)) {
            seenUsersPerDay[dateStr].add(r.userId);
            if (r.status === 'LATE') {
                dailyData[dateStr].late++;
            } else if (r.status === 'PRESENT') {
                dailyData[dateStr].present++;
            }
        }
    });

    return Object.values(dailyData);
}
