
-- Create database
CREATE DATABASE IF NOT EXISTS sweatcontrol_payments_db;
USE sweatcontrol_payments_db;

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    user_id BIGINT,
    gateway VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(20) DEFAULT 'PKR',
    status ENUM('initiated', 'pending', 'success', 'failed', 'refunded') DEFAULT 'initiated',
    transaction_reference VARCHAR(255),
    idempotency_key VARCHAR(255),
    raw_gateway_response JSON,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_transaction_reference (transaction_reference),
    INDEX idx_idempotency_key (idempotency_key),
    INDEX idx_status (status),
    UNIQUE KEY unique_idempotency (idempotency_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Idempotency keys table (backup tracking)
CREATE TABLE IF NOT EXISTS idempotency_keys (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    key_value VARCHAR(255) NOT NULL,
    order_id BIGINT NOT NULL,
    gateway VARCHAR(50),
    response_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    UNIQUE KEY unique_key (key_value),
    INDEX idx_order_id (order_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payment method logs
CREATE TABLE IF NOT EXISTS payment_method_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    gateway VARCHAR(50),
    payment_method VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
