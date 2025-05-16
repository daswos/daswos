-- First, let's create a test user that will be our seller
INSERT INTO users (
  username,
  password,
  email,
  full_name,
  is_seller,
  created_at
)
VALUES (
  'testvendor',
  '$2b$10$XpC5nKJ5.NI8biIX/BDS6.KU.QoHq2Mxl2hGjf9qphgxDCCwYVtdm', -- hashed password for 'password123'
  'testvendor@example.com',
  'Test Vendor',
  true,
  NOW()
)
ON CONFLICT (username) DO NOTHING
RETURNING id;

-- Get the user ID we just created or that already exists
WITH seller_user AS (
  SELECT id FROM users WHERE username = 'testvendor'
)

-- Now insert products using the seller ID
INSERT INTO products (
  title,
  description,
  price,
  image_url,
  seller_id,
  seller_name,
  seller_verified,
  seller_type,
  trust_score,
  tags,
  shipping,
  created_at
)
SELECT
  'Premium Running Shoes',
  'Lightweight running shoes with advanced cushioning technology for maximum comfort and performance.',
  12999,
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
  id, -- seller_id from the CTE
  'SportGear Pro',
  true,
  'merchant',
  92,
  ARRAY['running', 'sports', 'shoes', 'athletic'],
  'Free shipping',
  NOW()
FROM seller_user;

-- Insert more products with the same seller
WITH seller_user AS (
  SELECT id FROM users WHERE username = 'testvendor'
)
INSERT INTO products (
  title,
  description,
  price,
  image_url,
  seller_id,
  seller_name,
  seller_verified,
  seller_type,
  trust_score,
  tags,
  shipping,
  created_at
)
SELECT
  'Casual Leather Boots',
  'Stylish leather boots perfect for everyday wear. Water-resistant and durable.',
  8999,
  'https://images.unsplash.com/photo-1605812860427-4024433a70fd',
  id, -- seller_id from the CTE
  'Fashion Footwear',
  true,
  'merchant',
  88,
  ARRAY['casual', 'boots', 'leather', 'shoes'],
  'Free shipping',
  NOW()
FROM seller_user;

-- Insert more products
WITH seller_user AS (
  SELECT id FROM users WHERE username = 'testvendor'
)
INSERT INTO products (
  title,
  description,
  price,
  image_url,
  seller_id,
  seller_name,
  seller_verified,
  seller_type,
  trust_score,
  tags,
  shipping,
  created_at
)
VALUES
(
  'Hiking Boots',
  'Waterproof hiking boots with excellent grip for challenging terrain and outdoor adventures.',
  14999,
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa',
  (SELECT id FROM seller_user),
  'Mountain Gear',
  true,
  'merchant',
  95,
  ARRAY['hiking', 'outdoor', 'boots', 'waterproof'],
  'Free shipping',
  NOW()
),
(
  'Wireless Headphones',
  'Premium noise-cancelling wireless headphones with 30-hour battery life and crystal clear sound.',
  19999,
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
  (SELECT id FROM seller_user),
  'Tech Audio',
  true,
  'merchant',
  91,
  ARRAY['audio', 'wireless', 'headphones', 'music'],
  'Free shipping',
  NOW()
),
(
  'Smart Watch',
  'Advanced smartwatch with health monitoring, GPS, and smartphone notifications.',
  24999,
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
  (SELECT id FROM seller_user),
  'Smart Gadgets',
  true,
  'merchant',
  89,
  ARRAY['wearable', 'smartwatch', 'fitness', 'tech'],
  'Free shipping',
  NOW()
),
(
  'Laptop Backpack',
  'Durable backpack with padded laptop compartment, water bottle pockets, and anti-theft features.',
  5999,
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
  (SELECT id FROM seller_user),
  'Urban Carry',
  false,
  'merchant',
  78,
  ARRAY['backpack', 'laptop', 'travel', 'school'],
  'Free shipping',
  NOW()
),
(
  'Athletic Sneakers',
  'Comfortable athletic sneakers perfect for gym workouts and casual wear.',
  7999,
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d',
  (SELECT id FROM seller_user),
  'FitFeet',
  true,
  'merchant',
  87,
  ARRAY['sneakers', 'athletic', 'shoes', 'gym'],
  'Free shipping',
  NOW()
),
(
  'Designer Dress Shoes',
  'Elegant leather dress shoes for formal occasions and business wear.',
  15999,
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2',
  (SELECT id FROM seller_user),
  'Luxury Footwear',
  true,
  'merchant',
  94,
  ARRAY['dress', 'formal', 'shoes', 'leather'],
  'Free shipping',
  NOW()
),
(
  'Kids Running Shoes',
  'Durable and comfortable running shoes designed specifically for children.',
  5499,
  'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2',
  (SELECT id FROM seller_user),
  'KidStep',
  true,
  'merchant',
  90,
  ARRAY['kids', 'running', 'shoes', 'children'],
  'Free shipping',
  NOW()
);

