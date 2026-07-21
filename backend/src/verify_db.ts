import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
});

async function runTest() {
  try {
    const client = await pool.connect();
    console.log('Querying columns for recurring_transactions...\n');
    
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'recurring_transactions'
      ORDER BY ordinal_position
    `);
    
    if (res.rowCount === 0) {
      console.log('Table does not exist!');
    } else {
      res.rows.forEach((row: any) => {
        console.log(` - ${row.column_name}: ${row.data_type} (Nullable: ${row.is_nullable})`);
      });
    }

    client.release();
    await pool.end();
  } catch (error) {
    console.error('Schema check failed:', error);
  }
}

runTest();
