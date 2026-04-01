# SweatControl E-Commerce Platform

A production-grade e-commerce platform specializing in **sweat-control Gel** - a premium sweat-control solution.

## 📌 Project Overview

SweatControl is a specialized e-commerce platform designed to sell a single high-quality sweat-control gel product.
 The system is built on a guest-checkout architecture, allowing customers to purchase without mandatory account creation while maintaining complete order tracking capabilities.
 
 
 
### Design Philosophy

- **Guest-First**: The system features guest checkout capabilities, No forced registration
- **Transaction Safety**: Inventory reservation prevents overselling
- **Data Integrity**: Complete audit trail for all operations
- **Scalability**: The platform is engineered with scalability in mind, supports future multi-product expansion



 ### Business Logic
The platform follows a straightforward e-commerce flow:
1. Customer browses product
2. Adds to cart (session-based)
3. Provides checkout information
4. Completes payment
5. Receives order confirmation and tracking



### Key Differentiators
- Real-time inventory management with reservation system
- Complete order state machine with audit logging
- Multi-payment gateway support (Stripe, EasyPaisa, JazzCash)
- Idempotent payment processing prevents duplicate charges

---

## 2. System Architecture
 
### High-Level Architecture

The backend follows a microservices-inspired modular structure with clear separation of concerns, while the frontend follows a component-based React architecture.


sweatcontrol-ecommerce/
│
├── backend/                    # Node.js/Express backend API
│   ├── server.js              # Application entry point
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Environment variables
│   │
│   ├── config/
│   │   └── db.js              # Database connection configuration
│   │
│   ├── services/              # Microservices-inspired modules
│   │   ├── product/           # Product management
│   │   ├── cart/              # Shopping cart operations
│   │   ├── order/             # Order processing
│   │   ├── review/            # Product reviews
│   │   ├── subscription/      # Recurring purchases (future)
│   │   ├── auth/              # Authentication service (future)
│   │   └── analytics/         # Event tracking (future)
│   │
│   ├── middleware/            # Custom middleware
│   ├── utils/                 # Utility functions
│   └── workers/               # Background job processors
│
├── frontend/                   # React frontend application (coming soon)
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── context/           # React context providers
│   │   ├── services/          # API service calls
│   │   └── utils/             # Frontend utilities
│   ├── .env                   # Frontend environment variables
│   └── package.json           # Frontend dependencies
│
├── docker-compose.yml         # Docker configuration
└── README.md                  # Project documentation


### Architecture Overview

Layer	Technology	Purpose

. API Layer	Express.js	Handles HTTP requests, routing, middleware

. Service Layer	Node.js Modules	Business logic, database operations

. Data Layer	MySQL	Persistent storage with ACID compliance

. Frontend	React	User interface (in development)



### Service Modules
Module	Status	Responsibility

Product	✅ Designed	Product catalog, stock management

Cart	✅ Designed	Session-based shopping cart

Order	✅ Designed	Order creation, tracking, state management

Review	✅ Designed	Guest-friendly product reviews

Payment	✅ Designed	Multi-gateway payment processing

Subscription	🔷 Planned	Recurring purchase management

Auth	🔷 Planned	User authentication (optional)

Analytics	🔷 Planned	Event tracking and reporting



### Key Features
- 🛍️ **Guest Checkout System** - No mandatory account creation
- 💳 **Multi-Payment Gateway Support** - Stripe, EasyPaisa, JazzCash
- 📦 **Inventory Management** - Real-time stock control with reservation system
- 🔄 **Order State Machine** - Complete order lifecycle tracking
- ⭐ **Guest Reviews** - Authentication-free product feedback
- 📊 **Analytics Ready** - Event tracking for business insights

---


## 3. Working Flow


### User Journey
Product Discovery
↓

Add to Cart (Session ID generated)
↓

Checkout Information (Name, Address, Phone)
↓

Inventory Reservation (15-minute hold)
↓

Payment Processing (Idempotency check)
↓

Order Confirmation (Stock deducted)
↓

Order Tracking (Guest access via phone/order ID)

text


## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **ORM/Driver**: mysql2
- **Authentication**: JWT (future implementation)
- **Payment Gateways**: Stripe, EasyPaisa, JazzCash
- **Caching**: Redis (planned)
- **Queue System**: Bull/Redis (planned)


### Frontend
- **Framework**: React 18+
- **State Management**: Redux Toolkit / Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS / shadcn
- **Form Handling**: React Hook Form
- **Payment Integration**: (planned)


### 📊 Database Architecture

The system uses MySQL with a carefully designed schema supporting guest checkout and scalable product management.



### Core Tables

#### Customers Table
Stores guest checkout information without mandatory account creation.

```sql
CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    country_code VARCHAR(5),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    zip_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_customer (country_code, phone_number)
);
```


#### Products Table
Scalable product structure supporting single or multiple products.

```sql
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    minimum_quantity DECIMAL(10,2) DEFAULT 1,
    maximum_quantity DECIMAL(10,2),
    quantity_unit VARCHAR(20),
    unit_price_pkr DECIMAL(10,2) NOT NULL,
    base_currency VARCHAR(10) DEFAULT 'PKR',
    stock_quantity INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```


#### Cart Table
Session-based temporary storage supporting guest and registered users.

```sql
CREATE TABLE carts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    guest_token VARCHAR(255),
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_snapshot DECIMAL(10,2),
    status ENUM('active', 'converted', 'abandoned') DEFAULT 'active',
    expires_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_guest_token (guest_token),
    INDEX idx_user_id (user_id)
);
```


#### Orders Table
Permanent transaction records with complete lifecycle tracking.

```sql
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    customer_id BIGINT,
    guest_token VARCHAR(255),
    status ENUM(
        'pending',
        'payment_processing',
        'paid',
        'confirmed',
        'packed',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
    ) DEFAULT 'pending',
    total_amount DECIMAL(10,2),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    payment_status ENUM('unpaid','paid','failed','refunded','chargeback'),
    transaction_id VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_status (status),
    INDEX idx_guest_token (guest_token)
);
```


#### Order Items Table
Preserves price history and product information at purchase time.

```sql
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10,2) NOT NULL,
    product_snapshot JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```


#### Inventory Reservations Table
Prevents overselling and manages concurrent checkout flows.

```sql
CREATE TABLE inventory_reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity_reserved INT NOT NULL,
    status ENUM('active','released','converted') DEFAULT 'active',
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_status (status)
);
```


#### Payment Transactions Table
Tracks all payment attempts and gateway responses.

```sql
CREATE TABLE payment_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    user_id BIGINT,
    gateway VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(20) DEFAULT 'PKR',
    status ENUM('initiated','pending','success','failed','refunded') DEFAULT 'initiated',
    transaction_reference VARCHAR(255) UNIQUE,
    raw_gateway_response JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```


#### Order Status Audit Log
Maintains complete order status change history.

```sql
CREATE TABLE order_status_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by BIGINT,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    INDEX idx_order_id (order_id)
);
```



### 🚀 Installation Guide
Prerequisites

. Node.js (v16 or higher)

. MySQL 8.0

. npm

. Git


### 🔷 Step 1: Clone the Repository

git clone https://github.com/yourusername/sweatcontrol-ecommerce.git
cd sweatcontrol-ecommerce



### 🔷 Step 2: Backend Setup

Navigate to backend directory
cd backend

Install dependencies
npm install

Configure environment variables
cp .env.example .env

Edit .env file:

### Server Configuration
NODE_ENV=development
PORT=5000



### Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=sweatcontrol_user
DB_PASSWORD=@BackendSecure2026!
DB_NAME=sweatcontrol_prod


### JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d


### Payment Gateway Keys
STRIPE_SECRET_KEY=sk_test_...
EASYPAISA_MERCHANT_ID=...
JAZZCASH_MERCHANT_ID=...


### Email Configuration  (Optional - Future Feature)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password


#### 📧 Email Notifications (Planned)

Email notifications are planned for future implementation including:

- Order confirmation emails
- Payment receipt emails
- Shipping updates
- Password reset functionality


Initialize database

mysql -u root -p < database/schema.sql
Start backend server


### Development mode
npm run dev

### Production mode
npm start



### 🔷 Step 3: Frontend Setup

Navigate to frontend directory
cd ../frontend

Install dependencies
npm install

Configure environment variables
cp .env.example .env


Edit frontend .env:

REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_JAZZ_PUBLIC_KEY=pk_test_...
REACT_APP_GOOGLE_ANALYTICS_ID=UA-...



Start frontend application
npm start


The application will be available at:

. Frontend: http://localhost:3000

. Backend API: http://localhost:5000


---


## 📡 API Endpoints


### 🔷 Product Routes
Method	Endpoint	Description
GET	/api/products	Get all active products
GET	/api/products/:id	Get single product details
GET	/api/products/:id/reviews	Get product reviews



### 🔷 Cart Routes
Method	Endpoint	Description
POST	/api/cart	Add item to cart
GET	/api/cart	Get current cart items
PUT	/api/cart/:id	Update cart item quantity
DELETE	/api/cart/:id	Remove item from cart
POST	/api/cart/clear	Clear entire cart



### 🔷 Order Routes
Method	Endpoint	Description

POST	/api/orders	Create new order

GET	/api/orders/:id	Get order details

POST	/api/orders/:id/cancel	Cancel order

GET	/api/orders/track/:id	Track order status




### 🔷 Review Routes
Method	Endpoint	Description

POST	/api/reviews	Submit product review

GET	/api/reviews/product/:productId	Get product reviews




### 🔷 Payment Routes
Method	Endpoint	Description

POST	/api/payments/initiate	Initiate payment

POST	/api/payments/webhook/:gateway	Payment gateway webhook

GET	/api/payments/status/:transactionId	Check payment status



### 🔄 Order Lifecycle
The system implements a complete order state machine:

1. PENDING
   ↓
2. PAYMENT_PROCESSING (Inventory reserved)
   ↓
3. PAID
   ↓
4. CONFIRMED
   ↓
5. PACKED
   ↓
6. SHIPPED
   ↓
7. DELIVERED


#### Alternative paths:

. PAYMENT_PROCESSING → FAILED → CANCELLED (Stock restored)

. CONFIRMED → CANCELLED (Refund processed)

. SHIPPED → RETURNED → REFUNDED




### 🔐 Security Features

. Input Validation: All user inputs sanitized

. SQL Injection Prevention:✅ Parameterized queries

. XSS Protection: ⚠️Content sanitization

. CORS: Configured for frontend domains

. Rate Limiting: ❌API request throttling

. Helmet.js: ❌Security headers

. Environment Variables: Sensitive data isolated

---


## 📈 Production-Ready Features

### 🔷 Inventory Management

### 🔷 1. Real-time stock tracking

What: Database always shows exact current stock

Why: Prevents selling products that are out of stock

Example:

. Stock = 50 units

. Customer buys 2 → Stock becomes 48 instantly

. Another customer sees 48 available



### 🔷 2. Inventory reservation system

What: Temporarily holds stock when customer starts checkout

Why: Prevents multiple people buying the last item at the same time

Example:
Customer A adds product to cart and starts checkout
   ↓
System reserves 1 unit for 15 minutes
   ↓
Stock shows: 50 total → 49 available + 1 reserved
   ↓
If Customer A pays → reserved converted to sold
If Customer A doesn't pay → stock released back after 15 mins

Table: inventory_reservations stores this data



### 🔷 3. Automatic stock restoration on cancellation

What: Returns stock when order is cancelled

Why: Ensures accurate inventory

Example:
Order placed → Stock reduced
   ↓
Customer cancels order
   ↓
System automatically adds stock back
   ↓
Stock available for other customers



### 🔷 4. Overselling prevention

What: System checks stock before allowing purchase

Why: Never sell more than what you have

Example:
Product stock = 10 units
   ↓
Customer tries to buy 15 units
   ↓
System blocks the purchase
   ↓
Error message: "Only 10 units available"



### 🔷 How It Works Together

Step	Action

1.	Customer views product → Real-time stock shown

2.	Customer clicks checkout → Stock reserved (15 mins)

3.	Customer completes payment → Reserved becomes sold

4.	Customer cancels → Stock restored automatically

5.	Another customer tries to buy more than available → Blocked



### 🔷 Are These Implemented?

Feature	Status 

Real-time stock tracking	⚠️ In database design

Inventory reservation system	✅ Table exists in schema

Stock restoration	⚠️ Needs backend logic

Overselling prevention	⚠️ Needs backend logic


The database design is ready for all these features. The backend logic needs to be implemented in services.


---


## 🔷 Payment Processing

### 🔷 1. Idempotency protection against duplicate payments

What: Prevents charging customer twice if they click pay button multiple times

Why: Avoids duplicate payments and angry customers

Example:
Customer clicks "Pay Now"
   ↓
Payment is processing (slow internet)
   ↓
Customer clicks again (thinking it didn't work)
   ↓
Idempotency key detects it's the same payment
   ↓
System blocks the second attempt
   ↓
Customer charged only once


Table: idempotency_key in payment_requests table



### 🔷 2. Payment expiry logic with automatic order cancellation

What: Cancels order if payment not completed within time limit

Why: Prevents orders stuck in "pending" forever and releases reserved stock

Example:
Order created at 10:00 AM
   ↓
Payment time limit = 15 minutes
   ↓
10:15 AM → No payment received
   ↓
System automatically:
   - Cancels order
   - Releases reserved stock
   - Notifies customer



### 🔷 3. Multi-gateway support

What: Accept payments through multiple services

Why: Gives customers payment choices

Example:

Customer selects payment method:
   ├── Credit Card (Stripe)
   ├── Bank Transfer (EasyPaisa)
   └── Mobile Wallet (JazzCash)


Table: gateway field in payment_transactions table



### 🔷 4. Webhook event tracking

What: Records all payment gateway responses

Why: Debugging, audit trail, handling payment status updates

Example:
Payment gateway sends webhook:
{
  "status": "success",
  "transaction_id": "txn_123",
  "amount": 1499
}
   ↓
System saves entire response in database
   ↓
If payment fails, you have full details to investigate


Table: raw_gateway_response (JSON) in payment_transactions table



### 🔷 How It Works Together

Step	Feature Used

1.	User clicks pay → Idempotency checks for duplicates

2.	Payment initiated → Multi-gateway processes payment

3.	15 minutes pass → Expiry logic cancels if no payment

4. Gateway responds → Webhook tracking stores all details

5	Payment confirmed → Order status updated



### 🔷 Are These Implemented?

Feature	Status 

Idempotency protection	✅ Table exists in your schema 

Payment expiry logic	⚠️ Needs backend logic

Multi-gateway support	✅ Gateway field in your schema

Webhook tracking	✅ JSON field in your schema


The database design is ready for all these features. The actual payment processing logic needs to be implemented in backend services.




## 🔷 Order Management

### 🔷 1. Complete order state machine

What: Order has defined stages it moves through, not random status changes

Why: Ensures orders follow correct workflow

Example:
pending → payment_processing → paid → confirmed → packed → shipped → delivered
    ↓
cancelled (if payment fails or user cancels)
    ↓
refunded (if user returns)


Statuses in the Table: ENUM('pending','payment_processing','paid','confirmed','packed','shipped','delivered','cancelled','refunded')



### 🔷 2. Status audit logging

What: Records every time order status changes, who changed it, and why

Why: Debugging, accountability, and customer service

Example:
Time	Old Status	New Status	Changed By	Reason

10:00	pending	payment_processing	System	Payment initiated

10:05	payment_processing	paid	System	Payment confirmed

14:00	paid	packed	Admin (Fariha)	Ready to ship

16:00	packed	shipped	Admin (Fariha)	Dispatched


Table: order_status_logs



### 🔷 3. Guest order tracking

What: Customers without accounts can track their orders

Why: The store doesn't require login to buy

Example:

Guest buys product
   ↓
Gets order ID and tracking number via email/SMS
   ↓
Visits website: "Track Order"
   ↓
Enters order ID + phone number
   ↓
Sees order status: "Your order has been shipped"


Table: guest_token field in orders table




### 🔷 4. Soft delete support

What: Records are not permanently deleted, just marked as deleted

Why:

. Can recover if accidentally deleted

. Keep data for reports/analytics

. Customer service can see past orders

Example:
-- ❌ Hard Delete (lose data forever)
DELETE FROM orders WHERE id = 123;

-- ✅ Soft Delete (data kept but hidden)
UPDATE orders SET is_deleted = true WHERE id = 123;

Table: is_deleted field in orders table



###🔷 How It Works Together

Feature	Purpose

State Machine	Controls allowed status transitions

Audit Logging	Records every status change for accountability

Guest Tracking	Non-logged-in users can track orders

Soft Delete	Never lose data, can restore if needed



### 🔷 Are These Implemented?

Feature	Status

Order state machine	✅ ENUM status in your schema

Status audit logging	✅ order_status_logs table exists

Guest order tracking	✅ guest_token field exists

Soft delete support	✅ is_deleted field exists


The database design is complete for all these features. The backend logic needs to be implemented in services.




## 🔷 Database Optimization

### 🔷 1. Strategic indexing for performance

What: Creating indexes on frequently searched columns

Why: Speeds up SELECT queries dramatically

Example:
-- Without index (SLOW) - searches every row
SELECT * FROM orders WHERE customer_id = 123;

-- With index (FAST) - jumps directly to the rows
CREATE INDEX idx_customer_id ON orders(customer_id);


#### Tables That Need Indexes:

. orders.customer_id - searching orders by customer

. carts.guest_token - finding cart by session

. products.product_name - searching products


### 🔷 2. Foreign key constraints for data integrity

What: Rules that prevent orphaned or invalid data

Why: Ensures data consistency and prevents errors 

Example
-- This ensures every order_item has a valid order
FOREIGN KEY (order_id) REFERENCES orders(id)
ON DELETE CASCADE  -- If order deleted, its items are also deleted


#### Benefits:

. ❌ Can't add order_item without valid order

. ❌ Can't delete product if it has existing orders

. ✅ Data stays clean and consistent


In CURRENT Schema:

. order_items.order_id → links to orders.id

. carts.product_id → links to products.id

. reviews.product_id → links to products.id



### 🔷 3. JSON fields for flexible data storage

What: Storing semi-structured data in JSON format

Why: Allows flexibility without rigid table structure

Example:
-- In your orders table
product_snapshot JSON

-- Can store full product details at purchase time
{
  "product_name": "Sweatcontrol Gel",
  "description": "Premium sweat control",
  "price": 1499,
  "image_url": "https://..."
}

#### Benefits:

. Product details preserved even if product table changes later

. No need to alter table structure for new fields

. Perfect for payment gateway responses



### 🔷 4. Optimized queries for high traffic

What: Writing efficient SQL queries

Why: Handles many users without slowing down

Good vs Bad Example:
-- ❌ BAD - Selects everything, processes in application
SELECT * FROM orders;
-- Then filter in JavaScript

-- ✅ GOOD - Filters in database, only what you need
SELECT id, total_amount, status 
FROM orders 
WHERE created_at >= '2024-01-01'
AND status = 'paid';


### 🔷 Optimization Tips:

. Only SELECT columns you need (avoid SELECT *)

. Use WHERE clauses to filter early

. Add LIMIT for pagination

. Avoid SELECT DISTINCT unless necessary

. Use JOINs instead of multiple queries


--- 


### 🧪 Testing

### Backend Testing
The backend API is tested using **Postman** for manual and automated API testing.


### 🔧 Postman Testing Setup ( Manual Testing Approach )

. Use Postman Collections for API testing

. Test manually by hitting your API endpoints



What You Need to Do

#### Just start your server normally
cd backend
npm start
#### or
npm run dev
Then test endpoints in Postman:



### Essential API Tests in Postman

Feature	Endpoint	Method	Test Data

Products	http://localhost:5000/api/products	
GET	-

Add to Cart	http://localhost:5000/api/cart	POST	{"guestToken":"test123","productId":1,"quantity":2}

View Cart	http://localhost:5000/api/cart?guestToken=test123	
GET	-

Create Order	http://localhost:5000/api/orders	
POST	Customer details + guestToken

Check Order 	http://localhost:5000/api/orders/1	
GET	-


---

### Frontend Testing
cd frontend
npm test
npm run test:e2e



### 🐳 Docker Deployment

##### Build and run with Docker Compose
docker-compose up -d

#### View logs
docker-compose logs -f

#### Stop containers
docker-compose down



### ☁️ Cloud Deployment

Backend (AWS EC2)

#### SSH into EC2 instance
ssh -i key.pem ec2-user@your-instance-ip

#### Install Node.js and MySQL
curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install nodejs mysql-server

#### Clone and setup
git clone https://github.com/yourusername/sweatcontrol-ecommerce.git
cd sweatcontrol-ecommerce/backend
npm install --production
npm start


### 📝 Development Guidelines

Code Style

. Use ESLint and Prettier for consistent formatting

. Follow Airbnb JavaScript style guide

. Write meaningful commit messages


### Branch Strategy

. main: Production-ready code

. develop: Integration branch

. feature/*: New features

. hotfix/*: Critical fixes


### Pull Request Process

. Create feature branch from develop

. Write tests for new functionality

. Ensure all tests pass

. Update documentation

. Submit PR with clear description



### 🚦 Roadmap

#### Phase 1: Core Backend (Completed)

. ✅ Database schema design

. ✅ Server infrastructure

. ✅ Basic CRUD operations



#### Phase 2: Frontend Development (In Progress)


. 🔄 React application setup

. 🔄 UI/UX implementation

. 🔄 API integration



#### Phase 3: Payment Integration (Upcoming)

. 📅 Stripe integration

. 📅 EasyPaisa integration

. 📅 JazzCash integration


#### Phase 4: Advanced Features (Planned)

. 📊 Analytics dashboard

. 📧 Email notifications

. 📱 Mobile app (React Native)

. 🤖 AI product recommendations



### 🤝 Contributing

We welcome contributions! Please see our Contributing Guidelines.



### 📄 License

This project is licensed under the MIT License - see the LICENSE file.



### 👥 Credits

- **Developed by**: Fariha Nizam
- **Guided by**: Sir Maaz Alam
- **Learning Platform**: UI Learning


### 🙏 Acknowledgments

- Sir Maaz Alam - Special thanks to **Sir Maaz Alam**  For his invaluable mentorship, technical guidance, and continuous support throughout this project
- UI Learning - Gratitude to **UI Learning** for providing the learning environment
- Open Source Community - Appreciation to the open source community for creating the tools used in this project


### 📞 Support

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/yourusername/sweatcontrol-ecommerce/issues)
- **Contact**: farihanizam50@gmail.com



### 🔒 Security Note

**This is a production-grade e-commerce platform.** Always follow security best practices:

- Use strong, unique passwords for database and admin accounts
- Store all secrets in environment variables, never commit them to version control
- Use HTTPS in production
- Enable rate limiting to prevent abuse
- Regularly update dependencies for security patches
- Implement proper CORS configuration
- Use database connection pooling
- Encrypt sensitive customer data
- Monitor logs for suspicious activity
- Set up automated backups

#### **Never expose sensitive credentials** in code, logs, or client-side applications.