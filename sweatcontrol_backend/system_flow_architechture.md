🌐 Sweat Control Backend — System Flow Architecture

👤 Customer Shopping Flow

User Visits Website
        ↓
Views Product List
        ↓
Selects Quantity
        ↓
Adds Item to Cart (session_id tracking)
        ↓
Proceeds to Checkout
        ↓
Customer Information Saved/Verified
        ↓
Order Created → pending_payment
        ↓
Stock Temporarily Locked
        ↓
Payment Gateway Processing



💳 Payment Processing Flow

Payment is handled through gateway adapters.

Supported Providers:

. JazzCash

. EasyPaisa

. Future → Stripe (payment platform)

Payment Request Sent
        ↓
Customer Redirected to Gateway
        ↓
Payment Completed
        ↓
Webhook Sent to Backend Server
        ↓
Backend Verifies Transaction
        ↓
If Valid → Order = Paid
If Invalid → Order = Cancelled


🔒 Security & Validation Layer

Backend validation happens before database writing.

Includes:

✅ Idempotency key verification
✅ Amount matching check
✅ Signature authentication
✅ Input validation


📦 Inventory Management Flow

Order Created
        ↓
Stock Quantity Reduced (Locked)
        ↓
Payment Success
        ↓
Stock Finalized
        ↓
Shipping Process Starts

If payment fails or expires:

Payment Timeout / Failure
        ↓
Order Cancelled
        ↓
Stock Restored



🔔 Notification Flow

Notification module triggers alerts:

. Payment failure alert

. Refund request alert

. Chargeback detection

. Admin dashboard updates

Handled by:

. Notification service

. Logging worker



📊 Background Worker Processing

Automated system tasks run in background.

Workers include:

. Payment expiry cleanup worker

. Refund processing worker

. Analytics aggregation worker



☁ Deployment Architecture Vision

Production deployment can use:

. Amazon Web Services infrastructure:

Client Browser
     ↓
CDN Layer
     ↓
Load Balancer
     ↓
Node Backend Servers
     ↓
MySQL Database (RDS)

Recommended Containerization:

. Docker (software company)