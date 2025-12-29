-- Migration 007: Update customer_profiles table schema
-- The table was created in migration 006, this migration adds missing columns and renames fields

DO $$ 
BEGIN
  -- Add customer_name column if it doesn't exist (migration 006 used 'name')
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customer_profiles' AND column_name = 'customer_name') THEN
    -- If 'name' column exists, rename it to 'customer_name'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customer_profiles' AND column_name = 'name') THEN
      ALTER TABLE customer_profiles RENAME COLUMN name TO customer_name;
    ELSE
      ALTER TABLE customer_profiles ADD COLUMN customer_name TEXT;
    END IF;
  END IF;

  -- Add first_order_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customer_profiles' AND column_name = 'first_order_at') THEN
    -- If first_order_date exists, rename it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customer_profiles' AND column_name = 'first_order_date') THEN
      ALTER TABLE customer_profiles RENAME COLUMN first_order_date TO first_order_at;
    ELSE
      ALTER TABLE customer_profiles ADD COLUMN first_order_at TIMESTAMP DEFAULT NOW();
    END IF;
  END IF;

  -- Add last_order_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customer_profiles' AND column_name = 'last_order_at') THEN
    -- If last_order_date exists, rename it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customer_profiles' AND column_name = 'last_order_date') THEN
      ALTER TABLE customer_profiles RENAME COLUMN last_order_date TO last_order_at;
    ELSE
      ALTER TABLE customer_profiles ADD COLUMN last_order_at TIMESTAMP DEFAULT NOW();
    END IF;
  END IF;

  -- Add customer_profile_id to orders table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'customer_profile_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_profile_id BIGINT REFERENCES customer_profiles(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_customer_profile_id ON orders(customer_profile_id);
