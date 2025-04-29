import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addShoes() {
  const client = await pool.connect();

  try {
    console.log('Connected to database');

    // Get a seller user ID
    const sellerResult = await client.query(`
      SELECT id, full_name FROM users WHERE is_seller = true LIMIT 1
    `);

    let sellerId, sellerName;

    if (sellerResult.rows.length === 0) {
      console.log('No seller found, creating a test seller');
      // Create a test seller if none exists
      const newSellerResult = await client.query(`
        INSERT INTO users (
          username, password, email, full_name, is_seller, is_admin, created_at
        ) VALUES (
          'shoeseller', '$2b$10$XdJo8mhZ5W.gsuBazh9xPuRbPUTQxEBSZ7QhY4fSMGPzjc9LrV5Aq', 'shoe@seller.com',
          'Shoe Seller', true, false, NOW()
        ) RETURNING id, full_name
      `);
      sellerId = newSellerResult.rows[0].id;
      sellerName = newSellerResult.rows[0].full_name;
    } else {
      sellerId = sellerResult.rows[0].id;
      sellerName = sellerResult.rows[0].full_name;
    }

    console.log(`Using seller: ${sellerName} (ID: ${sellerId})`);

    // Shoe products to add
    const shoeProducts = [
      {
        title: 'Running Shoes - Blue/White',
        description: 'Lightweight running shoes with cushioned soles for maximum comfort. Perfect for daily runs and training sessions.',
        price: 7999, // $79.99
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
        sellerId: sellerId,
        sellerName: sellerName,
        sellerVerified: true,
        sellerType: 'merchant',
        trustScore: 88,
        tags: ['shoes', 'running', 'athletic', 'sports'],
        shipping: 'standard',
        isBulkBuy: false,
        originalPrice: 9999,
        discount: 20,
        imageDescription: 'Blue and white running shoes with mesh upper and rubber sole'
      },
      {
        title: 'Leather Dress Shoes - Brown',
        description: 'Classic brown leather dress shoes with a polished finish. Ideal for formal occasions and business attire.',
        price: 12999, // $129.99
        imageUrl: 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1',
        sellerId: sellerId,
        sellerName: sellerName,
        sellerVerified: true,
        sellerType: 'merchant',
        trustScore: 92,
        tags: ['shoes', 'dress', 'formal', 'leather'],
        shipping: 'express',
        isBulkBuy: false,
        imageDescription: 'Brown leather dress shoes with laces and wooden sole'
      },
      {
        title: 'Canvas Sneakers - Black',
        description: 'Casual canvas sneakers in classic black. Comfortable, versatile, and perfect for everyday wear.',
        price: 4999, // $49.99
        imageUrl: 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6',
        sellerId: sellerId,
        sellerName: sellerName,
        sellerVerified: true,
        sellerType: 'merchant',
        trustScore: 85,
        tags: ['shoes', 'sneakers', 'casual', 'canvas'],
        shipping: 'standard',
        isBulkBuy: true,
        bulkMinimumQuantity: 5,
        bulkDiscountRate: 15,
        imageDescription: 'Black canvas sneakers with white rubber sole'
      },
      {
        title: 'Hiking Boots - Waterproof',
        description: 'Durable waterproof hiking boots with ankle support and rugged traction. Designed for all-terrain adventures.',
        price: 14999, // $149.99
        imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa',
        sellerId: sellerId,
        sellerName: sellerName,
        sellerVerified: false,
        sellerType: 'personal',
        trustScore: 70,
        tags: ['shoes', 'boots', 'hiking', 'outdoor'],
        shipping: 'standard',
        isBulkBuy: false,
        warning: 'Seller recently joined',
        imageDescription: 'Brown waterproof hiking boots with thick tread and laces'
      }
    ];

    console.log('Adding shoe products to database...');

    // Insert each shoe product
    for (const product of shoeProducts) {
      await client.query(`
        INSERT INTO products (
          title, description, price, image_url, seller_id, seller_name,
          seller_verified, seller_type, trust_score, tags, shipping, is_bulk_buy,
          bulk_minimum_quantity, bulk_discount_rate, image_description, original_price, discount, warning
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [
        product.title,
        product.description,
        product.price,
        product.imageUrl,
        product.sellerId,
        product.sellerName,
        product.sellerVerified,
        product.sellerType,
        product.trustScore,
        product.tags,
        product.shipping,
        product.isBulkBuy,
        product.bulkMinimumQuantity || null,
        product.bulkDiscountRate || null,
        product.imageDescription,
        product.originalPrice || null,
        product.discount || null,
        product.warning || null
      ]);

      console.log(`Added: ${product.title}`);
    }

    // Count the products to confirm
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    console.log(`Total products in database: ${productCount.rows[0].count}`);

    // Count shoe products specifically
    const shoeCount = await client.query("SELECT COUNT(*) FROM products WHERE 'shoes' = ANY(tags)");
    console.log(`Shoe products in database: ${shoeCount.rows[0].count}`);

    console.log('Shoe products added successfully!');

  } catch (error) {
    console.error('Error adding shoe products:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function
addShoes().catch(console.error);
