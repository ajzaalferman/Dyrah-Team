'use server';

import { PrismaClient } from '@prisma/client';
import { createSession, clearSession, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// --- Auth Actions ---

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
        return { error: 'Invalid credentials' };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        return { error: 'Invalid credentials' };
    }

    await createSession(user.id, user.role, user.companyId);

    // Redirect based on role
    if (user.role === 'ADMIN') {
        redirect('/admin');
    } else {
        redirect('/employee');
    }
}

export async function logoutAction() {
    await clearSession();
    redirect('/');
}

// --- Attendance Actions ---

export async function getStatusAction() {
    const session = await getSession();
    if (!session) return null;

    // Check if clocked in today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const record = await prisma.attendanceRecord.findFirst({
        where: {
            userId: session.userId,
            date: startOfDay
        },
        orderBy: { createdAt: 'desc' }
    });

    return record;
}

export async function clockInAction(lat?: number, lng?: number, photoUrl?: string) {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Simple duplicate check
    const existing = await prisma.attendanceRecord.findFirst({
        where: { userId: session.userId, date: startOfDay }
    });

    if (existing && !existing.checkOut) {
        return { error: 'Already clocked in' };
    }

    // Get company for geofencing
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { company: true }
    });

    // Determine status (Configurable Policy)
    const startTimeStr = user?.company.workStartTime || "09:00";
    const [startHour, startMin] = startTimeStr.split(':').map(Number);
    const workStart = new Date(now);
    workStart.setHours(startHour, startMin + 15, 0, 0); // 15 min grace period
    let status = now > workStart ? 'LATE' : 'PRESENT';

    // Geofencing check
    let method = 'WEB';
    if (lat && lng && user?.company.officeLatitude && user?.company.officeLongitude) {
        const { isWithinGeofence } = await import('@/lib/geolocation');
        const withinFence = isWithinGeofence(
            lat,
            lng,
            user.company.officeLatitude,
            user.company.officeLongitude,
            user.company.geofenceRadius
        );

        method = withinFence ? 'GPS' : 'REMOTE';

        // Optional: Block if not within geofence
        // if (!withinFence) {
        //     return { error: 'You must be at the office to clock in' };
        // }
    }

    await prisma.attendanceRecord.create({
        data: {
            userId: session.userId,
            date: startOfDay,
            checkIn: now,
            status: status,
            location: lat && lng ? JSON.stringify({ lat, lng }) : undefined,
            method,
            photoUrl
        }
    });

    return { success: true };
}

export async function clockOutAction(lat?: number, lng?: number) {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');

    // Find active record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.attendanceRecord.findFirst({
        where: { userId: session.userId, date: today, checkOut: null }
    });

    if (!record) return { error: 'No active session found' };

    await prisma.attendanceRecord.update({
        where: { id: record.id },
        data: {
            checkOut: new Date()
        }
    });

    return { success: true };
}
