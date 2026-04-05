const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'sweatcontrol_user',
            password: process.env.DB_PASSWORD || '@BackendSecure2026!'
        });
        
        console.log('Connected to MySQL');
        
        const dbName = process.env.DB_NAME || 'sweatcontrol_inventory_db';
        await conn.query('CREATE DATABASE IF NOT EXISTS ' + dbName);
        console.log('Database created/verified: ' + dbName);
        
        await conn.query('USE ' + dbName);
        
        // Create stock table
        await conn.query(`CREATE TABLE IF NOT EXISTS stock (
            id INT PRIMARY KEY AUTO_INCREMENT,
            product_id INT NOT NULL UNIQUE,
            quantity INT NOT NULL DEFAULT 0,
            reserved_quantity INT NOT NULL DEFAULT 0,
            available_quantity INT GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
            low_stock_threshold INT DEFAULT 10,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_product_id (product_id)
        )`);
        console.log('Stock table created');
        
        // Create inventory_reservations table
        await conn.query(`CREATE TABLE IF NOT EXISTS inventory_reservations (
            id INT PRIMARY KEY AUTO_INCREMENT,
            order_id VARCHAR(255) NOT NULL,
            product_id INT NOT NULL,
            quantity_reserved INT NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            status ENUM("active", "released", "converted") DEFAULT "active",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_order_id (order_id)
        )`);
        console.log('Inventory_reservations table created');
        
        // Create stock_movements table
        await conn.query(`CREATE TABLE IF NOT EXISTS stock_movements (
            id INT PRIMARY KEY AUTO_INCREMENT,
            product_id INT NOT NULL,
            quantity_change INT NOT NULL,
            type ENUM("reservation", "release", "sale", "adjustment", "bulk_adjustment") NOT NULL,
            reference_id VARCHAR(255),
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_product_id (product_id)
        )`);
        console.log('Stock_movements table created');
        
        // Insert sample data
        await conn.query(`INSERT INTO stock (product_id, quantity, reserved_quantity, low_stock_threshold) 
            VALUES (1, 500, 0, 10) ON DUPLICATE KEY UPDATE quantity=500`);
        console.log('Sample stock inserted for product 1');
        
        await conn.query(`INSERT INTO stock (product_id, quantity, reserved_quantity, low_stock_threshold) 
            VALUES (2, 300, 0, 10) ON DUPLICATE KEY UPDATE quantity=300`);
        console.log('Sample stock inserted for product 2');
        
        await conn.query(`INSERT INTO stock (product_id, quantity, reserved_quantity, low_stock_threshold) 
            VALUES (3, 100, 0, 10) ON DUPLICATE KEY UPDATE quantity=100`);
        console.log('Sample stock inserted for product 3');
        
        const [tables] = await conn.query('SHOW TABLES');
        console.log('\nAll tables created successfully:');
        tables.forEach(table => {
            console.log('  -', Object.values(table)[0]);
        });
        
        await conn.end();
        console.log('\nDatabase setup complete!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

setupDatabase();
