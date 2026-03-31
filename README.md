# SweatControl E-Commerce Platform

A production-grade e-commerce platform specializing in sweat-control solutions and activewear. Built with a modular microservices-inspired backend architecture and a modern React frontend.

## 📌 Project Overview

SweatControl is a single-product e-commerce platform designed with scalability in mind, supporting future multi-product expansion. The system features guest checkout capabilities, transaction-safe purchase modeling, and comprehensive order lifecycle management.

### Key Features
- 🛍️ **Guest Checkout System** - No mandatory account creation
- 💳 **Multi-Payment Gateway Support** - Stripe, EasyPaisa, JazzCash
- 📦 **Inventory Management** - Real-time stock control with reservation system
- 🔄 **Order State Machine** - Complete order lifecycle tracking
- ⭐ **Guest Reviews** - Authentication-free product feedback
- 📊 **Analytics Ready** - Event tracking for business insights

## 🏗️ Project Structure
sweatcontrol-ecommerce/
├── backend/ # Node.js/Express backend API
│ ├── server.js # Application entry point
│ ├── package.json # Backend dependencies
│ ├── .env # Environment variables
│ ├── config/
│ │ └── db.js # Database connection configuration
│ ├── services/ # Microservices-inspired modules
│ │ ├── auth/ # Authentication service (future)
│ │ ├── product/ # Product management
│ │ ├── cart/ # Shopping cart operations
│ │ ├── order/ # Order processing
│ │ ├── review/ # Product reviews
│ │ ├── subscription/ # Recurring purchases
│ │ └── analytics/ # Event tracking
│ ├── middleware/ # Custom middleware
│ ├── utils/ # Utility functions
│ └── workers/ # Background job processors
│
├── frontend/ # React frontend application
│ ├── public/ # Static assets
│ ├── src/
│ │ ├── components/ # Reusable React components
│ │ ├── pages/ # Page components
│ │ ├── hooks/ # Custom React hooks
│ │ ├── context/ # React context providers
│ │ ├── services/ # API service calls
│ │ └── utils/ # Frontend utilities
│ ├── .env # Frontend environment variables
│ └── package.json # Frontend dependencies
│
├── docker-compose.yml # Docker configuration
└── README.md # This file


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
- **Styling**: Tailwind CSS / Material-UI
- **Form Handling**: React Hook Form
- **Payment Integration**: Stripe.js

## 📊 Database Architecture

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

Products Table
Scalable product structure supporting single or multiple products.

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

Cart Table
Session-based temporary storage supporting guest and registered users.

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

Orders Table
Permanent transaction records with complete lifecycle tracking.

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

Order Items Table
Preserves price history and product information at purchase time.

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

Inventory Reservations Table
Prevents overselling and manages concurrent checkout flows.

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

Payment Transactions Table
Tracks all payment attempts and gateway responses.

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

Order Status Audit Log
Maintains complete order status change history.

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



🚀 Installation Guide
Prerequisites

. Node.js (v16 or higher)

. MySQL 8.0

. npm or yarn

. Git


Step 1: Clone the Repository

git clone https://github.com/yourusername/sweatcontrol-ecommerce.git
cd sweatcontrol-ecommerce


Step 2: Backend Setup

Navigate to backend directory
cd backend

Install dependencies
npm install

Configure environment variables
cp .env.example .env

Edit .env file:
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=sweatcontrol_user
DB_PASSWORD=@BackendSecure2026!
DB_NAME=sweatcontrol_prod

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Payment Gateway Keys
STRIPE_SECRET_KEY=sk_test_...
EASYPAISA_MERCHANT_ID=...
JAZZCASH_MERCHANT_ID=...

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

Initialize database

mysql -u root -p < database/schema.sql
Start backend server

# Development mode
npm run dev

# Production mode
npm start


Step 3: Frontend Setup

Navigate to frontend directory
cd ../frontend

Install dependencies
npm install

Configure environment variables
cp .env.example .env


Edit frontend .env:

REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
REACT_APP_GOOGLE_ANALYTICS_ID=UA-...



Start frontend application
npm start


The application will be available at:

. Frontend: http://localhost:3000

. Backend API: http://localhost:5000



📡 API Endpoints


Product Routes
Method	Endpoint	Description
GET	/api/products	Get all active products
GET	/api/products/:id	Get single product details
GET	/api/products/:id/reviews	Get product reviews



Cart Routes
Method	Endpoint	Description
POST	/api/cart	Add item to cart
GET	/api/cart	Get current cart items
PUT	/api/cart/:id	Update cart item quantity
DELETE	/api/cart/:id	Remove item from cart
POST	/api/cart/clear	Clear entire cart



Order Routes
Method	Endpoint	Description
POST	/api/orders	Create new order
GET	/api/orders/:id	Get order details
POST	/api/orders/:id/cancel	Cancel order
GET	/api/orders/track/:id	Track order status




Review Routes
Method	Endpoint	Description
POST	/api/reviews	Submit product review
GET	/api/reviews/product/:productId	Get product reviews




Payment Routes
Method	Endpoint	Description
POST	/api/payments/initiate	Initiate payment
POST	/api/payments/webhook/:gateway	Payment gateway webhook
GET	/api/payments/status/:transactionId	Check payment status



🔄 Order Lifecycle
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


Alternative paths:

. PAYMENT_PROCESSING → FAILED → CANCELLED (Stock restored)

. CONFIRMED → CANCELLED (Refund processed)

. SHIPPED → RETURNED → REFUNDED




🔐 Security Features

. Input Validation: All user inputs sanitized

. SQL Injection Prevention: Parameterized queries

. XSS Protection: Content sanitization

. CORS: Configured for frontend domains

. Rate Limiting: API request throttling

. Helmet.js: Security headers

. Environment Variables: Sensitive data isolated


📈 Production-Ready Features

Inventory Management

. Real-time stock tracking

. Inventory reservation system

. Automatic stock restoration on cancellation

. Overselling prevention


Payment Processing

. Idempotency protection against duplicate payments

. Payment expiry logic with automatic order cancellation

. Multi-gateway support

. Webhook event tracking



Order Management

Complete order state machine

. Status audit logging

. Guest order tracking

. Soft delete support



Database Optimization

. Strategic indexing for performance

. Foreign key constraints for data integrity

. JSON fields for flexible data storage

. Optimized queries for high traffic


🧪 Testing

### Backend Testing
The backend API is tested using **Postman** for manual and automated API testing.


🔧 Postman Testing Setup

Manual Testing Approach


. Use Postman Collections for API testing

. Test manually by hitting your API endpoints



What You Need to Do

# Just start your server normally
cd backend
npm start
# or
npm run dev
Then test endpoints in Postman:



Essential API Tests in Postman

Feature	Endpoint	Method	Test Data
Products	http://localhost:5000/api/products	GET	-
Add to Cart	http://localhost:5000/api/cart	POST	{"guestToken":"test123","productId":1,"quantity":2}
View Cart	http://localhost:5000/api/cart?guestToken=test123	GET	-
Create Order	http://localhost:5000/api/orders	POST	Customer details + guestToken
Check Order	http://localhost:5000/api/orders/1	GET	-




Frontend Testing
cd frontend
npm test
npm run test:e2e



🐳 Docker Deployment

# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down



☁️ Cloud Deployment

Backend (AWS EC2)

# SSH into EC2 instance
ssh -i key.pem ec2-user@your-instance-ip

# Install Node.js and MySQL
curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install nodejs mysql-server

# Clone and setup
git clone https://github.com/yourusername/sweatcontrol-ecommerce.git
cd sweatcontrol-ecommerce/backend
npm install --production
npm start


📝 Development Guidelines

Code Style

. Use ESLint and Prettier for consistent formatting

. Follow Airbnb JavaScript style guide

. Write meaningful commit messages


Branch Strategy

. main: Production-ready code

. develop: Integration branch

. feature/*: New features

. hotfix/*: Critical fixes


Pull Request Process

. Create feature branch from develop

. Write tests for new functionality

. Ensure all tests pass

. Update documentation

. Submit PR with clear description



🚦 Roadmap

Phase 1: Core Backend (Completed)

. ✅ Database schema design

. ✅ Server infrastructure

. ✅ Basic CRUD operations



Phase 2: Frontend Development (In Progress)


. 🔄 React application setup

. 🔄 UI/UX implementation

. 🔄 API integration



Phase 3: Payment Integration (Upcoming)

. 📅 Stripe integration

. 📅 EasyPaisa integration

. 📅 JazzCash integration


Phase 4: Advanced Features (Planned)

. 📊 Analytics dashboard

. 📧 Email notifications

. 📱 Mobile app (React Native)

. 🤖 AI product recommendations



🤝 Contributing

We welcome contributions! Please see our Contributing Guidelines.



📄 License

This project is licensed under the MIT License - see the LICENSE file.



👥 Team
. Backend Lead: [Your Name]

. Frontend Lead: [Your Name]

. Database Architect: [Your Name]


🙏 Acknowledgments

. Special thanks to the Node.js and React communities

. Payment gateway providers for their excellent documentation

. Open source contributors who make development easier


📞 Support

. Documentation: Wiki

. Issues: GitHub Issues

. Email: support@sweatcontrol.com



## 🔒 Security Note

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

**Never expose sensitive credentials** in code, logs, or client-side applications.