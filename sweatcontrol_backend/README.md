# Sweat Control Backend Project

## 📌 Project Overview

This is the backend project for a single-product ecommerce website for Sweat Control product. The backend is built using **Node.js** and **Express.js** framework with **MySQL** database.

## 🛠 Technologies Used

* Node.js runtime environment
* Express.js backend framework
* MySQL relational database

## 📂 Project Folder Created

```
sweatcontrol_backend/
```

## 📦 Backend Setup Flow Followed

### ✅ Step 1: Created Project Folder

Project root folder created:

```
D:\sweatcontrol_backend
```

### ✅ Step 2: Initialized Node Project

Command used:

```
npm init -y
```

This created package.json file.

### ✅ Step 3: Changed PowerShell Execution Policy (Windows Security Requirement)

Command used:

```
Set-ExecutionPolicy RemoteSigned
```

Allowed script execution in PowerShell.

### ✅ Step 4: Installed Backend Dependencies

Installed required Node packages:

```
npm install express mysql2 dotenv cors
```

Purpose of packages:

* express → Server framework
* mysql2 → Database driver
* dotenv → Environment variable security
* cors → Cross-origin communication

### ✅ Step 5: MySQL Server Setup

Installed and configured:

* MySQL Community Server
* Added MySQL bin folder to PATH

MySQL Path used:

```
C:\Program Files\MySQL\MySQL Server 8.0\bin
```

Verified MySQL installation:

```
mysql --version
```

### ✅ Step 6: Database Configuration

Database created:

```
sweatcontrol_prod
```

Database command used:

