import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkUserInDb() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Query to get the user with ID 2
    const result = await client.query(`
      SELECT id, username, email, full_name, subscription_type, has_subscription
      FROM users
      WHERE id = 2
    `);

    if (result.rows.length > 0) {
      console.log('User found in database:');
      console.log(result.rows[0]);
    } else {
      console.log('User not found in database');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

checkUserInDb();
