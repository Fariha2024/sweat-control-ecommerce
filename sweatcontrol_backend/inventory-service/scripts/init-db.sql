
-- Create database
CREATE DATABASE IF NOT EXISTS sweatcontrol_inventory_db;
USE sweatcontrol_inventory_db;

-- Stock table (current inventory)
CREATE TABLE IF NOT EXISTS stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    available_quantity INT GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    low_stock_threshold INT DEFAULT 10,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_product (product_id),
    INDEX idx_available (available_quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inventory reservations table
CREATE TABLE IF NOT EXISTS inventory_reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity_reserved INT NOT NULL,
    status ENUM('active', 'released', 'converted') DEFAULT 'active',
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stock movement history (audit log)
CREATE TABLE IF NOT EXISTS stock_movements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    quantity_change INT NOT NULL,
    type ENUM('restock', 'sale', 'reservation', 'release', 'adjustment') NOT NULL,
    reference_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_id (product_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample stock data
INSERT INTO stock (product_id, quantity, reserved_quantity, low_stock_threshold) VALUES
(1, 500, 0, 10),
(2, 300, 0, 10),
(3, 200, 0, 10)
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);
