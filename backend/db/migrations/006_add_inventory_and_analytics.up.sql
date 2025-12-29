-- Add inventory tracking to menu items
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'stock_quantity') THEN
    ALTER TABLE menu_items ADD COLUMN stock_quantity INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'low_stock_threshold') THEN
    ALTER TABLE menu_items ADD COLUMN low_stock_threshold INT DEFAULT 10;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'track_inventory') THEN
    ALTER TABLE menu_items ADD COLUMN track_inventory BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add customer email to orders for analytics
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_email') THEN
    ALTER TABLE orders ADD COLUMN customer_email TEXT;
  END IF;
END $$;

-- Create table for tracking customer demographics and insights
CREATE TABLE IF NOT EXISTS customer_profiles (
  id BIGSERIAL PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  name TEXT,
  total_orders INT DEFAULT 0,
  total_spent DOUBLE PRECISION DEFAULT 0,
  first_order_date TIMESTAMP,
  last_order_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON customer_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON customer_profiles(email);

-- Create table for sales analytics snapshots
CREATE TABLE IF NOT EXISTS daily_sales_summary (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_orders INT DEFAULT 0,
  completed_orders INT DEFAULT 0,
  total_revenue DOUBLE PRECISION DEFAULT 0,
  average_order_value DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales_summary(date);

-- Create table for hourly order tracking (peak hours analysis)
CREATE TABLE IF NOT EXISTS hourly_order_stats (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  hour INT NOT NULL CHECK (hour >= 0 AND hour < 24),
  order_count INT DEFAULT 0,
  total_revenue DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(date, hour)
);

CREATE INDEX IF NOT EXISTS idx_hourly_stats_date ON hourly_order_stats(date);

-- Create table for item popularity tracking
CREATE TABLE IF NOT EXISTS item_popularity_stats (
  id BIGSERIAL PRIMARY KEY,
  menu_item_id BIGINT NOT NULL,
  menu_item_name TEXT NOT NULL,
  date DATE NOT NULL,
  quantity_sold INT DEFAULT 0,
  revenue DOUBLE PRECISION DEFAULT 0,
  order_count INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(menu_item_id, date)
);

CREATE INDEX IF NOT EXISTS idx_item_popularity_date ON item_popularity_stats(date);
CREATE INDEX IF NOT EXISTS idx_item_popularity_menu_item ON item_popularity_stats(menu_item_id);

-- Update existing menu items to have stock
UPDATE menu_items SET stock_quantity = 100, track_inventory = true;
