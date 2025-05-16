-- Create user purchase history table
CREATE TABLE IF NOT EXISTS user_purchase_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    category_id INTEGER,
    purchase_date TIMESTAMP NOT NULL DEFAULT NOW(),
    quantity INTEGER NOT NULL DEFAULT 1,
    price INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Create user search history table
CREATE TABLE IF NOT EXISTS user_search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    search_query TEXT NOT NULL,
    search_date TIMESTAMP NOT NULL DEFAULT NOW(),
    category_id INTEGER,
    clicked_product_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (clicked_product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Create user product preferences table
CREATE TABLE IF NOT EXISTS user_product_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    preference_score FLOAT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE (user_id, category_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_purchase_history_user_id ON user_purchase_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchase_history_product_id ON user_purchase_history(product_id);
CREATE INDEX IF NOT EXISTS idx_user_purchase_history_category_id ON user_purchase_history(category_id);

CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON user_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_history_category_id ON user_search_history(category_id);
CREATE INDEX IF NOT EXISTS idx_user_search_history_clicked_product_id ON user_search_history(clicked_product_id);

CREATE INDEX IF NOT EXISTS idx_user_product_preferences_user_id ON user_product_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_product_preferences_category_id ON user_product_preferences(category_id);
CREATE INDEX IF NOT EXISTS idx_user_product_preferences_score ON user_product_preferences(preference_score);

-- Function to update user preferences based on purchase history
CREATE OR REPLACE FUNCTION update_user_preferences_from_purchase() RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update user preference for the category
    INSERT INTO user_product_preferences (user_id, category_id, preference_score, last_updated)
    VALUES (NEW.user_id, NEW.category_id, 1.0, NOW())
    ON CONFLICT (user_id, category_id) 
    DO UPDATE SET 
        preference_score = user_product_preferences.preference_score + 0.5,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update preferences when a purchase is made
CREATE OR REPLACE TRIGGER after_purchase_update_preferences
AFTER INSERT ON user_purchase_history
FOR EACH ROW
EXECUTE FUNCTION update_user_preferences_from_purchase();

-- Function to update user preferences based on search history
CREATE OR REPLACE FUNCTION update_user_preferences_from_search() RETURNS TRIGGER AS $$
BEGIN
    -- Only update preferences if a category was involved and product was clicked
    IF NEW.category_id IS NOT NULL AND NEW.clicked_product_id IS NOT NULL THEN
        -- Insert or update user preference for the category
        INSERT INTO user_product_preferences (user_id, category_id, preference_score, last_updated)
        VALUES (NEW.user_id, NEW.category_id, 0.2, NOW())
        ON CONFLICT (user_id, category_id) 
        DO UPDATE SET 
            preference_score = user_product_preferences.preference_score + 0.1,
            last_updated = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update preferences when a search is made
CREATE OR REPLACE TRIGGER after_search_update_preferences
AFTER INSERT ON user_search_history
FOR EACH ROW
EXECUTE FUNCTION update_user_preferences_from_search();
