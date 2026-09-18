"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding Empire CRM Admin Panel Database...');
    // 1. Roles
    const superAdminRole = await prisma.role.upsert({
        where: { name: 'SUPER_ADMIN' },
        update: {},
        create: {
            name: 'SUPER_ADMIN',
            description: 'Super Administrator with complete system access',
            permissions: JSON.stringify(['*']),
        },
    });
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: {
            name: 'ADMIN',
            description: 'Standard Administrator with configurable module access',
            permissions: JSON.stringify(['users', 'leads', 'customers', 'reports', 'settings', 'activities']),
        },
    });
    const staffRole = await prisma.role.upsert({
        where: { name: 'STAFF' },
        update: {},
        create: {
            name: 'STAFF',
            description: 'CRM Staff Member',
            permissions: JSON.stringify([]),
        },
    });
    // 2. Users
    const superAdminPass = await bcryptjs_1.default.hash('SuperAdminPassword123!', 10);
    const superAdminUser = await prisma.user.upsert({
        where: { email: 'superadmin@empirecrm.io' },
        update: {},
        create: {
            fullName: 'Super Admin',
            email: 'superadmin@empirecrm.io',
            password: superAdminPass,
            phone: '+1 (555) 000-1111',
            department: 'Executive Management',
            designation: 'Chief Technology Officer',
            roleId: superAdminRole.id,
            isActive: true,
        },
    });
    const adminPass = await bcryptjs_1.default.hash('AdminPassword123!', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@empirecrm.io' },
        update: {},
        create: {
            fullName: 'Preeti Patel',
            email: 'admin@empirecrm.io',
            password: adminPass,
            phone: '+1 (555) 222-3333',
            department: 'Sales & Operations',
            designation: 'Store Manager',
            roleId: adminRole.id,
            isActive: true,
        },
    });
    const staffPass = await bcryptjs_1.default.hash('UserPassword123!', 10);
    const staffUser = await prisma.user.upsert({
        where: { email: 'user@empirecrm.io' },
        update: {},
        create: {
            fullName: 'Rahul Sharma',
            email: 'user@empirecrm.io',
            password: staffPass,
            phone: '+1 (555) 444-5555',
            department: 'Sales',
            designation: 'Sales Specialist',
            roleId: staffRole.id,
            isActive: true,
        },
    });
    // 3. Leads
    const lead1 = await prisma.lead.upsert({
        where: { leadId: 'EMP-LD-1001' },
        update: {},
        create: {
            leadId: 'EMP-LD-1001',
            customerName: 'Aarav Mehta',
            phone: '+91 9876543210',
            email: 'aarav.m@example.com',
            city: 'Mumbai',
            loanType: 'Home Loan',
            amount: 4500000,
            source: 'Website',
            status: 'Converted',
            assignedToId: adminUser.id,
            notes: 'High priority customer seeking prime home financing.',
        },
    });
    const lead2 = await prisma.lead.upsert({
        where: { leadId: 'EMP-LD-1002' },
        update: {},
        create: {
            leadId: 'EMP-LD-1002',
            customerName: 'Ananya Verma',
            phone: '+91 9812345678',
            email: 'ananya.v@example.com',
            city: 'Delhi',
            loanType: 'Business Loan',
            amount: 2500000,
            source: 'Referral',
            status: 'In Progress',
            assignedToId: staffUser.id,
            notes: 'Docs under evaluation.',
        },
    });
    const lead3 = await prisma.lead.upsert({
        where: { leadId: 'EMP-LD-1003' },
        update: {},
        create: {
            leadId: 'EMP-LD-1003',
            customerName: 'Vikram Singh',
            phone: '+91 9988776655',
            email: 'vikram.s@example.com',
            city: 'Bangalore',
            loanType: 'Personal Loan',
            amount: 750000,
            source: 'Facebook',
            status: 'New',
            assignedToId: staffUser.id,
            notes: 'Newly generated inbound query.',
        },
    });
    // 4. Customers
    const customer1 = await prisma.customer.upsert({
        where: { customerId: 'EMP-CUST-5001' },
        update: {},
        create: {
            customerId: 'EMP-CUST-5001',
            name: 'Aarav Mehta',
            email: 'aarav.m@example.com',
            phone: '+91 9876543210',
            city: 'Mumbai',
            company: 'Mehta Enterprises',
            status: 'Active',
            totalDeals: 1,
            lifetimeValue: 4500000,
        },
    });
    // 5. Tasks & Notes
    await prisma.task.create({
        data: {
            title: 'Follow up on document verification for Ananya Verma',
            description: 'Collect GST certificate and last 6 months bank statement.',
            priority: 'High',
            status: 'Pending',
            dueDate: new Date(Date.now() + 86400000 * 2),
            assignedToId: staffUser.id,
            leadId: lead2.id,
        },
    });
    await prisma.note.create({
        data: {
            content: 'Initial call completed. Client is very interested in low interest rate scheme.',
            leadId: lead1.id,
            createdById: adminUser.id,
        },
    });
    // 6. System Settings
    const settings = [
        { key: 'company_name', value: 'Empire CRM', category: 'General', description: 'Company Name' },
        { key: 'support_email', value: 'support@empirecrm.io', category: 'General', description: 'Support Contact Email' },
        { key: 'session_timeout_minutes', value: '60', category: 'Security', description: 'Session inactivity timeout' },
        { key: 'require_2fa', value: 'false', category: 'Security', description: 'Require Two-Factor Auth' },
    ];
    for (const s of settings) {
        await prisma.systemSetting.upsert({
            where: { key: s.key },
            update: {},
            create: s,
        });
    }
    // 7. Initial Audit Log & Activity
    await prisma.auditLog.create({
        data: {
            userId: superAdminUser.id,
            action: 'SYSTEM_INITIALIZATION',
            entity: 'System',
            details: 'Empire CRM Admin Panel database initialized and seeded.',
            ipAddress: '127.0.0.1',
        },
    });
    await prisma.activity.create({
        data: {
            title: 'Database Seeded',
            details: 'Initial admin roles, users, and CRM records created.',
            type: 'INFO',
            entityType: 'System',
            userId: superAdminUser.id,
        },
    });
    console.log('Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
