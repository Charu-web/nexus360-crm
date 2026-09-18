import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export async function runMigrations(): Promise<{ success: boolean; executedCount: number; tableCount: number; tables: string[]; error?: string }> {
  console.log('====================================================');
  console.log('  EMPIRE CRM - SUPABASE SQL MIGRATION RUNNER        ');
  console.log('====================================================');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.startsWith('file:') || databaseUrl.includes('YOUR_SUPABASE_DB_PASSWORD')) {
    console.error('CRITICAL ERROR: DATABASE_URL is not configured for PostgreSQL/Supabase!');
    console.error('Please set DATABASE_URL in .env to your hosted Supabase PostgreSQL connection string.');
    return {
      success: false,
      executedCount: 0,
      tableCount: 0,
      tables: [],
      error: 'DATABASE_URL is not set to a valid PostgreSQL/Supabase connection string.',
    };
  }

  console.log(`\nConnecting to PostgreSQL database at: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`);

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('sslmode=disable') ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    const client = await pool.connect();
    console.log('   ✓ Connected to PostgreSQL successfully!');
    client.release();
  } catch (err: any) {
    console.error('   ❌ Database Connection Failed:', err.message);
    await pool.end();
    return {
      success: false,
      executedCount: 0,
      tableCount: 0,
      tables: [],
      error: `Failed to connect to database: ${err.message}`,
    };
  }

  const migrationsDir = path.join(__dirname, '../../supabase/migrations');
  console.log(`\nScanning migration directory: ${migrationsDir}`);

  if (!fs.existsSync(migrationsDir)) {
    await pool.end();
    return {
      success: false,
      executedCount: 0,
      tableCount: 0,
      tables: [],
      error: `Migrations directory does not exist at ${migrationsDir}`,
    };
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql') && f.match(/^\d{4}_/))
    .sort();

  console.log(`Found ${files.length} sequential migration file(s) to execute:\n`);

  let executedCount = 0;

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`Executing [${file}]...`);
    const client = await pool.connect();
    try {
      await client.query(sql);
      executedCount++;
      console.log(`   ✓ ${file} executed successfully.`);
    } catch (err: any) {
      console.error(`   ❌ Failed executing ${file}:`, err.message);
      client.release();
      await pool.end();
      return {
        success: false,
        executedCount,
        tableCount: 0,
        tables: [],
        error: `Error in migration ${file}: ${err.message}`,
      };
    } finally {
      client.release();
    }
  }

  // Fetch final list of tables in public schema
  const tablesRes = await pool.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;`
  );
  const tables = tablesRes.rows.map((r: any) => r.table_name);

  await pool.end();

  console.log('\n====================================================');
  console.log(`   MIGRATION COMPLETE: ${executedCount}/${files.length} SQL Files Executed Successfully`);
  console.log(`   TOTAL CRM TABLES IN PUBLIC SCHEMA: ${tables.length}`);
  console.log('====================================================');

  return {
    success: true,
    executedCount,
    tableCount: tables.length,
    tables,
  };
}

if (require.main === module) {
  runMigrations()
    .then((res) => {
      if (!res.success) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal Migration Error:', err);
      process.exit(1);
    });
}
