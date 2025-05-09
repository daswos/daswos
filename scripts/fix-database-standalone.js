import pg from 'pg';
const { Pool } = pg;

// Database connection parameters - adjust these to match your setup
const connectionString = 'postgres://postgres:postgres@localhost:5432/daswos';

async function fixDatabaseSchema() {
  const pool = new Pool({
    connectionString: connectionString,
  });

  try {
    console.log('Connecting to PostgreSQL database...');
    const client = await pool.connect();
    
    console.log('Checking if family_owner_id column exists...');
    
    // First check if the column exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'family_owner_id'
    `;
    
    const result = await client.query(checkColumnQuery);
    
    if (result.rows.length === 0) {
      console.log('family_owner_id column does not exist, adding it...');
      
      // Add the missing column
      await client.query(`
        ALTER TABLE users ADD COLUMN family_owner_id INTEGER
      `);
      
      console.log('family_owner_id column added successfully!');
    } else {
      console.log('family_owner_id column already exists.');
    }
    
    client.release();
    console.log('Database schema fixed successfully!');
  } catch (error) {
    console.error('Error fixing database schema:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixDatabaseSchema();
