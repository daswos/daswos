/**
 * Script to add the app_settings table to the database
 */
import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

// Create a PostgreSQL client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addAppSettingsTable() {
  const client = await pool.connect();
  try {
    console.log('Creating app_settings table...');
    
    // Create app_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);
    
    // Add initial settings
    await client.query(`
      INSERT INTO app_settings (key, value)
      VALUES 
        ('paidFeaturesDisabled', 'false'::jsonb),
        ('safesphereDevMode', 'false'::jsonb),
        ('aiShopperDevMode', 'false'::jsonb),
        ('safesphereDevMessage', '""'::jsonb),
        ('aiShopperDevMessage', '""'::jsonb)
      ON CONFLICT (key) DO NOTHING;
    `);
    
    console.log('App settings table created and initialized successfully!');
  } catch (error) {
    console.error('Error creating app_settings table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the migration
addAppSettingsTable()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });