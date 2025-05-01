import pg from 'pg';
const { Pool } = pg;

// Database connection parameters
const connectionString = 'postgres://postgres:postgres@localhost:5432/daswos';

async function addColumn() {
  const pool = new Pool({
    connectionString: connectionString,
  });

  try {
    console.log('Connecting to PostgreSQL database...');
    
    // SQL command to add the column
    const sqlCommand = 'ALTER TABLE users ADD COLUMN IF NOT EXISTS family_owner_id INTEGER;';
    
    console.log('Executing SQL command:', sqlCommand);
    await pool.query(sqlCommand);
    
    console.log('Column added successfully!');
  } catch (error) {
    console.error('Error adding column:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addColumn();
