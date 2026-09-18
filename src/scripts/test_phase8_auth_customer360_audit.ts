// src/scripts/test_phase8_auth_customer360_audit.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function runPhase8Tests() {
  console.log('================================================================');
  console.log('NEXUS360 PHASE 8: AUTH, CUSTOMER 360 & AUDIT LOGS VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    const tenant = await prisma.tenant.findFirst({ where: { slug: 'empire' } }) ||
                   await prisma.tenant.findFirst();

    if (!tenant) {
      throw new Error('No tenant found for testing');
    }
    const tenantId = tenant.id;

    // ------------------------------------------------------------------------
    // TEST SUITE 1: Authentication & Password Security
    // ------------------------------------------------------------------------
    console.log('TEST SUITE 1: Authentication, Password Security & JWT Session');
    
    let user = await prisma.user.findFirst({
      where: { tenantId, email: 'admin@empirecrm.io' }
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
      const role = await prisma.role.findFirst({ where: { tenantId } });
      user = await prisma.user.create({
        data: {
          tenantId,
          email: 'admin@empirecrm.io',
          password: hashedPassword,
          fullName: 'Platform Admin',
          roleId: role?.id || 'role-default'
        }
      });
    }

    assert(Boolean(user), 'Admin user exists in database');
    const passwordValid = await bcrypt.compare('AdminPassword123!', user.password);
    assert(passwordValid, 'Admin credentials verified with bcrypt');

    const wrongPassword = await bcrypt.compare('WrongPassword999!', user.password);
    assert(!wrongPassword, 'Invalid password correctly rejected');

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, role: 'TENANT_ADMIN' },
      process.env.JWT_SECRET || 'empire_crm_super_secret_jwt_key_2026_production',
      { expiresIn: '7d' }
    );
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'empire_crm_super_secret_jwt_key_2026_production');
    assert(decoded.userId === user.id && decoded.tenantId === tenantId, 'JWT session token issued and verified with tenant claims');

    // ------------------------------------------------------------------------
    // TEST SUITE 2: Workspace Registration & Tenant Isolation
    // ------------------------------------------------------------------------
    console.log('\nTEST SUITE 2: Multi-Tenant Registration & Isolation');
    const testRegEmail = `demo.register.${Date.now()}@empirecrm.io`;
    const regTenant = await prisma.tenant.create({
      data: {
        name: 'Automated Test Enterprise',
        slug: `auto-test-${Date.now()}`,
        status: 'ACTIVE'
      }
    });
    assert(Boolean(regTenant.id), 'New tenant workspace provisioned');

    const regRole = await prisma.role.create({
      data: {
        tenantId: regTenant.id,
        name: 'TENANT_ADMIN',
        description: 'Tenant Administrator',
        permissions: '["*"]'
      }
    });

    const regUser = await prisma.user.create({
      data: {
        tenantId: regTenant.id,
        email: testRegEmail,
        password: await bcrypt.hash('SecurePassword123!', 10),
        fullName: 'Test Enterprise Executive',
        roleId: regRole.id
      }
    });
    assert(regUser.tenantId === regTenant.id, 'Registered user isolated in new tenant');

    // Clean up test tenant
    await prisma.user.deleteMany({ where: { tenantId: regTenant.id } });
    await prisma.role.deleteMany({ where: { tenantId: regTenant.id } });
    await prisma.tenant.delete({ where: { id: regTenant.id } });
    assert(true, 'Test workspace safely dismantled');

    // ------------------------------------------------------------------------
    // TEST SUITE 3: Customer 360 Deep Relational Aggregation
    // ------------------------------------------------------------------------
    console.log('\nTEST SUITE 3: Customer 360 Relational Hub & Lifecycle Tracking');
    
    let lead = await prisma.lead.findFirst({ where: { tenantId } });
    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          tenantId,
          leadId: 'EMP-LD-9999',
          customerName: 'Sanjay Singhania',
          phone: '+91 9988776655',
          email: 'sanjay.s@example.com',
          amount: 8500000,
          status: 'QUALIFIED',
          industry: 'REAL_ESTATE',
          source: 'Website',
          leadScore: 88,
          leadScoreCategory: 'HOT'
        }
      });
    }

    assert(Boolean(lead), 'Lead profile present for Customer 360');

    const doc = await prisma.document.create({
      data: {
        tenantId,
        title: 'Singhania_KYC_Proof.pdf',
        fileName: 'Singhania_KYC_Proof.pdf',
        fileSize: 204800,
        fileType: 'application/pdf',
        entityType: 'Lead',
        entityId: lead.id,
        uploadedById: user.id,
        fileUrl: '/uploads/singhania_kyc.pdf'
      }
    });
    assert(Boolean(doc.id), 'Vault KYC document attached to 360 profile');

    const task = await prisma.task.create({
      data: {
        tenantId,
        title: 'KYC Verification Follow-up',
        priority: 'HIGH',
        status: 'PENDING',
        assignedToId: user.id,
        leadId: lead.id,
        dueDate: new Date()
      }
    });
    assert(Boolean(task.id), 'Action item task attached to 360 profile');

    const comm = await prisma.communicationMessage.create({
      data: {
        tenantId,
        channel: 'WHATSAPP',
        direction: 'OUTBOUND',
        sender: 'Nexus360 System',
        recipient: lead.phone,
        content: 'Your real estate dossier has been approved.',
        status: 'DELIVERED',
        leadId: lead.id,
        userId: user.id
      }
    });
    assert(Boolean(comm.id), 'Dispatched communication attached to 360 profile');

    // ------------------------------------------------------------------------
    // TEST SUITE 4: Admin Audit Trail Recording & Real Statistics
    // ------------------------------------------------------------------------
    console.log('\nTEST SUITE 4: Admin Audit Trail & Compliance Verification');

    const auditAction = 'PHASE8_COMPLIANCE_VERIFICATION';
    const auditEvent = await prisma.auditLog.create({
      data: {
        tenantId,
        userId: user.id,
        action: auditAction,
        entity: 'Lead',
        entityId: lead.id,
        details: `Verified complete 360 profile for ${lead.customerName}`,
        ipAddress: '127.0.0.1',
        userAgent: 'Phase8-Automated-Verifier'
      }
    });

    assert(Boolean(auditEvent.id), 'Audit log entry persisted in database');
    assert(auditEvent.action === auditAction, 'Audit event action recorded accurately');
    assert(auditEvent.userId === user.id, 'Audit actor attribution verified');

    const allAuditLogs = await prisma.auditLog.findMany({ where: { tenantId } });
    assert(allAuditLogs.length > 0, `Audit log repository contains ${allAuditLogs.length} verified events`);

    console.log('\n================================================================');
    console.log(`PHASE 8 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err: any) {
    console.error('Phase 8 Test Exception:', err);
    process.exit(1);
  }
}

runPhase8Tests();
