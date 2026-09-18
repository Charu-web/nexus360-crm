import http from 'http';
import { prisma } from '../lib/db';

const BASE_URL = 'http://localhost:5000';

function makeRequest(
  path: string,
  method: string = 'GET',
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = body ? JSON.stringify(body) : undefined;

    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          let parsedBody = responseData;
          try {
            parsedBody = JSON.parse(responseData);
          } catch {}
          resolve({
            status: res.statusCode || 0,
            body: parsedBody,
            headers: res.headers,
          });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runBuilderPlatformTestSuite() {
  console.log('===========================================================');
  console.log('  Starting Multi-Tenant SaaS CRM Builder Platform E2E Suite ');
  console.log('===========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} - ${detail}`);
      failed++;
    }
  }

  // 1. Provision User A & ABC CRM Workspace
  const userAEmail = `john.${Date.now()}@abctech.com`;
  const resProvisionA = await makeRequest('/api/v1/provision', 'POST', {
    fullName: 'John Doe',
    email: userAEmail,
    phone: '+1 555-0100',
    password: 'Password123!',
    companyName: 'ABC Technologies',
    template: 'GENERIC',
    plan: 'PRO',
  });

  assert(resProvisionA.status === 201 && resProvisionA.body.success === true, '1. Provision ABC Technologies CRM Workspace (201)', `Got ${resProvisionA.status}`);
  const tokenA = resProvisionA.body.accessToken;
  const tenantAId = resProvisionA.body.tenant.id;

  // 2. Fetch Modules for ABC CRM
  const resModulesA = await makeRequest('/api/v1/modules', 'GET', undefined, { Authorization: `Bearer ${tokenA}` });
  assert(resModulesA.status === 200 && Array.isArray(resModulesA.body.modules), '2. Fetch ABC CRM Modules', `Got ${resModulesA.status}`);

  // 3. Create Custom Module "Properties" for ABC CRM
  const resCreateCustomModA = await makeRequest('/api/v1/modules/custom', 'POST', {
    moduleKey: 'PROPERTIES',
    name: 'Properties',
    singularName: 'Property',
    pluralName: 'Properties',
    icon: 'Home',
    description: 'Real Estate Properties Catalog',
  }, { Authorization: `Bearer ${tokenA}` });

  assert(resCreateCustomModA.status === 201 && resCreateCustomModA.body.success === true, '3. Create Custom CRM Module "Properties" for ABC CRM', `Got ${resCreateCustomModA.status}`);

  // 4. Add Custom Field "Property Price" to PROPERTIES module
  const resCreateFieldA = await makeRequest('/api/v1/custom-fields', 'POST', {
    entityType: 'PROPERTIES',
    fieldName: 'Property Price',
    fieldType: 'CURRENCY',
    isRequired: true,
  }, { Authorization: `Bearer ${tokenA}` });

  assert(resCreateFieldA.status === 201 && resCreateFieldA.body.success === true, '4. Add Custom Field "Property Price" to Properties module', `Got ${resCreateFieldA.status}`);

  // 5. Create Custom Record "Luxury Villa Alpha" in PROPERTIES module for ABC CRM
  const resCreateRecordA = await makeRequest('/api/v1/records/PROPERTIES', 'POST', {
    title: 'Luxury Villa Alpha',
    data: { property_price: 15000000, location: 'Mumbai Coast' },
  }, { Authorization: `Bearer ${tokenA}` });

  assert(resCreateRecordA.status === 201 && resCreateRecordA.body.success === true, '5. Create Record "Luxury Villa Alpha" in ABC CRM Properties module', `Got ${resCreateRecordA.status}`);
  const recordAId = resCreateRecordA.body.record.id;

  // 6. Create Custom Pipeline for ABC CRM
  const resPipelineA = await makeRequest('/api/v1/pipelines', 'POST', {
    name: 'ABC Premium Sales Pipeline',
  }, { Authorization: `Bearer ${tokenA}` });
  assert(resPipelineA.status === 201 && resPipelineA.body.success === true, '6. Create Custom Pipeline for ABC CRM', `Got ${resPipelineA.status}`);

  // 7. Create Custom Saved View for ABC CRM
  const resViewA = await makeRequest('/api/v1/views/PROPERTIES', 'POST', {
    name: 'VIP Properties View',
    filters: [{ field: 'property_price', operator: 'gte', value: 10000000 }],
  }, { Authorization: `Bearer ${tokenA}` });
  assert(resViewA.status === 201 && resViewA.body.success === true, '7. Create Custom View "VIP Properties View" for ABC CRM', `Got ${resViewA.status}`);

  // 8. Configure Custom Dashboard Layout for ABC CRM
  const resDashA = await makeRequest('/api/v1/dashboard/config', 'POST', {
    widgets: [
      { widgetKey: 'total_leads', title: 'Total Leads', type: 'METRIC', visible: true },
      { widgetKey: 'properties_count', title: 'Properties Managed', type: 'METRIC', visible: true },
    ],
  }, { Authorization: `Bearer ${tokenA}` });
  assert(resDashA.status === 200 && resDashA.body.success === true, '8. Configure Custom Dashboard Layout for ABC CRM', `Got ${resDashA.status}`);

  // 9. Invite Team Member to ABC CRM
  const resInviteA = await makeRequest('/api/v1/tenant/users', 'POST', {
    fullName: 'Jane Sales',
    email: `jane.${Date.now()}@abctech.com`,
    password: 'Password123!',
    roleName: 'SALES',
  }, { Authorization: `Bearer ${tokenA}` });
  assert(resInviteA.status === 201 && resInviteA.body.success === true, '9. Invite Team Member to ABC CRM Workspace', `Got ${resInviteA.status}`);

  // 10. Provision User B & XYZ Solutions CRM Workspace
  const userBEmail = `alex.${Date.now()}@xyzsolutions.com`;
  const resProvisionB = await makeRequest('/api/v1/provision', 'POST', {
    fullName: 'Alex Smith',
    email: userBEmail,
    phone: '+1 555-0200',
    password: 'Password123!',
    companyName: 'XYZ Solutions',
    template: 'RECRUITMENT',
    plan: 'BUSINESS',
  });

  assert(resProvisionB.status === 201 && resProvisionB.body.success === true, '10. Provision XYZ Solutions CRM Workspace (201)', `Got ${resProvisionB.status}`);
  const tokenB = resProvisionB.body.accessToken;
  const tenantBId = resProvisionB.body.tenant.id;

  // 11. Strict Multi-Tenant Isolation Test: XYZ CRM user requests ABC CRM Properties
  const resRecordsXYZ = await makeRequest('/api/v1/records/PROPERTIES', 'GET', undefined, { Authorization: `Bearer ${tokenB}` });
  const xyzRecords = resRecordsXYZ.body.records || [];
  const leakedRecord = xyzRecords.find((r: any) => r.id === recordAId);

  assert(resRecordsXYZ.status === 200 && !leakedRecord, '11. MULTI-TENANT ISOLATION: XYZ CRM sees ZERO records from ABC CRM', `Data leak detected! Leaked record: ${JSON.stringify(leakedRecord)}`);

  // 12. Strict Unauthenticated Request Protection
  const resUnauthRecords = await makeRequest('/api/v1/records/PROPERTIES', 'GET');
  assert(resUnauthRecords.status === 401 && resUnauthRecords.body.success === false, '12. SECURITY: Unauthenticated API request to dynamic module records returns 401', `Got ${resUnauthRecords.status}`);

  // 13. Persistence Check: Fetch ABC CRM records after server operations
  const resFetchABCRecords = await makeRequest('/api/v1/records/PROPERTIES', 'GET', undefined, { Authorization: `Bearer ${tokenA}` });
  const abcRecords = resFetchABCRecords.body.records || [];
  const foundABCRecord = abcRecords.find((r: any) => r.id === recordAId);

  assert(resFetchABCRecords.status === 200 && !!foundABCRecord, '13. PERSISTENCE: Custom record "Luxury Villa Alpha" persists in ABC CRM', `Record missing!`);

  // Cleanup test records
  await prisma.customRecord.delete({ where: { id: recordAId } }).catch(() => {});

  console.log('\n===========================================================');
  console.log(`  Multi-Tenant SaaS CRM Builder E2E Suite Finished`);
  console.log(`  Total Passed: ${passed} | Total Failed: ${failed}`);
  console.log('===========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runBuilderPlatformTestSuite().catch((err) => {
  console.error('Fatal Builder Platform Test Suite Error:', err);
  process.exit(1);
});
