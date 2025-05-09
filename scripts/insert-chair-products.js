/**
 * Script to add chair products to the database
 * This helps with product matching in AI search
 */

import 'dotenv/config';
import { db, queryClient } from '../server/db.js';
import { products } from '../shared/schema.js';

async function addChairProducts() {
  try {
    console.log('Connecting to database...');
    
    // Get seller's user ID
    const seller = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.isSeller, true),
    });
    
    if (!seller) {
      console.error('No seller found in database. Please run the setup-test-database script first.');
      process.exit(1);
    }
    
    const sellerUserId = seller.id;
    
    // Chair products to add
    const chairProducts = [
      {
        title: 'Ergonomic Mesh Office Chair',
        description: 'A comfortable office chair with lumbar support, adjustable height and tilt, and breathable mesh backing to keep you cool. Perfect for long working hours.',
        price: 14900, // $149.00
        imageUrl: 'https://example.com/images/mesh-chair.jpg',
        sellerId: sellerUserId,
        sellerName: seller.fullName || 'Seller User',
        sellerVerified: true,
        sellerType: 'merchant',
        trustScore: 92,
        tags: ['furniture', 'office', 'chair', 'ergonomic'],
        shipping: 'standard',
        isBulkBuy: false,
        createdAt: new Date(),
        verifiedSince: new Date(),
        warning: null,
        originalPrice: 19900,
        discount: 25,
        imageDescription: 'Black ergonomic mesh office chair with adjustable features'
      },
      {
        title: 'Daswos Leather Executive Chair',
        description: 'A premium executive chair with a classic look featuring padded leather seat and back. It swivels and rolls, and the height is adjustable for maximum comfort.',
        price: 19900, // $199.00
        imageUrl: 'https://example.com/images/leather-chair.jpg',
        sellerId: sellerUserId,
        sellerName: seller.fullName || 'Seller User',
        sellerVerified: true,
        sellerType: 'merchant',
        trustScore: 94,
        tags: ['furniture', 'office', 'chair', 'executive', 'leather'],
        shipping: 'premium',
        isBulkBuy: false,
        createdAt: new Date(),
        verifiedSince: new Date(),
        warning: null,
        originalPrice: 24900,
        discount: 20,
        imageDescription: 'Brown leather executive office chair with traditional styling'
      },
      {
        title: 'Daswos Accent Chair',
        description: 'A modern, minimalist accent chair with a sturdy wood frame and soft fabric upholstery. Perfect for living rooms, bedrooms, or reception areas.',
        price: 9900, // $99.00
        imageUrl: 'https://example.com/images/accent-chair.jpg',
        sellerId: sellerUserId,
        sellerName: seller.fullName || 'Seller User',
        sellerVerified: true,
        sellerType: 'merchant',
        trustScore: 88,
        tags: ['furniture', 'home', 'chair', 'accent', 'modern'],
        shipping: 'standard',
        isBulkBuy: false,
        createdAt: new Date(),
        verifiedSince: new Date(),
        warning: null,
        originalPrice: 12900,
        discount: 23,
        imageDescription: 'Gray fabric accent chair with wooden legs and minimalist design'
      }
    ];
    
    // Insert the chair products
    console.log('Adding chair products to database...');
    
    for (const product of chairProducts) {
      await db.insert(products).values(product);
      console.log(`Added product: ${product.title}`);
    }
    
    // Count the products to confirm
    const result = await db.select({ count: db.fn.count() }).from(products);
    console.log(`Products in database after insertion: ${result[0].count}`);
    
    console.log('Successfully added chair products to the database!');
  } catch (error) {
    console.error('Error adding chair products:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await queryClient.end();
  }
}

// Run the function
addChairProducts()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });