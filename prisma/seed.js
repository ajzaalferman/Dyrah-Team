const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create Company
    const company = await prisma.company.create({
        data: {
            name: 'Acme Corp',
            policies: {
                create: [
                    { key: 'WORK_START_TIME', value: '09:00' },
                    { key: 'WORK_END_TIME', value: '17:00' }
                ]
            }
        }
    });

    console.log(`Created company: ${company.name} (${company.id})`);

    // 2. Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@acme.com',
            passwordHash: adminPassword,
            name: 'Admin User',
            role: 'ADMIN',
            companyId: company.id
        }
    });
    console.log(`Created admin: ${admin.email}`);

    // 3. Create Employee
    const empPassword = await bcrypt.hash('user123', 10);
    const employee = await prisma.user.create({
        data: {
            email: 'john@acme.com',
            passwordHash: empPassword,
            name: 'John Doe',
            role: 'EMPLOYEE',
            companyId: company.id,
            employeeId: 'EMP-001'
        }
    });
    console.log(`Created employee: ${employee.email}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
