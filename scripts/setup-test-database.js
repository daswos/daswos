import { Client } from 'pg';
import bcrypt from 'bcrypt';

// Connect to the PostgreSQL database
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * This script sets up a test database based on the schema defined in shared/schema.ts
 * It creates two users (one seller, one regular), 10 products, and 10 information content items
 */
async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    await client.connect();

    console.log('Setting up database schema...');

    // Create users table based on schema.ts
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_seller BOOLEAN NOT NULL DEFAULT FALSE,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        avatar TEXT,
        has_subscription BOOLEAN NOT NULL DEFAULT FALSE,
        subscription_type TEXT,
        subscription_expires_at TIMESTAMP,
        is_family_owner BOOLEAN NOT NULL DEFAULT FALSE,
        family_owner_id INTEGER,
        parent_account_id INTEGER,
        is_child_account BOOLEAN NOT NULL DEFAULT FALSE,
        super_safe_mode BOOLEAN NOT NULL DEFAULT FALSE,
        super_safe_settings JSONB DEFAULT '{"blockGambling":true,"blockAdultContent":true,"blockOpenSphere":false}',
        safe_sphere_active BOOLEAN NOT NULL DEFAULT FALSE,
        ai_shopper_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        ai_shopper_settings JSONB DEFAULT '{"autoPurchase":false,"autoPaymentEnabled":false,"confidenceThreshold":0.85,"budgetLimit":5000,"maxTransactionLimit":10000,"preferredCategories":[],"avoidTags":[],"minimumTrustScore":85,"purchaseMode":"refined","maxPricePerItem":5000,"maxCoinsPerItem":50,"maxCoinsPerDay":100,"maxCoinsOverall":1000}',
        daswos_coins INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Create products table based on schema.ts
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price INTEGER NOT NULL, -- In cents
        image_url TEXT NOT NULL,
        seller_id INTEGER NOT NULL,
        seller_name TEXT NOT NULL,
        seller_verified BOOLEAN NOT NULL DEFAULT FALSE,
        seller_type TEXT NOT NULL DEFAULT 'merchant',
        trust_score INTEGER NOT NULL,
        tags TEXT[] NOT NULL,
        shipping TEXT NOT NULL DEFAULT 'standard',
        original_price INTEGER,
        discount INTEGER,
        verified_since TEXT,
        warning TEXT,
        is_bulk_buy BOOLEAN NOT NULL DEFAULT FALSE,
        bulk_minimum_quantity INTEGER,
        bulk_discount_rate INTEGER,
        image_description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create information_content table based on schema.ts
    await client.query(`
      CREATE TABLE IF NOT EXISTS information_content (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT NOT NULL,
        source_url TEXT NOT NULL,
        source_name TEXT NOT NULL,
        source_verified BOOLEAN NOT NULL DEFAULT FALSE,
        source_type TEXT NOT NULL DEFAULT 'website',
        trust_score INTEGER NOT NULL,
        category TEXT NOT NULL,
        tags TEXT[] NOT NULL,
        image_url TEXT,
        verified_since TEXT,
        warning TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      )
    `);

    // Create search_queries table based on schema.ts
    await client.query(`
      CREATE TABLE IF NOT EXISTS search_queries (
        id SERIAL PRIMARY KEY,
        query TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        sphere TEXT NOT NULL,
        content_type TEXT NOT NULL DEFAULT 'products',
        filters JSONB,
        user_id INTEGER
      )
    `);

    console.log('Schema created successfully');

    // Create two users
    const regularPassword = await hashPassword('testtest');
    const sellerPassword = await hashPassword('testtest');

    console.log('Creating regular user...');
    const regularUser = await client.query(`
      INSERT INTO users (username, password, email, full_name, is_seller, is_admin)
      VALUES ('regular_user', $1, 'regular@example.com', 'Regular User', FALSE, FALSE)
      ON CONFLICT (username) DO UPDATE
      SET password = $1, email = 'regular@example.com', full_name = 'Regular User'
      RETURNING id
    `, [regularPassword]);

    console.log('Creating seller user...');
    const sellerUser = await client.query(`
      INSERT INTO users (username, password, email, full_name, is_seller, is_admin)
      VALUES ('seller_user', $1, 'seller@example.com', 'Seller User', TRUE, FALSE)
      ON CONFLICT (username) DO UPDATE
      SET password = $1, email = 'seller@example.com', full_name = 'Seller User', is_seller = TRUE
      RETURNING id
    `, [sellerPassword]);

    const regularUserId = regularUser.rows[0].id;
    const sellerUserId = sellerUser.rows[0].id;

    console.log(`Regular user created with ID: ${regularUserId}`);
    console.log(`Seller user created with ID: ${sellerUserId}`);

    // Create 10 sample products
    console.log('Creating sample products...');

    const products = [
      {
        title: 'Premium Smartwatch',
        description: 'Latest generation smartwatch with health monitoring and GPS tracking.',
        price: 24999, // Prices in cents
        image_url: 'https://example.com/images/smartwatch.jpg',
        seller_id: sellerUserId,
        seller_name: 'Seller User',
        seller_verified: true,
        seller_type: 'merchant',
        trust_score: 85,
        tags: ['electronics', 'wearable', 'tech'],
        shipping: 'express',
        is_bulk_buy: true,
        bulk_minimum_quantity: 5,
        bulk_discount_rate: 15,
        image_description: 'High-resolution image of a black premium smartwatch with a round display'
      },
      {
        title: 'Organic Coffee Beans - 2lb Bag',
        description: 'Premium organic coffee beans, ethically sourced from sustainable farms.',
        price: 2499,
        image_url: 'https://example.com/images/coffee.jpg',
        seller_id: sellerUserId,
        seller_name: 'Seller User',
        seller_verified: true,
        seller_type: 'merchant',
        trust_score: 90,
        tags: ['food', 'organic', 'coffee'],
        shipping: 'standard',
        is_bulk_buy: true,
        bulk_minimum_quantity: 10,
        bulk_discount_rate: 20,
        image_description: 'A 2lb bag of organic coffee beans'
      },
      {
        title: 'Bluetooth Noise-Cancelling Headphones',
        description: 'Premium wireless headphones with 24-hour battery life and superior noise cancellation.',
        price: 19999,
        image_url: 'https://example.com/images/headphones.jpg',
        seller_id: sellerUserId,
        seller_name: 'Seller User',
        seller_verified: true,
        seller_type: 'merchant',
        trust_score: 88,
        tags: ['electronics', 'audio', 'wireless'],
        shipping: 'standard',
        is_bulk_buy: false,
        image_description: 'Over-ear black wireless headphones with memory foam ear cushions'
      },
      {
        title: 'Yoga Mat Bundle with Blocks and Strap',
        description: 'Complete yoga starter kit with non-slip mat, two foam blocks, and a stretching strap.',
        price: 4999,
        image_url: 'https://example.com/images/yogamat.jpg',
        seller_id: sellerUserId,
        seller_name: 'Seller User',
        seller_verified: true,
        seller_type: 'merchant',
        trust_score: 82,
        tags: ['fitness', 'yoga', 'wellness'],
        shipping: 'standard',
        is_bulk_buy: false,
        image_description: 'Purple yoga mat with two black foam blocks and a stretching strap'
      },
      {
        title: 'Stainless Steel Water Bottle - 32oz',
        description: 'Double-walled vacuum insulated bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
        price: 3599,
        image_url: 'https://example.com/images/waterbottle.jpg',
        seller_id: sellerUserId,
        seller_name: 'Seller User',
        seller_verified: true,
        seller_type: 'merchant',
        trust_score: 91,
        tags: ['kitchen', 'outdoors', 'eco-friendly'],
        shipping: 'standard',
        is_bulk_buy: true,
        bulk_minimum_quantity: 8,
        bulk_discount_rate: 12,
        image_description: 'Silver stainless steel water bottle with a screw-top lid'
      },
      {
        title: 'Organic Cotton Bed Sheet Set - Queen',
        description: 'Luxurious 400 thread count organic cotton sheet set with fitted sheet, flat sheet, and 2 pillowcases.',
        price: 8999,
        image_url: 'https://example.com/images/sheets.jpg',
        seller_id: sellerUserId,
        seller_name: 'Seller User',
        seller_verified: true,
        seller_type: 'merchant',
        trust_score: 87,
        tags: ['home', 'bedding', 'organic'],
        shipping: 'standard',
        is_bulk_buy: false,
        image_description: 'White organic cotton bed sheets neatly folded in a stack'
      },
      {
        title: 'Bluetooth Smart Speaker with Voice Assistant',
        description: 'Compact smart speaker with rich 360-degree sound and built-in voice assistant compatibility.',
        price: 12999,
        image_url: 'https://example.com/images/speaker.jpg',
        seller_id: sellerUserId,
        seller_name: 'Seller User',
        seller_verified: true,
        seller_type: 'merchant',
        trust_score: 84,
        tags: ['electronics', 'audio', 'smart-home'],
        shipping: 'express',
        is_bulk_buy: false,
        image_description: 'Small cylindrical black smart speaker with blue indicator light'
      },
      {
        title: 'Professional Chef Knife Set',
        description: 'Set of 5 professional grade stainless steel knives with ergonomic handles and wooden storage block.',
        price: 19999,
        image_url: 'https://example.com/images/knives.jpg',
        seller_id: sellerUserId,
        seller_name: 'Seller User',
        seller_verified: true,
        seller_type: 'merchant',
        trust_score: 89,
        tags: ['kitchen', 'cooking', 'tools'],
        shipping: 'standard',
        is_bulk_buy: false,
        image_description: 'Set of five professional chef knives displayed in a wooden block'
      },
      {
        title: 'Adjustable Standing Desk Converter',
        description: 'Ergonomic desk converter that transforms any desk into a standing workstation with height adjustment.',
        price: 14999,
        image_url: 'https://example.com/images/desk.jpg',
        seller_id: sellerUserId,
        seller_name: 'Seller User',
        seller_verified: true,
        seller_type: 'merchant',
        trust_score: 83,
        tags: ['office', 'furniture', 'ergonomic'],
        shipping: 'standard',
        is_bulk_buy: true,
        bulk_minimum_quantity: 3,
        bulk_discount_rate: 10,
        image_description: 'Black adjustable standing desk converter with a laptop and monitor'
      },
      {
        title: 'Reusable Silicone Food Storage Bags - Set of 10',
        description: 'Eco-friendly, BPA-free silicone food storage bags in various sizes, dishwasher safe and leak-proof.',
        price: 2999,
        image_url: 'https://example.com/images/storagebags.jpg',
        seller_id: sellerUserId,
        seller_name: 'Seller User',
        seller_verified: true,
        seller_type: 'merchant',
        trust_score: 86,
        tags: ['kitchen', 'eco-friendly', 'storage'],
        shipping: 'standard',
        is_bulk_buy: true,
        bulk_minimum_quantity: 5,
        bulk_discount_rate: 15,
        image_description: 'Collection of colorful silicone food storage bags of various sizes'
      }
    ];

    for (const product of products) {
      await client.query(`
        INSERT INTO products (
          title, description, price, image_url, seller_id, seller_name,
          seller_verified, seller_type, trust_score, tags, shipping, is_bulk_buy,
          bulk_minimum_quantity, bulk_discount_rate, image_description
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        product.title, product.description, product.price, product.image_url,
        product.seller_id, product.seller_name, product.seller_verified,
        product.seller_type, product.trust_score, product.tags, product.shipping,
        product.is_bulk_buy, product.bulk_minimum_quantity || null,
        product.bulk_discount_rate || null, product.image_description
      ]);
    }

    console.log('Sample products created successfully');

    // Create 10 information content items
    console.log('Creating information content...');

    const informationContent = [
      {
        title: 'How to Identify Trustworthy Online Sellers',
        content: 'This guide provides a comprehensive overview of how to identify trustworthy online sellers when shopping online. Look for verified seller badges, check customer reviews, verify contact information, and more.',
        summary: 'Learn key indicators of trusted sellers and how to verify their authenticity before purchasing.',
        source_url: 'https://consumer.gov/shopping-online',
        source_name: 'Consumer Protection Agency',
        source_verified: true,
        source_type: 'government',
        trust_score: 95,
        category: 'shopping-guide',
        tags: ['online-shopping', 'safety', 'verification'],
        image_url: 'https://example.com/images/verification.jpg'
      },
      {
        title: 'Understanding Product Quality Indicators',
        content: 'This article explains the various indicators of product quality, including certification marks, material specifications, manufacturing standards, and how to interpret them correctly.',
        summary: 'Detailed explanation of product quality indicators and certification marks.',
        source_url: 'https://iso.org/standards',
        source_name: 'International Standards Organization',
        source_verified: true,
        source_type: 'organization',
        trust_score: 92,
        category: 'product-knowledge',
        tags: ['quality', 'standards', 'certification'],
        image_url: 'https://example.com/images/quality.jpg'
      },
      {
        title: 'Bulk Buying Benefits and Strategies',
        content: 'Discover the economic and practical advantages of bulk buying, along with strategies to maximize savings without wasting resources or storage space.',
        summary: 'Learn when and how to buy in bulk to save money without creating waste.',
        source_url: 'https://consumer.org/bulk-buying',
        source_name: 'Consumer Research Institute',
        source_verified: true,
        source_type: 'educational',
        trust_score: 88,
        category: 'shopping-guide',
        tags: ['bulk-buy', 'savings', 'strategy'],
        image_url: 'https://example.com/images/bulk.jpg'
      },
      {
        title: 'Sustainable Shopping Practices',
        content: 'A comprehensive guide to sustainable shopping practices, including how to identify eco-friendly products, understanding sustainability certifications, and reducing environmental impact through conscious purchasing.',
        summary: 'Practical tips for making environmentally-conscious shopping decisions.',
        source_url: 'https://epa.gov/greenliving',
        source_name: 'Environmental Protection Agency',
        source_verified: true,
        source_type: 'government',
        trust_score: 94,
        category: 'sustainability',
        tags: ['eco-friendly', 'sustainability', 'green-products'],
        image_url: 'https://example.com/images/sustainable.jpg'
      },
      {
        title: 'How to Spot Counterfeit Products Online',
        content: 'Learn the warning signs of counterfeit products, from pricing that is too good to be true to packaging inconsistencies and quality issues. Protect yourself from fraudulent sellers and ensure product authenticity.',
        summary: 'Key indicators to identify and avoid counterfeit products when shopping online.',
        source_url: 'https://ic3.gov/counterfeits',
        source_name: 'Internet Crime Complaint Center',
        source_verified: true,
        source_type: 'government',
        trust_score: 93,
        category: 'safety',
        tags: ['counterfeit', 'safety', 'verification'],
        image_url: 'https://example.com/images/counterfeit.jpg'
      },
      {
        title: 'Understanding Product Warranties and Returns',
        content: 'A detailed explanation of common warranty terms, consumer rights regarding returns and replacements, and how to navigate the claims process effectively.',
        summary: 'Clear guidance on product warranties, return policies, and your rights as a consumer.',
        source_url: 'https://consumer.gov/warranties',
        source_name: 'Consumer Rights Commission',
        source_verified: true,
        source_type: 'government',
        trust_score: 91,
        category: 'consumer-rights',
        tags: ['warranty', 'returns', 'consumer-rights'],
        image_url: 'https://example.com/images/warranty.jpg'
      },
      {
        title: 'The Psychology of Online Shopping',
        content: 'Explore the psychological factors that influence online shopping decisions, from color psychology in product listings to the impact of reviews and social proof on purchase confidence.',
        summary: 'Understanding the psychological factors that influence your online shopping decisions.',
        source_url: 'https://apa.org/consumer-psychology',
        source_name: 'American Psychological Association',
        source_verified: true,
        source_type: 'academic',
        trust_score: 89,
        category: 'consumer-behavior',
        tags: ['psychology', 'behavior', 'decision-making'],
        image_url: 'https://example.com/images/psychology.jpg'
      },
      {
        title: 'Safe Digital Payment Methods',
        content: 'A comparative analysis of different digital payment methods, their security features, consumer protections, and best practices for secure online transactions.',
        summary: 'Comprehensive guide to secure online payment options and their protections.',
        source_url: 'https://consumer.gov/online-payments',
        source_name: 'Financial Security Bureau',
        source_verified: true,
        source_type: 'government',
        trust_score: 95,
        category: 'online-safety',
        tags: ['payments', 'security', 'digital-wallets'],
        image_url: 'https://example.com/images/payments.jpg'
      },
      {
        title: 'How to Read and Understand Product Specifications',
        content: 'Demystify technical product specifications with this guide that explains common technical terms, measurement standards, and how to compare specifications across different products.',
        summary: 'Learn to decode technical product specifications for better purchasing decisions.',
        source_url: 'https://consumer.tech/specifications',
        source_name: 'Consumer Technology Association',
        source_verified: true,
        source_type: 'organization',
        trust_score: 87,
        category: 'product-knowledge',
        tags: ['specifications', 'technical', 'comparison'],
        image_url: 'https://example.com/images/specs.jpg'
      },
      {
        title: 'Collaborative Shopping: Benefits and Tools',
        content: 'Discover how collaborative shopping with friends, family, or communities can lead to better deals, shared insights, and more informed purchasing decisions. Includes an overview of tools and platforms that facilitate collaborative shopping experiences.',
        summary: 'How to leverage collective intelligence and group buying for better shopping experiences.',
        source_url: 'https://social-commerce.org/collaboration',
        source_name: 'Digital Commerce Institute',
        source_verified: true,
        source_type: 'educational',
        trust_score: 86,
        category: 'shopping-guide',
        tags: ['collaborative', 'social-shopping', 'group-buying'],
        image_url: 'https://example.com/images/collaborative.jpg'
      }
    ];

    for (const info of informationContent) {
      await client.query(`
        INSERT INTO information_content (
          title, content, summary, source_url, source_name,
          source_verified, source_type, trust_score, category,
          tags, image_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        info.title, info.content, info.summary, info.source_url,
        info.source_name, info.source_verified, info.source_type,
        info.trust_score, info.category, info.tags, info.image_url
      ]);
    }

    console.log('Information content created successfully');

    // Create a few search queries
    await client.query(`
      INSERT INTO search_queries (query, sphere, content_type)
      VALUES
        ('headphones', 'safesphere', 'products'),
        ('sustainable shopping', 'safesphere', 'information'),
        ('kitchen tools', 'safesphere', 'products'),
        ('bulk buying', 'safesphere', 'information')
    `);

    console.log('Search queries created successfully');
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.end();
  }
}

setupDatabase();