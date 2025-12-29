DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'estimated_delivery_minutes') THEN
    ALTER TABLE orders ADD COLUMN estimated_delivery_minutes INT DEFAULT 45;
  END IF;
END $$;
