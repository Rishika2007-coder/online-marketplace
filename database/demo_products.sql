USE online_marketplace;

-- 1. Insert a demo seller and superadmin user if they don't already exist
INSERT INTO users (name, email, password, mobile, role, status)
VALUES 
  ('TechNova Electronics', 'seller.technova@shopsphere.com', '$2a$10$cN24Bt7gImOIutocH3Fv2.C2bgeVoH80efR.//BI8EPA5Y5xtOFBm', '9876543210', 'seller', 'active'),
  ('Apex Lifestyle', 'seller.apex@shopsphere.com', '$2a$10$cN24Bt7gImOIutocH3Fv2.C2bgeVoH80efR.//BI8EPA5Y5xtOFBm', '9876543211', 'seller', 'active'),
  ('Admin User', 'admin@shopsphere.com', '$2a$10$cN24Bt7gImOIutocH3Fv2.C2bgeVoH80efR.//BI8EPA5Y5xtOFBm', '9876543212', 'superadmin', 'active')
ON DUPLICATE KEY UPDATE status = 'active';

-- Get seller IDs into session variables
SET @seller1 = (SELECT user_id FROM users WHERE email = 'seller.technova@shopsphere.com' LIMIT 1);
SET @seller2 = (SELECT user_id FROM users WHERE email = 'seller.apex@shopsphere.com' LIMIT 1);

-- 2. Insert diverse demo products across categories with high-quality Unsplash image URLs
INSERT INTO products (seller_id, category_id, product_name, description, price, stock_quantity, image, status) VALUES
-- Electronics (category 1)
(@seller1, 1, 'Sony WH-1000XM5 Wireless Headphones', 'Industry-leading noise canceling with two processors and 8 microphones for exceptional call quality and sound.', 349.99, 25, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', 'active'),
(@seller1, 1, 'Apple Watch Series 9 GPS', 'Smartwatch with always-on retina display, ECG monitor, fitness tracking, and waterproof casing.', 399.00, 30, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80', 'active'),
(@seller1, 1, 'Mechanical Gaming Keyboard (RGB)', 'Tactile mechanical switches, customizable RGB backlighting, detachable USB-C braided cable, and aluminium frame.', 89.99, 45, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80', 'active'),
(@seller1, 1, 'Logitech MX Master 3S Wireless Mouse', 'Ergonomic performance mouse with quiet clicks, 8K DPI any-surface tracking, and hyper-fast scroll wheel.', 99.50, 40, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80', 'active'),

-- Fashion (category 2)
(@seller2, 2, 'Classic Minimalist Leather Watch', 'Italian genuine leather strap with an ultra-thin stainless steel casing, Japanese quartz movement.', 120.00, 50, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', 'active'),
(@seller2, 2, 'Urban Commuter Canvas Backpack', 'Water-resistant vintage canvas laptop backpack with leather accents, multiple compartments, and USB port.', 59.99, 65, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', 'active'),
(@seller2, 2, 'Polarized Aviator Sunglasses', '100% UV400 protection with lightweight metal frame and scratch-resistant polarized lenses.', 39.99, 80, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80', 'active'),
(@seller2, 2, 'Classic White Street Sneakers', 'Comfortable cushioned insole, breathable synthetic upper, and durable rubber outsole for everyday style.', 74.99, 35, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80', 'active'),

-- Home & Living (category 3)
(@seller2, 3, 'Smart Aroma Essential Oil Diffuser', 'Ultrasonic quiet cool mist humidifier with ambient LED lighting and auto shut-off safety switch.', 32.50, 60, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80', 'active'),
(@seller2, 3, 'Handcrafted Ceramic Coffee Mug Set', 'Set of 4 matte ceramic mugs with heat-insulated handles, microwave and dishwasher safe.', 28.00, 40, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', 'active'),
(@seller2, 3, 'Nordic Minimalist Desk Lamp', 'Adjustable angle wooden arm with warm LED eye-care lighting, perfect for reading and study tables.', 45.99, 20, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80', 'active'),

-- Books & Learning (category 4)
(@seller1, 4, 'Designing Data-Intensive Applications', 'The definitive guide to the architecture of data systems, scalability, consistency, and reliability.', 42.00, 50, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', 'active'),
(@seller1, 4, 'Atomic Habits by James Clear', 'An easy and proven way to build good habits and break bad ones. Over 10 million copies sold worldwide.', 19.99, 100, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80', 'active'),
(@seller1, 4, 'Clean Code by Robert C. Martin', 'A handbook of agile software craftsmanship with best practices for writing readable, maintainable code.', 38.50, 30, 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80', 'active');

