// Script to update product categories in the database
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateCategories() {
  const client = await pool.connect();
  try {
    console.log('Connected to database');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'update-product-categories.sql');
    const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Executing SQL commands...');
    
    // Execute the SQL commands
    await client.query(sqlCommands);
    
    console.log('Categories and products updated successfully');
    
    // Verify the updates
    const categoryResult = await client.query('SELECT * FROM categories');
    console.log(`Categories in database: ${categoryResult.rows.length}`);
    categoryResult.rows.forEach(row => {
      console.log(`- ${row.name}`);
    });
    
    const productResult = await client.query('SELECT title, category_id, tags, ai_attributes FROM products');
    console.log(`\nProducts with categories: ${productResult.rows.length}`);
    productResult.rows.forEach(row => {
      console.log(`- ${row.title} (Category ID: ${row.category_id})`);
      console.log(`  Tags: ${row.tags}`);
      console.log(`  AI Attributes: ${JSON.stringify(row.ai_attributes)}`);
    });
    
  } catch (err) {
    console.error('Error executing SQL commands:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

updateCategories().catch(console.error);
