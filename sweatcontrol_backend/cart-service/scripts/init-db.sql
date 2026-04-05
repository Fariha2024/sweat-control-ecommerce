
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS sweatcontrol_carts_db;
USE sweatcontrol_carts_db;

-- Carts table
CREATE TABLE IF NOT EXISTS carts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    guest_token VARCHAR(255) NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_snapshot DECIMAL(10,2),
    status ENUM('active', 'converted', 'abandoned') DEFAULT 'active',
    expires_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_guest_token (guest_token),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at)
);

-- Cart items history (for analytics)
CREATE TABLE IF NOT EXISTS cart_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    guest_token VARCHAR(255),
    product_id BIGINT,
    quantity INT,
    action VARCHAR(20), -- 'add', 'remove', 'update', 'clear'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_guest_token (guest_token)
);
