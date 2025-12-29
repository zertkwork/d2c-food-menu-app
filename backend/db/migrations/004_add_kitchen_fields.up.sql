DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'kitchen_status') THEN
    ALTER TABLE orders ADD COLUMN kitchen_status TEXT DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'preparation_started_at') THEN
    ALTER TABLE orders ADD COLUMN preparation_started_at TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'preparation_completed_at') THEN
    ALTER TABLE orders ADD COLUMN preparation_completed_at TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'assigned_to_delivery_at') THEN
    ALTER TABLE orders ADD COLUMN assigned_to_delivery_at TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivered_at') THEN
    ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_kitchen_status ON orders(kitchen_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