-- Now let's create the information content table if it doesn't exist
CREATE TABLE IF NOT EXISTS information (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT[],
  source VARCHAR(255),
  imageUrl TEXT,
  sphere VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert information content
INSERT INTO information (
  title, content, category, tags, source, imageUrl, sphere
) VALUES
(
  'The History of Running Shoes',
  'Running shoes have evolved significantly since their inception in the late 18th century. The first running shoes were simple leather slippers with spikes attached to the soles. Modern running shoes incorporate advanced technologies like air cushioning, energy return systems, and custom fit options to enhance performance and prevent injuries.',
  'Footwear',
  ARRAY['running', 'shoes', 'history', 'sports'],
  'Sports History Encyclopedia',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
  'safesphere'
),
(
  'How to Choose the Right Running Shoes',
  'Selecting the right running shoes depends on several factors including your foot type, running style, and the surfaces you run on. Pronation, which refers to how your foot rolls inward when you run, is a key consideration. Neutral runners should look for cushioned shoes, while overpronators need stability features. Getting professionally fitted at a specialty running store is recommended for the best results.',
  'Footwear',
  ARRAY['running', 'shoes', 'buying guide', 'fitness'],
  'Runner''s World Magazine',
  'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2',
  'safesphere'
),
(
  'Benefits of Hiking',
  'Hiking offers numerous physical and mental health benefits. It improves cardiovascular fitness, builds strength in your lower body, and enhances balance. Studies show that spending time in nature while hiking reduces stress, anxiety, and depression. Regular hiking can also help with weight management and improve sleep quality. Even moderate hiking for just 30 minutes several times a week can significantly improve overall health.',
  'Outdoor Activities',
  ARRAY['hiking', 'outdoors', 'health', 'fitness'],
  'National Park Service',
  'https://images.unsplash.com/photo-1551632811-561732d1e306',
  'safesphere'
),
(
  'Wireless Headphones Technology Explained',
  'Wireless headphones use Bluetooth technology to connect to devices without cables. The technology works by transmitting audio data through radio waves in the 2.4GHz frequency band. Modern wireless headphones feature advanced codecs like aptX and LDAC for better sound quality, active noise cancellation to block external sounds, and multipoint connectivity to connect to multiple devices simultaneously. Battery life has also improved significantly in recent years.',
  'Electronics',
  ARRAY['headphones', 'wireless', 'technology', 'audio'],
  'Tech Review Quarterly',
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b',
  'safesphere'
),
(
  'The Evolution of Smartwatches',
  'Smartwatches have transformed from simple digital timepieces to sophisticated wearable computers. The first commercially successful smartwatch was released in 2013, but the concept dates back to the 1980s. Modern smartwatches offer health monitoring features like heart rate tracking, ECG, blood oxygen measurement, and sleep analysis. They also provide smartphone notifications, GPS navigation, contactless payments, and voice assistant integration in an increasingly compact form factor.',
  'Electronics',
  ARRAY['smartwatch', 'wearable', 'technology', 'fitness'],
  'Digital Trends Magazine',
  'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1',
  'safesphere'
);

-- Select to verify data was inserted
SELECT 'Products inserted:' AS message;
SELECT COUNT(*) FROM products;

SELECT 'Information content inserted:' AS message;
SELECT COUNT(*) FROM information;
