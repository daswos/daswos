import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkTables() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Query to list all tables in the public schema
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('Tables in the public schema:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

checkTables();
