ALTER TABLE orders 
  ADD COLUMN kitchen_status TEXT DEFAULT 'pending',
  ADD COLUMN preparation_started_at TIMESTAMP,
  ADD COLUMN preparation_completed_at TIMESTAMP,
  ADD COLUMN assigned_to_delivery_at TIMESTAMP,
  ADD COLUMN delivered_at TIMESTAMP;

CREATE INDEX idx_orders_kitchen_status ON orders(kitchen_status);
CREATE INDEX idx_orders_order_status ON orders(order_status);
