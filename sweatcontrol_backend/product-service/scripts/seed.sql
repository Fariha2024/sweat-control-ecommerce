# scripts/seed.sql
cat > scripts/seed.sql << 'EOF'
USE sweatcontrol_products_db;

INSERT INTO products (product_name, description, unit_price_pkr, stock_quantity, minimum_quantity, maximum_quantity, quantity_unit) VALUES
('SweatControl Gel', 'Premium sweat-control solution for all-day freshness. Advanced formula keeps you dry and confident.', 1499, 500, 1, 10, 'bottle'),
('SweatControl Roll-On', 'Convenient roll-on applicator for targeted protection. Perfect for daily use.', 1299, 300, 1, 5, 'piece'),
('SweatControl Spray', 'Quick-drying spray for instant freshness. Covers larger areas.', 1699, 200, 1, 5, 'bottle');

INSERT INTO reviews (product_id, reviewer_name, email, rating, comment) VALUES
(1, 'Ahmed Khan', 'ahmed@example.com', 5, 'Amazing product! Works perfectly and lasts all day.'),
(1, 'Sara Ali', 'sara@example.com', 4, 'Good product, fast shipping. Will buy again.'),
(1, 'Usman Chaudhry', 'usman@example.com', 5, 'Best sweat control gel I have ever used.'),
(2, 'Fatima Zafar', 'fatima@example.com', 5, 'Roll-on is very convenient. Highly recommended!'),
(2, 'Omar Hassan', 'omar@example.com', 4, 'Good quality, fair price.'),
(3, 'Zainab Malik', 'zainab@example.com', 5, 'Spray works great, very refreshing.');
EOF
