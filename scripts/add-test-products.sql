-- First, make sure we have the categories
INSERT INTO categories (name, description, parent_id)
VALUES 
  ('Electronics', 'Electronic devices and accessories', NULL),
  ('Sports & Outdoors', 'Sports equipment and outdoor gear', NULL),
  ('Fashion', 'Clothing, shoes, and accessories', NULL)
ON CONFLICT (name) DO NOTHING;

-- Get the category IDs
DO $$
DECLARE
  electronics_id INTEGER;
  sports_id INTEGER;
  fashion_id INTEGER;
BEGIN
  SELECT id INTO electronics_id FROM categories WHERE name = 'Electronics';
  SELECT id INTO sports_id FROM categories WHERE name = 'Sports & Outdoors';
  SELECT id INTO fashion_id FROM categories WHERE name = 'Fashion';

  -- Add test products for Electronics
  INSERT INTO products (
    title, 
    description, 
    price, 
    image_url, 
    seller_name, 
    seller_verified, 
    trust_score, 
    category_id, 
    tags
  )
  VALUES 
    (
      'Wireless Bluetooth Headphones', 
      'High-quality wireless headphones with noise cancellation', 
      9999, -- $99.99
      'https://example.com/headphones.jpg', 
      'ElectroShop', 
      TRUE, 
      95, 
      electronics_id, 
      ARRAY['Electronics', 'Audio', 'Wireless']
    ),
    (
      'Smart Watch with Fitness Tracker', 
      'Track your fitness and stay connected with this smart watch', 
      12999, -- $129.99
      'https://example.com/smartwatch.jpg', 
      'TechGadgets', 
      TRUE, 
      90, 
      electronics_id, 
      ARRAY['Electronics', 'Wearable', 'Fitness']
    ),
    (
      'Portable Bluetooth Speaker', 
      'Compact speaker with powerful sound for on-the-go music', 
      5999, -- $59.99
      'https://example.com/speaker.jpg', 
      'SoundMasters', 
      TRUE, 
      85, 
      electronics_id, 
      ARRAY['Electronics', 'Audio', 'Portable']
    );

  -- Add test products for Sports & Outdoors
  INSERT INTO products (
    title, 
    description, 
    price, 
    image_url, 
    seller_name, 
    seller_verified, 
    trust_score, 
    category_id, 
    tags
  )
  VALUES 
    (
      'Yoga Mat with Carrying Strap', 
      'Non-slip yoga mat perfect for all types of yoga', 
      2999, -- $29.99
      'https://example.com/yogamat.jpg', 
      'FitLife', 
      TRUE, 
      92, 
      sports_id, 
      ARRAY['Sports & Outdoors', 'Yoga', 'Fitness']
    ),
    (
      'Insulated Water Bottle', 
      'Keep your drinks cold for 24 hours or hot for 12 hours', 
      1999, -- $19.99
      'https://example.com/waterbottle.jpg', 
      'OutdoorGear', 
      TRUE, 
      88, 
      sports_id, 
      ARRAY['Sports & Outdoors', 'Hydration', 'Camping']
    ),
    (
      'Running Shoes', 
      'Lightweight and comfortable shoes for running and jogging', 
      7999, -- $79.99
      'https://example.com/runningshoes.jpg', 
      'SportyFeet', 
      TRUE, 
      94, 
      sports_id, 
      ARRAY['Sports & Outdoors', 'Running', 'Footwear']
    );

  -- Add test products for Fashion
  INSERT INTO products (
    title, 
    description, 
    price, 
    image_url, 
    seller_name, 
    seller_verified, 
    trust_score, 
    category_id, 
    tags
  )
  VALUES 
    (
      'Casual Cotton T-Shirt', 
      'Comfortable cotton t-shirt for everyday wear', 
      1499, -- $14.99
      'https://example.com/tshirt.jpg', 
      'FashionHub', 
      TRUE, 
      87, 
      fashion_id, 
      ARRAY['Fashion', 'Casual', 'T-Shirts']
    ),
    (
      'Denim Jeans', 
      'Classic denim jeans with a modern fit', 
      3999, -- $39.99
      'https://example.com/jeans.jpg', 
      'DenimWorld', 
      TRUE, 
      91, 
      fashion_id, 
      ARRAY['Fashion', 'Denim', 'Pants']
    ),
    (
      'Leather Wallet', 
      'Genuine leather wallet with multiple card slots', 
      2499, -- $24.99
      'https://example.com/wallet.jpg', 
      'AccessoryShop', 
      TRUE, 
      89, 
      fashion_id, 
      ARRAY['Fashion', 'Accessories', 'Leather']
    );
END $$;
