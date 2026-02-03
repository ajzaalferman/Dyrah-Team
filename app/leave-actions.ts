'use server';

import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function requestLeaveAction(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const type = formData.get('type') as string;
    const startDate = new Date(formData.get('startDate') as string);
    const endDate = new Date(formData.get('endDate') as string);
    const reason = formData.get('reason') as string;

    await prisma.leaveRequest.create({
        data: {
            userId: session.userId,
            type,
            startDate,
            endDate,
            reason,
            status: 'PENDING'
        }
    });

    return { success: true };
}

export async function getMyLeavesAction() {
    const session = await getSession();
    if (!session) return null;

    return await prisma.leaveRequest.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getPendingLeavesAction() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return null;

    return await prisma.leaveRequest.findMany({
        where: {
            user: { companyId: session.companyId },
            status: 'PENDING'
        },
        include: {
            user: {
                select: { name: true, employeeId: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function approveLeaveAction(leaveId: string, approved: boolean) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    await prisma.leaveRequest.update({
        where: { id: leaveId },
        data: {
            status: approved ? 'APPROVED' : 'REJECTED',
            approverId: session.userId
        }
    });

    return { success: true };
}
