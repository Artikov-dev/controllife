import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend/
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

console.log('Database URL parsed:', process.env.DATABASE_URL ? 'YES' : 'NO');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
});

async function runTest() {
  try {
    console.log('Testing connection to Render PostgreSQL database...');
    const start = Date.now();
    const client = await pool.connect();
    console.log(`Connected successfully in ${Date.now() - start}ms!`);
    
    console.log('Querying table information...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Found tables:');
    tables.rows.forEach((row: any) => {
      console.log(` - ${row.table_name}`);
    });

    // Check user count
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    console.log(`\nTotal users in database: ${usersCount.rows[0].count}`);

    client.release();
    await pool.end();
    console.log('\nVerification completed successfully!');
  } catch (error) {
    console.error('Database verification failed:', error);
    process.exit(1);
  }
}

runTest();
