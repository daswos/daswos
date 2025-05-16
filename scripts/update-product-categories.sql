-- First, let's create a unique index on the name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'categories' AND indexname = 'categories_name_unique_idx'
    ) THEN
        CREATE UNIQUE INDEX categories_name_unique_idx ON categories (name);
    END IF;
END $$;

-- Now insert categories if they don't exist
DO $$
DECLARE
    category_names TEXT[] := ARRAY[
        'Electronics', 'Fashion', 'Home & Garden', 'Sports & Outdoors',
        'Beauty & Personal Care', 'Toys & Games', 'Books & Media',
        'Automotive', 'Health & Wellness', 'Office Supplies'
    ];
    category_descriptions TEXT[] := ARRAY[
        'Electronic devices and accessories',
        'Clothing, shoes, and accessories',
        'Home decor, furniture, and garden supplies',
        'Sports equipment and outdoor gear',
        'Beauty products and personal care items',
        'Toys, games, and entertainment items',
        'Books, music, movies, and other media',
        'Car parts and accessories',
        'Health supplements and wellness products',
        'Office equipment and supplies'
    ];
    i INTEGER;
BEGIN
    FOR i IN 1..array_length(category_names, 1) LOOP
        IF NOT EXISTS (SELECT 1 FROM categories WHERE name = category_names[i]) THEN
            INSERT INTO categories (name, description, level, is_active)
            VALUES (category_names[i], category_descriptions[i], 0, true);
        END IF;
    END LOOP;
END $$;

-- Now update the products with appropriate category_id values
-- Update Premium Running Shoes
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Sports & Outdoors'),
    tags = ARRAY['running', 'sports', 'shoes', 'athletic', 'footwear']
WHERE title = 'Premium Running Shoes';

-- Update Casual Leather Boots
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Fashion'),
    tags = ARRAY['casual', 'boots', 'leather', 'shoes', 'footwear']
WHERE title = 'Casual Leather Boots';

-- Update Hiking Boots
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Sports & Outdoors'),
    tags = ARRAY['hiking', 'boots', 'outdoor', 'shoes', 'footwear']
WHERE title = 'Hiking Boots';

-- Update Wireless Headphones
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Electronics'),
    tags = ARRAY['wireless', 'headphones', 'audio', 'electronics', 'gadgets']
WHERE title = 'Wireless Headphones';

-- Update Smart Watch
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Electronics'),
    tags = ARRAY['smart watch', 'wearable', 'electronics', 'gadgets', 'fitness']
WHERE title = 'Smart Watch';

-- Update Laptop Backpack
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Fashion'),
    tags = ARRAY['backpack', 'laptop', 'bag', 'travel', 'accessories']
WHERE title = 'Laptop Backpack';

-- Update Athletic Sneakers
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Sports & Outdoors'),
    tags = ARRAY['athletic', 'sneakers', 'sports', 'shoes', 'footwear']
WHERE title = 'Athletic Sneakers';

-- Update Designer Dress Shoes
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Fashion'),
    tags = ARRAY['designer', 'dress shoes', 'formal', 'footwear', 'luxury']
WHERE title = 'Designer Dress Shoes';

-- Update Kids Running Shoes
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'Sports & Outdoors'),
    tags = ARRAY['kids', 'running', 'shoes', 'children', 'footwear']
WHERE title = 'Kids Running Shoes';

-- Also update the ai_attributes field to include category information
UPDATE products
SET ai_attributes = jsonb_set(
    COALESCE(ai_attributes, '{}'::jsonb),
    '{category}',
    to_jsonb(c.name)
)
FROM categories c
WHERE products.category_id = c.id;

-- Add price range information to ai_attributes
UPDATE products
SET ai_attributes = jsonb_set(
    COALESCE(ai_attributes, '{}'::jsonb),
    '{price_range}',
    CASE
        WHEN price < 5000 THEN '"budget"'::jsonb
        WHEN price >= 5000 AND price < 10000 THEN '"mid-range"'::jsonb
        WHEN price >= 10000 AND price < 20000 THEN '"premium"'::jsonb
        ELSE '"luxury"'::jsonb
    END
);

-- Add product type information to ai_attributes based on title
UPDATE products
SET ai_attributes = jsonb_set(
    COALESCE(ai_attributes, '{}'::jsonb),
    '{product_type}',
    CASE
        WHEN title ILIKE '%shoes%' OR title ILIKE '%boots%' OR title ILIKE '%sneakers%' THEN '"footwear"'::jsonb
        WHEN title ILIKE '%watch%' THEN '"wearable"'::jsonb
        WHEN title ILIKE '%headphones%' THEN '"audio"'::jsonb
        WHEN title ILIKE '%backpack%' THEN '"bag"'::jsonb
        ELSE '"other"'::jsonb
    END
);
