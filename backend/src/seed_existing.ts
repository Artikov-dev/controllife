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

async function seed() {
  try {
    const client = await pool.connect();
    console.log('Connected to Render database. Seeding existing users...');

    // Fetch all users
    const usersRes = await client.query('SELECT id, full_name FROM users');
    console.log(`Found ${usersRes.rowCount} users in database.`);

    for (const user of usersRes.rows) {
      // Check if user has categories
      const catCountRes = await client.query('SELECT COUNT(*) FROM categories WHERE user_id = $1', [user.id]);
      const count = parseInt(catCountRes.rows[0].count, 10);

      if (count === 0) {
        console.log(`Seeding categories for user: ${user.full_name} (ID: ${user.id})...`);
        const defaultCategories = [
          { name: 'Oziq-ovqat', icon: 'ShoppingBag', color: '#f59e0b', type: 'expense', user_id: user.id },
          { name: 'Transport', icon: 'Car', color: '#3b82f6', type: 'expense', user_id: user.id },
          { name: 'Kommunal to\'lovlar', icon: 'Home', color: '#ef4444', type: 'expense', user_id: user.id },
          { name: 'Ko\'ngilochar', icon: 'Gamepad2', color: '#8b5cf6', type: 'expense', user_id: user.id },
          { name: 'Oylik maosh', icon: 'Briefcase', color: '#10b981', type: 'income', user_id: user.id },
          { name: 'Qo\'shimcha daromad', icon: 'Gift', color: '#06b6d4', type: 'income', user_id: user.id },
        ];

        for (const cat of defaultCategories) {
          await client.query(
            'INSERT INTO categories (name, icon, color, type, user_id) VALUES ($1, $2, $3, $4, $5)',
            [cat.name, cat.icon, cat.color, cat.type, cat.user_id]
          );
        }
      } else {
        console.log(`User ${user.full_name} (ID: ${user.id}) already has ${count} categories. Skipping.`);
      }
    }

    client.release();
    await pool.end();
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

seed();
