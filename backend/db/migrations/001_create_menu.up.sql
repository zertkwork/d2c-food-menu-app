CREATE TABLE menu_items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  image_url TEXT NOT NULL,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, image_url, available) VALUES
('Margherita Pizza', 'Classic tomato sauce, fresh mozzarella, and basil', 12.99, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop', true),
('Caesar Salad', 'Crisp romaine lettuce, parmesan, croutons, and caesar dressing', 8.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop', true),
('Grilled Chicken Burger', 'Tender grilled chicken, lettuce, tomato, and special sauce', 10.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop', true),
('Pad Thai', 'Stir-fried rice noodles with shrimp, peanuts, and lime', 13.99, 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=600&fit=crop', true),
('Chocolate Brownie', 'Rich chocolate brownie with vanilla ice cream', 6.99, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop', true),
('Mango Smoothie', 'Fresh mango blended with yogurt and honey', 5.99, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&h=600&fit=crop', true);
