# scripts/init-db.sql
cat > scripts/init-db.sql << 'EOF'
CREATE DATABASE IF NOT EXISTS sweatcontrol_products_db;
USE sweatcontrol_products_db;

CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    minimum_quantity DECIMAL(10,2) DEFAULT 1,
    maximum_quantity DECIMAL(10,2),
    quantity_unit VARCHAR(20),
    unit_price_pkr DECIMAL(10,2) NOT NULL,
    base_currency VARCHAR(10) DEFAULT 'PKR',
    stock_quantity INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active_deleted (is_active, is_deleted),
    INDEX idx_product_name (product_name)
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    reviewer_name VARCHAR(100),
    email VARCHAR(255),
    phone_number VARCHAR(20),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_email (email)
);
EOF