CREATE TABLE customer_profiles (
  id BIGSERIAL PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  total_orders INT NOT NULL DEFAULT 0,
  total_spent DOUBLE PRECISION NOT NULL DEFAULT 0,
  first_order_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_order_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE orders ADD COLUMN customer_profile_id BIGINT REFERENCES customer_profiles(id);

CREATE INDEX idx_customer_profiles_phone ON customer_profiles(phone);
CREATE INDEX idx_orders_customer_profile_id ON orders(customer_profile_id);
