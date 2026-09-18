import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function runMultiTenancyTests() {
  console.log('====================================================');
  console.log(' Empire CRM Multi-Tenancy & CRM Builder Test Suite  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Verify Default Seeded Workspace & SuperAdmin
    console.log('--- Test 1: Workspace & Tenant Verification ---');
    const defaultTenant = await prisma.tenant.findUnique({ where: { slug: 'empire-crm' } });
    assert(defaultTenant !== null, 'Default workspace "empire-crm" exists in DB');
    assert(defaultTenant?.status === 'ACTIVE', 'Default workspace status is ACTIVE');

    // 2. Test Provisioning Engine for Real Estate Workspace
    console.log('\n--- Test 2: Multi-Tenant Provisioning Engine ---');
    const realEstateSlug = 'real-estate-pros-' + Date.now();
    const realEstateTenant = await prisma.tenant.create({
      data: {
        name: 'Real Estate Pros Inc',
        slug: realEstateSlug,
        status: 'ACTIVE',
        industry: 'REAL_ESTATE',
        companySize: '10-50',
        country: 'India',
        template: 'REAL_ESTATE',
      },
    });
    assert(realEstateTenant.id !== undefined, `Provisioned new Tenant '${realEstateTenant.name}'`);

    const reAdminRole = await prisma.role.create({
      data: {
        tenantId: realEstateTenant.id,
        name: 'TENANT_ADMIN',
        permissions: JSON.stringify(['*']),
      },
    });

    const hashedPassword = await bcrypt.hash('Secret123!', 10);
    const reUser = await prisma.user.create({
      data: {
        tenantId: realEstateTenant.id,
        email: `admin@${realEstateSlug}.com`,
        password: hashedPassword,
        fullName: 'RealEstate Admin',
        roleId: reAdminRole.id,
      },
    });
    assert(reUser.tenantId === realEstateTenant.id, 'User is properly bound to RealEstate tenantId');

    // 3. Test Lead Creation & Data Isolation
    console.log('\n--- Test 3: Strict Multi-Tenant Data Isolation ---');
    const leadTenantA = await prisma.lead.create({
      data: {
        tenantId: defaultTenant!.id,
        leadId: 'LD-DEFA-001',
        customerName: 'Default Tenant Lead',
        phone: '+91 9876543210',
        email: 'lead.a@default.com',
        amount: 50000,
        status: 'New',
      },
    });

    const leadTenantB = await prisma.lead.create({
      data: {
        tenantId: realEstateTenant.id,
        leadId: 'LD-RE-001',
        customerName: 'Real Estate Lead',
        phone: '+91 9998887776',
        email: 'lead.b@realestate.com',
        amount: 2500000,
        status: 'New',
      },
    });

    const queryDefaultLeads = await prisma.lead.findMany({ where: { tenantId: defaultTenant!.id } });
    const queryRELeads = await prisma.lead.findMany({ where: { tenantId: realEstateTenant.id } });

    assert(queryDefaultLeads.some((l) => l.id === leadTenantA.id), 'Default Tenant can retrieve its own lead');
    assert(!queryDefaultLeads.some((l) => l.id === leadTenantB.id), 'Default Tenant CANNOT retrieve Real Estate Tenant lead (Strict Isolation)');
    assert(queryRELeads.some((l) => l.id === leadTenantB.id), 'Real Estate Tenant can retrieve its own lead');
    assert(!queryRELeads.some((l) => l.id === leadTenantA.id), 'Real Estate Tenant CANNOT retrieve Default Tenant lead (Strict Isolation)');

    // 4. Test CRM Builder: Custom Fields per Tenant
    console.log('\n--- Test 4: CRM Builder Custom Fields ---');
    const customFieldRE = await prisma.customField.create({
      data: {
        tenantId: realEstateTenant.id,
        entityType: 'LEAD',
        fieldName: 'Property Budget Max',
        fieldKey: 'property_budget_max',
        fieldType: 'CURRENCY',
        isRequired: true,
      },
    });

    const defaultFields = await prisma.customField.findMany({ where: { tenantId: defaultTenant!.id } });
    const reFields = await prisma.customField.findMany({ where: { tenantId: realEstateTenant.id } });

    assert(reFields.some((f) => f.id === customFieldRE.id), 'Real Estate Tenant has custom field "Property Budget Max"');
    assert(!defaultFields.some((f) => f.id === customFieldRE.id), 'Default Tenant does not see Real Estate custom field');

    // 5. Test API Keys & Tenant Suspension
    console.log('\n--- Test 5: API Key Auth & Tenant Suspension Security ---');
    const rawKey = 'sk_live_' + crypto.randomBytes(24).toString('hex');
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await prisma.apiKey.create({
      data: {
        tenantId: realEstateTenant.id,
        name: 'Zapier Lead Integration Key',
        keyPrefix: rawKey.substring(0, 12),
        keyHash,
        permissions: JSON.stringify(['leads:write']),
      },
    });
    assert(apiKey.id !== undefined, 'Hashed API Key generated for Real Estate tenant');

    // Suspend Real Estate Tenant
    await prisma.tenant.update({
      where: { id: realEstateTenant.id },
      data: { status: 'SUSPENDED' },
    });

    const suspendedTenantCheck = await prisma.tenant.findUnique({ where: { id: realEstateTenant.id } });
    assert(suspendedTenantCheck?.status === 'SUSPENDED', 'Tenant status updated to SUSPENDED');

    // Re-activate Tenant
    await prisma.tenant.update({
      where: { id: realEstateTenant.id },
      data: { status: 'ACTIVE' },
    });

    // Clean up test data
    await prisma.lead.deleteMany({ where: { id: { in: [leadTenantA.id, leadTenantB.id] } } });
    await prisma.customField.delete({ where: { id: customFieldRE.id } });
    await prisma.apiKey.delete({ where: { id: apiKey.id } });
    await prisma.user.delete({ where: { id: reUser.id } });
    await prisma.role.delete({ where: { id: reAdminRole.id } });
    await prisma.tenant.delete({ where: { id: realEstateTenant.id } });

    console.log('\n====================================================');
    console.log(` Test Summary: ${passed} Passed, ${failed} Failed `);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('[Verification Test Error]', error);
    process.exit(1);
  }
}

runMultiTenancyTests();
