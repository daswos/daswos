-- Create the total supply table
CREATE TABLE IF NOT EXISTS daswos_coins_total_supply (
  id SERIAL PRIMARY KEY,
  total_amount DECIMAL(20, 0) NOT NULL,
  minted_amount DECIMAL(20, 0) DEFAULT 0,
  creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the wallets table
CREATE TABLE IF NOT EXISTS daswos_wallets (
  user_id INTEGER PRIMARY KEY,
  balance DECIMAL(20, 0) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Add foreign key to users tabllets deploy to app engine
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create the transactions table
CREATE TABLE IF NOT EXISTS daswos_transactions (
  transaction_id SERIAL PRIMARY KEY,
  from_user_id INTEGER NOT NULL,
  to_user_id INTEGER NOT NULL,
  amount DECIMAL(20, 0) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reference_id VARCHAR(255) NULL,
  description TEXT NULL,

  -- Add foreign key to users table for to_user_id
  CONSTRAINT fk_to_user FOREIGN KEY (to_user_id) REFERENCES users(id)
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_from_user ON daswos_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_to_user ON daswos_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_timestamp ON daswos_transactions(timestamp);

-- Insert the initial supply and create the DASWOS AI wallet
INSERT INTO daswos_coins_total_supply (total_amount)
VALUES (20240101); -- 20 million coins 240 thousand and 101. 

-- Create a special user for the DASWOS AI if it doesn't exist
INSERT INTO users (id, username, email, password, created_at, updated_at)
VALUES (0, 'DASWOS_AI', 'system@daswos.internal', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Create the DASWOS AI wallet with the initial supply
INSERT INTO daswos_wallets (user_id, balance)
VALUES (0, 20240101);
