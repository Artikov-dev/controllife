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

async function runMigration() {
  try {
    const client = await pool.connect();
    console.log('Connected to Render database. Applying migrations...');

    // 1. Add "role" column to users
    console.log('Adding "role" column to users table...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin'))
    `);
    
    // 2. Add "is_blocked" column to users
    console.log('Adding "is_blocked" column to users table...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false
    `);

    console.log('Migrations applied successfully!');
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