```
CREATE DATABASE sweatcontrol_prod
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Project database user created:

```
sweatcontrol_user@localhost
```

Password used:

```
@BackendSecure2026!
```

Database permission granted:

```
GRANT ALL PRIVILEGES ON sweatcontrol_prod.*
TO 'sweatcontrol_user'@'localhost';
FLUSH PRIVILEGES;
```

### ✅ Step 7: Current Project Status

✔ Backend project folder created
✔ Node project initialized
✔ Backend dependencies installed
✔ MySQL server configured
✔ Production database created
✔ Database user created

## 🚀 Next Planned Development Steps

* Create database connection file (db.js)
* Test backend server
* Design database tables
* Build API endpoints
* Add authentication logic

## 👩‍💻 Developer Notes

* Using MySQL relational database system
* Backend will be developed first before frontend
* Frontend React development will be done later

---



Step 2️⃣: Initialize Backend Project & Connect to Database
📌 Goal

Set up the backend workflow to handle requests, interact with the database, and prepare for future modular services. At this stage, we focus on infrastructure only, without implementing business logic or API routes.

📂 Folder & File Structure


/backend
│
├── package.json          # Node.js project metadata & dependencies
├── .env                  # Stores environment variables for DB credentials and server port
├── server.js             # Entry point of backend server
│
├── /services             # Microservices-style modular structure
│    ├── /auth
│    ├── /product
│    ├── /cart
│    ├── /order
│    ├── /review
│    ├── /subscription
│    └── /analytics
│
├── /config               # Configuration files
│    └── db.js            # Handles database connection
└── /utils                # Utility functions (empty for now)  

Note: All /services and /utils folders are currently placeholders for future modules.


✅ Steps Completed

1. Created environment configuration (.env) to securely store database credentials and server port.

2. Created db.js to connect backend with MySQL database.

3. Created server.js to start Express server and test database connectivity.

4. Tested infrastructure: server runs successfully and connects to database.

🔍 How to Test

1. Run the server:  node server.js 

2. Server should start and confirm database connection.

2. Access http://localhost:5000 to verify that the backend is running.



🧩 Key Learning Outcomes

.  Backend is organized in a microservices-style modular architecture.

. Database connection and server setup are ready for future API development.

. Infrastructure is ready for deployment on AWS and future scaling.



Step 3️⃣: Design Database Schema & Tables

📌 Goal

Plan the structure of data so backend microservices can store, retrieve, and manage information for products, reviews, cart, orders, subscriptions, and users efficiently. This is the foundation of site’s data flow.


🛠 Database Choice

. Primary DB: MySQL (relational database) → structured data for products, orders, reviews, subscriptions, and users.

. Optional for future: Redis → caching frequently accessed product info to improve performance.

📂 Sweat Control Backend — Complete Architecture
📂 Core Tables & Fields

✅ Customers Table (Checkout User Information)
This table stores guest checkout customer details since the system does not require mandatory account creation.

Fields Included:
Field	Description
id	Unique primary identifier for each customer
first_name	Customer's first name
last_name	Customer's last name
country_code	International dialing code (e.g. +92)
phone_number	Customer contact number
email	Optional email address
address_line1	Primary street address
address_line2	Secondary address (optional)
city	Customer city
country	Customer country
zip_code	Postal or ZIP code
created_at	Checkout record creation time
updated_at	Automatically updates when record changes


. Customer duplication is avoided using country code and phone number validation.

✅ Product Table
📌 Product Database Field Structure

| Field            | Data Type                      | Description                                   |
| ---------------- | ------------------------------ | --------------------------------------------- |
| id               | INT AUTO_INCREMENT PRIMARY KEY | Unique product identifier                     |
| product_name     | VARCHAR(255)                   | Name of the product                           |
| description      | TEXT                           | Product details and features                  |
| minimum_quantity | DECIMAL(10,2)                  | Minimum selectable quantity                   |
| maximum_quantity | DECIMAL(10,2)                  | Maximum selectable quantity                   |
| quantity_unit    | VARCHAR(20)                    | Measurement unit (grams, ml, etc.)            |
| unit_price_pkr   | DECIMAL(10,2)                  | Product price per unit in PKR (base currency) |
| base_currency    | VARCHAR(10)                    | Default currency (PKR)                        |
| stock_quantity   | INT                            | Available inventory count                     |
| image_url        | TEXT                           | Product image links                           |
| video_url        | TEXT                           | Product demonstration video links             |
| is_active        | BOOLEAN                        | Product visibility status                     |
| created_at       | TIMESTAMP                      | Product creation time                         |
| updated_at       | TIMESTAMP                      | Auto-updated modification time                |



📌 Product Design Summary

The product schema is designed to support scalable multi-product expansion, unit-based quantity pricing, and real-time frontend currency conversion while maintaining PKR as the base storage currency.

✅ Reviews Table
📌 Reviews Database Field Structure

| Field         | Data Type                      | Description                          |
| ------------- | ------------------------------ | ------------------------------------ |
| id            | INT AUTO_INCREMENT PRIMARY KEY | Unique review identifier             |
| product_id    | INT                            | Reference to reviewed product        |
| customer_id   | INT NULL                       | Optional checkout customer reference |
| reviewer_name | VARCHAR(255)                   | Name of reviewer (guest allowed)     |
| rating        | INT                            | Product rating (1 to 5 recommended)  |
| comment       | TEXT                           | Review message                       |
| created_at    | TIMESTAMP                      | Review submission time               |


✅ Cart Table
📌 Purpose

. Cart is temporary storage before order confirmation.

👉 When order is placed → cart items are removed.

📌 Cart Field Structure

| Field       | Data Type                      | Description                          |
| ----------- | ------------------------------ | ------------------------------------ |
| id          | INT AUTO_INCREMENT PRIMARY KEY | Cart item identifier                 |
| session_id  | VARCHAR(255)                   | Guest user tracking system           |
| customer_id | INT NULL                       | Optional checkout customer reference |
| product_id  | INT                            | Product reference                    |
| quantity    | DECIMAL(10,2)                  | Selected product quantity            |
| created_at  | TIMESTAMP                      | Item added time                      |


⭐ Why Session ID Is Important (Very Professional)

Since architecture doesn’t have login system:

👉 Use session_id to track cart items.


✅ Orders Table

📌 Purpose
. Stores completed purchase transactions.

👉 Order is permanent record.

📌 Order Field Structure
| Field          | Data Type                      | Description                           |
| -------------- | ------------------------------ | ------------------------------------- |
| id             | INT AUTO_INCREMENT PRIMARY KEY | Order ID                              |
| customer_id    | INT                            | Reference to customer checkout record |
| product_id     | INT                            | Purchased product reference           |
| quantity       | DECIMAL(10,2)                  | Purchased quantity                    |
| unit_price     | DECIMAL(10,2)                  | Price per unit at order time          |
| total_price    | DECIMAL(10,2)                  | Final calculated order price          |
| order_status   | ENUM                           | Order progress tracking               |
| payment_status | VARCHAR(50)                    | Payment state                         |
|payment_provider	VARCHAR(50)	Stripe / Easypaisa / JazzCash                             |
|payment_transaction_id	VARCHAR(255)	Gateway reference                                 |
|payment_status	ENUM('unpaid','paid','failed','refunded','chargeback')	Payment state     |
|refund_status	ENUM('none','requested','approved','rejected','refunded')	Refund tracking|
|refund_reason	TEXT	Refund explanation                                                 |
|refunded_at	TIMESTAMP	Refund completion time                                         |
| created_at     | TIMESTAMP                      | Order creation time                   |

⭐ Why Store Unit Price in Orders Table?

Very important professional design.

👉 Because product price may change later.

So: Order Price = Quantity × Unit Price (at purchase time)


✅ Subscriptions Table 
📌 Purpose

. Stores recurring product subscriptions or special offers.

👉 Supports future multi-product expansion.

📌 Subscriptions Field Structure
| Field       | Data Type                            | Description                           |
| ----------- | ------------------------------------ | ------------------------------------- |
| id          | INT AUTO_INCREMENT PRIMARY KEY       | Subscription ID                       |
| customer_id | INT                                  | Reference to customer checkout record |
| product_id  | INT                                  | Subscribed product reference          |
| plan        | ENUM('weekly','monthly','quarterly') | Recurring plan type                   |
| status      | ENUM('active','paused','canceled')   | Current subscription state            |
| start_date  | DATE                                 | Subscription start date               |
| created_at  | TIMESTAMP                            | Subscription record creation time     |


. Many subscriptions per customer

. Each subscription linked to one product

. Supports future multi-product expansion



 Notifications Table

Table: notifications
| Field        | Type                               | Key                       | Notes           |
| ------------ | ---------------------------------- | ------------------------- | --------------- |
| `id`         | BIGINT                             | PK, AUTO_INCREMENT        | Notification ID |
| `user_id`    | BIGINT                             | FK -> `users.id`          | Recipient       |
| `title`      | VARCHAR(255)                       |                           |                 |
| `message`    | TEXT                               |                           |                 |
| `is_read`    | BOOLEAN                            | DEFAULT 0                 |                 |
| `type`       | ENUM('order','promotion','system') |                           |                 |
| `created_at` | TIMESTAMP                          | DEFAULT CURRENT_TIMESTAMP |                 |



 Analytics Table (Optional)

Table: analytics_events
| Field        | Type        | Key                       | Notes                               |
| ------------ | ----------- | ------------------------- | ----------------------------------- |
| `id`         | BIGINT      | PK, AUTO_INCREMENT        | Event ID                            |
| `user_id`    | BIGINT      | FK -> `users.id`          | Optional                            |
| `event_type` | VARCHAR(50) |                           | e.g., 'product_view', 'cart_add'    |
| `meta`       | JSON        |                           | Extra info like `{product_id: 123}` |
| `created_at` | TIMESTAMP   | DEFAULT CURRENT_TIMESTAMP |                                     |


Table: product_images
| Field        | Type    | Key                 | Notes              |
| ------------ | ------- | ------------------- | ------------------ |
| `id`         | BIGINT  | PK, AUTO_INCREMENT  | Image ID           |
| `product_id` | BIGINT  | FK -> `products.id` | Related product    |
| `url`        | TEXT    |                     | Image URL          |
| `is_primary` | BOOLEAN | DEFAULT 0           | Main display image |




⭐ Senior Production-Grade Enhancements
✅ 1. Add Soft Delete Strategy (Very Important)

Instead of deleting data permanently:

Add to major tables:

is_deleted BOOLEAN DEFAULT 0
deleted_at TIMESTAMP NULL
Apply Soft Delete To:

users

products

categories

reviews

notifications

carts (optional)

👉 Helps with audit logs.

✅ 2. Guest Cart System (Highly Recommended)

Supports users who buy without login.

Modify Cart Table
carts
Field	Type	Notes
id	BIGINT PK	
user_id	BIGINT FK NULL	Null = guest cart
guest_token	VARCHAR(255) UNIQUE	Device/session cart
status	ENUM('active','converted','abandoned')	
expires_at	DATETIME	Guest cart expiry
created_at	TIMESTAMP	

👉 Workflow:

User Type	Behavior
Logged user	Cart linked to user_id
Guest user	Cart uses guest_token
✅ 3. Inventory Locking System (CRITICAL FOR REAL ECOMMERCE)

This prevents:

👉 Overselling
👉 Concurrent checkout bugs

Add Table: inventory_reservations
Field	Type
id	BIGINT PK
product_id	BIGINT
order_id	BIGINT
quantity_reserved	INT
expires_at	DATETIME
status	ENUM('active','released','converted')
Checkout Flow
User clicks checkout
        ↓
Reserve inventory
        ↓
Create pending order
        ↓
Payment confirmation webhook
        ↓
Convert reservation → order stock deduction

🔥 This is how high-scale systems work.

✅ 4. Add Price Snapshot (SUPER IMPORTANT)

Modify cart_items and order_items.

cart_items

Add:

Field	Type
price_snapshot	DECIMAL(10,2)

👉 Prevents price mismatch if product price changes.

order_items

Must contain:

product_id
quantity
price_at_purchase

Never rely on product table price.

✅ 5. Idempotency Protection (Payment Safety)

Create table:

payment_requests
Field	Type
id	BIGINT PK
idempotency_key	VARCHAR(255) UNIQUE
user_id	BIGINT
request_body_hash	TEXT
created_at	TIMESTAMP

Why?

Because webhook or retry requests may happen.

Prevents double payment.

✅ 6. Webhook Event Tracking (Pakistan Gateway Friendly)
payment_webhook_logs
Field	Type
id	BIGINT
gateway	VARCHAR(50)
payload	JSON
status	ENUM('received','processed','failed')
created_at	TIMESTAMP

🔥 Very useful for:

JazzCash webhook retries

EasyPaisa async confirmations

✅ 7. Order State Machine (Production Level)

Replace simple status with controlled lifecycle.

order_status_logs
Field	Type
id	BIGINT
order_id	BIGINT
old_status	VARCHAR(50)
new_status	VARCHAR(50)
changed_by	BIGINT
comment	TEXT
created_at	TIMESTAMP

Prevents:

Random status updates

Debugging nightmares

✅ 8. Background Worker Safety Tables

Because we already have workers folder.

job_queue
Field	Type
id	BIGINT
job_type	VARCHAR(100)
payload	JSON
status	ENUM('pending','processing','done','failed')
retry_count	INT
execute_after	DATETIME

Workers will read from this.

✅ 9. Analytics Scaling Strategy

Instead of storing analytics directly:

Use event store design.

analytics_events
user_id
session_id
event_name
event_meta JSON
created_at

Examples:

product_view

add_to_cart

checkout_start

payment_attempt



📌 Orders Field Structure
| Field           | Data Type                                                                                                     | Description                           |
| --------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| id              | BIGINT AUTO_INCREMENT PRIMARY KEY                                                                             | Order ID                              |
| user_id         | BIGINT                                                                                                        | Customer reference                    |
| status          | ENUM('pending','payment_processing','paid','confirmed','packed','shipped','delivered','cancelled','refunded') | Order lifecycle state                 |
| total_amount    | DECIMAL(10,2)                                                                                                 | Original total order price            |
| discount_amount | DECIMAL(10,2)                                                                                                 | Applied discount                      |
| final_amount    | DECIMAL(10,2)                                                                                                 | Payable amount                        |
| payment_method  | VARCHAR(50)                                                                                                   | Payment gateway or COD                |
| transaction_id  | VARCHAR(255)                                                                                                  | Payment gateway transaction reference |
| guest_token     | VARCHAR(255)                                                                                                  | Guest checkout tracking               |
| is_deleted      | BOOLEAN                                                                                                       | Soft delete flag                      |
| created_at      | TIMESTAMP                                                                                                     | Order creation time                   |
| updated_at      | TIMESTAMP                                                                                                     | Last order update time                |


✅ One customer can have many orders
✅ Supports guest checkout
✅ Supports multi-payment gateways



📌 Order Items Field Structure
| Field             | Data Type                         | Description                         |
| ----------------- | --------------------------------- | ----------------------------------- |
| id                | BIGINT AUTO_INCREMENT PRIMARY KEY | Order item ID                       |
| order_id          | BIGINT                            | Parent order reference              |
| product_id        | BIGINT                            | Purchased product reference         |
| quantity          | INT                               | Number of units purchased           |
| price_at_purchase | DECIMAL(10,2)                     | Product price when order was placed |
| product_snapshot  | JSON                              | Product metadata backup             |
| created_at        | TIMESTAMP                         | Item creation time                  |

✅ One order can contain many products
✅ Price history is preserved
✅ Supports future product changes



📌 Order Fulfilment Tracking Field 
Structure


| Field             | Data Type                                                                                                     | Description                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| id                | BIGINT AUTO_INCREMENT PRIMARY KEY                                                                             | Tracking record ID            |
| order_id          | BIGINT                                                                                                        | Related order                 |
| fulfilment_status | ENUM('warehouse_pending','packed','handed_to_courier','in_transit','out_for_delivery','delivered','returned') | Delivery lifecycle            |
| courier_name      | VARCHAR(100)                                                                                                  | Shipping partner              |
| tracking_number   | VARCHAR(255)                                                                                                  | Courier tracking ID           |
| location          | TEXT                                                                                                          | Current delivery location     |
| notes             | TEXT                                                                                                          | Internal remarks              |
| updated_by        | BIGINT                                                                                                        | Admin/user who updated status |
| created_at        | TIMESTAMP                                                                                                     | Tracking update time          |

✅ Many tracking records per order (status history)


📌 Payment Transactions Field Structure
| Field                 | Data Type                                                 | Description            |
| --------------------- | --------------------------------------------------------- | ---------------------- |
| id                    | BIGINT AUTO_INCREMENT PRIMARY KEY                         | Payment record ID      |
| order_id              | BIGINT                                                    | Related order          |
| user_id               | BIGINT                                                    | Customer reference     |
| gateway               | VARCHAR(50)                                               | Payment gateway        |
| amount                | DECIMAL(10,2)                                             | Payment amount         |
| currency              | VARCHAR(20)                                               | Currency (default PKR) |
| status                | ENUM('initiated','pending','success','failed','refunded') | Payment state          |
| transaction_reference | VARCHAR(255) UNIQUE                                       | Gateway transaction ID |
| raw_gateway_response  | JSON                                                      | Full webhook response  |
| created_at            | TIMESTAMP                                                 | Payment record time    |


📌 Inventory Reservation Field Structure

| Field             | Data Type                             | Description               |
| ----------------- | ------------------------------------- | ------------------------- |
| id                | BIGINT AUTO_INCREMENT PRIMARY KEY     | Reservation ID            |
| order_id          | BIGINT                                | Order reference           |
| product_id        | BIGINT                                | Product reference         |
| quantity_reserved | INT                                   | Reserved stock quantity   |
| status            | ENUM('active','released','converted') | Reservation state         |
| expires_at        | DATETIME                              | Reservation expiry time   |
| created_at        | TIMESTAMP                             | Reservation creation time |


📌 Order Status Audit Log Field Structure
| Field      | Data Type                         | Description             |
| ---------- | --------------------------------- | ----------------------- |
| id         | BIGINT AUTO_INCREMENT PRIMARY KEY | Log ID                  |
| order_id   | BIGINT                            | Order reference         |
| old_status | VARCHAR(50)                       | Previous order status   |
| new_status | VARCHAR(50)                       | Updated order status    |
| changed_by | BIGINT                            | Admin or system updater |
| comment    | TEXT                              | Optional message        |
| created_at | TIMESTAMP                         | Status change time      |


✅ Architecture Design

📌  Relationship Architecture Overview
The project follows a guest checkout ecommerce architecture where customer identity is maintained through checkout information rather than authentication login.

🔗 Core System Flow
Customers (Checkout Information)
        ↓
Products (Single product scalable model)
        ↓
Cart (Temporary session-based storage)
        ↓
Orders (Permanent transaction record)
        ↓
Reviews (Guest-friendly feedback system)
        ↓
Subscriptions (Optional recurring service)


📌 Entity Relationship Philosophy
Customers

. Acts as checkout identity storage.

. Duplicate customers are prevented using: country_code + phone_number


Products

. Designed for single product now.

. Supports future multi-product expansion.

Key Features:

. Unit-based pricing

. Quantity-based dynamic pricing

. PKR base currency storage


Cart System

. Session-based temporary storage.

. Supports guest shopping.

. Cart data is cleared after order confirmation.


Orders System

. Represents confirmed purchases.

. Stores price at purchase time.

Important Design Rule: Order Total = Quantity × Unit Price (at checkout time)

Reason:

. Product price may change later.

Reviews System

.  Guest-friendly feedback system.

. Authentication is not required.

. Reviewer name is stored along with optional customer linkage.


Subscriptions System

. Supports recurring purchase models.

. Currently single product compatible.

. Future multi-product scalable.



📌 Database Integrity Design

The system maintains data consistency using:

✅ Primary Keys
✅ Foreign Keys
✅ Duplicate customer prevention
✅ Transaction-safe purchase logic (future backend implementation)


📌 Infrastructure Design Philosophy

The backend is designed using a microservices-inspired modular structure:

/services
 ├── product
 ├── cart
 ├── order
 ├── review
 ├── subscription

Each module will later contain:

. Controller logic

. Database queries

. Business rules


⭐ Project Design Summary

This backend system is built as a guest checkout single-product ecommerce architecture with forward-compatible multi-product scalability and transaction-safe purchase modeling.



✅ What ELSE Is Required (Important)

To make  payment system production-level, must include:

1️⃣ Idempotency Protection

Prevents duplicate payments if user refreshes page.

2️⃣ Payment Expiry Logic

If payment not completed in X minutes:

. Cancel order

. Restore stock

3️⃣ Admin Notification System

When:

. Payment fails

. Chargeback happens

. Refund requested

4️⃣ Order Status Flow Definition

Clearly define lifecycle:

pending_payment
paid
shipped
delivered
cancelled
under_review




⚡ Future Enhancements / Notes

. User and traffic analytics may be added after the frontend is live.

. The project may be deployed on AWS EC2 using Docker containerization.

. AWS RDS MySQL may be used for managed database storage in the future.

. These improvements will help make the backend more scalable and production-ready.


📌 Scalability Planning

Future enhancements may include:

. Redis caching layer

. Analytics tracking module

. Multi-product marketplace expansion

. Payment gateway integration

. Dockerized deployment

. AWS cloud hosting (EC2 + RDS MySQL)