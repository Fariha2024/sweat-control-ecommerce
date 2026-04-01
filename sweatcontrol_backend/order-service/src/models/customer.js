@'
const { getPool } = require('../config/db');
const logger = require('../utils/logger');

class Customer {
  static async findOrCreate(customerData) {
    const db = getPool();
    
    // Check if customer exists by email or phone
    let [rows] = await db.execute(
      `SELECT * FROM customers 
       WHERE email = ? OR (country_code = ? AND phone_number = ?)`,
      [customerData.email, customerData.country_code, customerData.phone_number]
    );
    
    if (rows.length > 0) {
      // Update existing customer with new info
      const existing = rows[0];
      await db.execute(
        `UPDATE customers 
         SET first_name = ?, last_name = ?, address_line1 = ?, 
             address_line2 = ?, city = ?, country = ?, zip_code = ?
         WHERE id = ?`,
        [
          customerData.first_name || existing.first_name,
          customerData.last_name || existing.last_name,
          customerData.address_line1 || existing.address_line1,
          customerData.address_line2 || existing.address_line2,
          customerData.city || existing.city,
          customerData.country || existing.country,
          customerData.zip_code || existing.zip_code,
          existing.id
        ]
      );
      return existing;
    }
    
    // Create new customer
    const [result] = await db.execute(
      `INSERT INTO customers 
       (first_name, last_name, country_code, phone_number, email, 
        address_line1, address_line2, city, country, zip_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerData.first_name,
        customerData.last_name,
        customerData.country_code,
        customerData.phone_number,
        customerData.email,
        customerData.address_line1,
        customerData.address_line2,
        customerData.city,
        customerData.country,
        customerData.zip_code
      ]
    );
    
    const [newCustomer] = await db.execute(
      'SELECT * FROM customers WHERE id = ?',
      [result.insertId]
    );
    
    return newCustomer[0];
  }
  
  static async findById(id) {
    const db = getPool();
    const [rows] = await db.execute(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }
  
  static async findByOrderId(orderId) {
    const db = getPool();
    const [rows] = await db.execute(
      `SELECT c.* FROM customers c
       JOIN orders o ON o.customer_id = c.id
       WHERE o.id = ?`,
      [orderId]
    );
    return rows[0] || null;
  }
}

module.exports = Customer;
'@ | Out-File -FilePath src\models\Customer.js -Encoding utf8