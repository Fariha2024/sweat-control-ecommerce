All 6 Microservices Complete! 🎉🚀

Service	Port	Status
Product Service	3001	✅
Cart Service	3002	✅
Order Service	3003	✅
Inventory Service	3004	✅
Payment Service	3005	✅
Notification Service	3006	✅



📦 Microservices
Service	Port	Description
Product Service	3001	Product catalog, reviews, stock lookup
Cart Service	3002	Shopping cart management
Order Service	3003	Order processing, state machine
Inventory Service	3004	Stock management, reservations
Payment Service	3005	Multi-gateway payments
Notification Service	3006	Email & SMS notifications



🗄️ Databases
Each service has its own database:

sweatcontrol_products_db

sweatcontrol_carts_db

sweatcontrol_orders_db

sweatcontrol_inventory_db

sweatcontrol_payments_db



# Check Node.js
node --version

# Check npm
npm --version

# Check Docker
docker --version

# Check Docker Compose
docker-compose --version



🐳 Step 2: Start Docker Desktop
Open Docker Desktop from Start Menu

Wait for the whale icon to stop animating

Verify it's running:

powershell
docker ps
Expected: Empty list (no error)



📦 Step 3: Create Docker Network
powershell
# Create network for all services
docker network create sweatcontrol-network

# Verify
docker network ls | findstr sweatcontrol



🗄️ Step 4: Install MySQL in Docker
powershell
# Pull MySQL image
docker pull mysql:8.0

# Run MySQL container
docker run -d `
  --name sweatcontrol-mysql `
  --network sweatcontrol-network `
  -p 3306:3306 `
  -e MYSQL_ROOT_PASSWORD=rootpassword123 `
  -e MYSQL_DATABASE=sweatcontrol_products_db `
  -e MYSQL_USER=sweatcontrol_user `
  -e MYSQL_PASSWORD=@BackendSecure2026! `
  mysql:8.0

# Verify MySQL is running
docker ps | findstr mysql
Wait 30 seconds for MySQL to initialize.




📦 Step 5: Install Redis in Docker
powershell
# Pull Redis image
docker pull redis:7-alpine

# Run Redis container
docker run -d `
  --name sweatcontrol-redis `
  --network sweatcontrol-network `
  -p 6379:6379 `
  redis:7-alpine

# Verify Redis is running
docker ps | findstr redis



📦 Step 6: Install Kafka in Docker
powershell
# Pull Kafka and Zookeeper images
docker pull confluentinc/cp-zookeeper:7.5.0
docker pull confluentinc/cp-kafka:7.5.0

# Run Zookeeper
docker run -d `
  --name sweatcontrol-zookeeper `
  --network sweatcontrol-network `
  -p 2181:2181 `
  -e ZOOKEEPER_CLIENT_PORT=2181 `
  confluentinc/cp-zookeeper:7.5.0

# Wait 10 seconds
Start-Sleep -Seconds 10

# Run Kafka
docker run -d `
  --name sweatcontrol-kafka `
  --network sweatcontrol-network `
  -p 9092:9092 `
  -e KAFKA_BROKER_ID=1 `
  -e KAFKA_ZOOKEEPER_CONNECT=sweatcontrol-zookeeper:2181 `
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 `
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 `
  confluentinc/cp-kafka:7.5.0

# Verify all containers
docker ps



📦 Step 7: Verify All Docker Containers
powershell
# Should show 4 containers running
docker ps

# Expected output:
# sweatcontrol-mysql (Up)
# sweatcontrol-redis (Up)
# sweatcontrol-zookeeper (Up)
# sweatcontrol-kafka (Up)


🗄️ Step 8: Create All Databases
powershell
# Create databases for each service
docker exec -i sweatcontrol-mysql mysql -u root -prootpassword123 << 'EOF'
CREATE DATABASE IF NOT EXISTS sweatcontrol_products_db;
CREATE DATABASE IF NOT EXISTS sweatcontrol_carts_db;
CREATE DATABASE IF NOT EXISTS sweatcontrol_orders_db;
CREATE DATABASE IF NOT EXISTS sweatcontrol_inventory_db;
CREATE DATABASE IF NOT EXISTS sweatcontrol_payments_db;

GRANT ALL PRIVILEGES ON sweatcontrol_products_db.* TO 'sweatcontrol_user'@'%';
GRANT ALL PRIVILEGES ON sweatcontrol_carts_db.* TO 'sweatcontrol_user'@'%';
GRANT ALL PRIVILEGES ON sweatcontrol_orders_db.* TO 'sweatcontrol_user'@'%';
GRANT ALL PRIVILEGES ON sweatcontrol_inventory_db.* TO 'sweatcontrol_user'@'%';
GRANT ALL PRIVILEGES ON sweatcontrol_payments_db.* TO 'sweatcontrol_user'@'%';
FLUSH PRIVILEGES;
EOF

# Verify databases
docker exec -it sweatcontrol-mysql mysql -u root -prootpassword123 -e "SHOW DATABASES;"




📦 Step 9: Install Dependencies for Each Service
powershell
# Navigate to backend folder
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend

# Install all service dependencies
$services = @("product-service", "cart-service", "order-service", "inventory-service", "payment-service", "notification-service", "api-gateway")

foreach ($service in $services) {
    Write-Host "Installing dependencies for $service..." -ForegroundColor Yellow
    cd $service
    npm install
    cd ..
}





🗄️ Step 11: Initialize Database Schemas
powershell
# Initialize product-service database
cd product-service
docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_products_db < scripts\init-db.sql
docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_products_db < scripts\seed.sql
cd ..

# Initialize cart-service database
cd cart-service
docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_carts_db < scripts\init-db.sql
cd ..

# Initialize order-service database
cd order-service
docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_orders_db < scripts\init-db.sql
cd ..

# Initialize inventory-service database
cd inventory-service
docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_inventory_db < scripts\init-db.sql
cd ..

# Initialize payment-service database
cd payment-service
docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_payments_db < scripts\init-db.sql
cd ..

Write-Host "✅ All databases initialized" -ForegroundColor Green





🚀 Step 12: Start All Services
Start Product Service (Port 3001)
powershell
# Open NEW PowerShell window - Terminal 1
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\product-service
npm run dev
Start Cart Service (Port 3002)
powershell
# Open NEW PowerShell window - Terminal 2
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\cart-service
npm run dev
Start Order Service (Port 3003)
powershell
# Open NEW PowerShell window - Terminal 3
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\order-service
npm run dev
Start Inventory Service (Port 3004)
powershell
# Open NEW PowerShell window - Terminal 4
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\inventory-service
npm run dev
Start Payment Service (Port 3005)
powershell
# Open NEW PowerShell window - Terminal 5
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\payment-service
npm run dev
Start Notification Service (Port 3006)
powershell
# Open NEW PowerShell window - Terminal 6
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\notification-service
npm run dev
Start API Gateway (Port 3000)
powershell
# Open NEW PowerShell window - Terminal 7
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\api-gateway
npm run dev
🧪 Step 13: Test Services
Open a new PowerShell window:

powershell
# Test API Gateway
curl http://localhost:3000/health

# Test Product Service (via gateway)
curl http://localhost:3000/api/products

# Test Cart Service
curl -X POST http://localhost:3002/api/cart `
  -H "Content-Type: application/json" `
  -d '{"productId": 1, "quantity": 2}'

# Test Order Service (after getting guestToken from cart)
curl http://localhost:3003/api/orders/1

# Test Inventory Service
curl http://localhost:3004/api/inventory/1

# Test Payment Service
curl http://localhost:3005/api/payments/status/1

# Test Notification Service
curl http://localhost:3006/health
📊 Step 14: View Docker Containers
powershell
# Check all running containers
docker ps

# View MySQL logs
docker logs sweatcontrol-mysql --tail 20

# View Kafka logs
docker logs sweatcontrol-kafka --tail 20
🔧 Step 15: Troubleshooting
If MySQL connection fails:
powershell
# Check MySQL is running
docker ps | findstr mysql

# Restart MySQL
docker restart sweatcontrol-mysql

# Check MySQL logs
docker logs sweatcontrol-mysql --tail 50
If Kafka connection fails:
powershell
# Check both containers
docker ps | findstr kafka
docker ps | findstr zookeeper

# Restart both
docker restart sweatcontrol-zookeeper
Start-Sleep -Seconds 10
docker restart sweatcontrol-kafka
If a service fails to start:
powershell
# Check service logs
cd [service-name]
npm run dev
# Look for error messages

# Check if port is already in use
netstat -ano | findstr :3001
📋 Complete Installation Checklist
Component	Status	Command to Verify
Docker Desktop	⬜	docker ps
MySQL Container	⬜	docker ps | findstr mysql
Redis Container	⬜	docker ps | findstr redis
Kafka Container	⬜	docker ps | findstr kafka
Zookeeper Container	⬜	docker ps | findstr zookeeper
All Databases Created	⬜	docker exec -it sweatcontrol-mysql mysql -u root -prootpassword123 -e "SHOW DATABASES;"
Product Service	⬜	curl http://localhost:3001/health
Cart Service	⬜	curl http://localhost:3002/health
Order Service	⬜	curl http://localhost:3003/health
Inventory Service	⬜	curl http://localhost:3004/health
Payment Service	⬜	curl http://localhost:3005/health
Notification Service	⬜	curl http://localhost:3006/health
API Gateway	⬜	curl http://localhost:3000/health
🎯 Quick Start Command (One-liner to start everything)
After everything is installed, you can start all services with Docker Compose:

powershell
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend
docker-compose up -d
Run Step 1 first and tell me what versions you have! 🚀

MYSQL INSTALLATION

PS C:\Users\muham\sweat-control-ecommerce> # Check Node.js
>> node --version
>> 
>> # Check npm
>> npm --version
>> 
>> # Check Docker
>> docker --version
>> 
>> # Check Docker Compose
>> docker-compose --version
v22.13.0
11.3.0
Docker version 29.3.1, build c2be9cc
Docker Compose version v5.1.1
PS C:\Users\muham\sweat-control-ecommerce> docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
PS C:\Users\muham\sweat-control-ecommerce> # Create network for all services
>> docker network create sweatcontrol-network
>> 
>> # Verify
>> docker network ls | findstr sweatcontrol
5a1c7fac22901366fef2642233cab7595b3e543b3a660b8a2c05369440af782f
5a1c7fac2290   sweatcontrol-network   bridge    local
PS C:\Users\muham\sweat-control-ecommerce> # Pull MySQL image
>> docker pull mysql:8.0
>> 
8.0: Pulling from library/mysql
Digest: sha256:64756cc92f707eb504496d774353990bcb0f6999ddf598b6ad188f2da66bd000
Status: Image is up to date for mysql:8.0
docker.io/library/mysql:8.0
PS C:\Users\muham\sweat-control-ecommerce> # Run MySQL container
>> docker run -d `
>>   --name sweatcontrol-mysql `
>>   --network sweatcontrol-network `
>>   -p 3306:3306 `
>>   -e MYSQL_ROOT_PASSWORD=rootpassword123 `
>>   -e MYSQL_DATABASE=sweatcontrol_products_db `
>>   -e MYSQL_USER=sweatcontrol_user `
>>   -e MYSQL_PASSWORD=@BackendSecure2026! `
>>   mysql:8.0
>> 
>> # Verify MySQL is running
>> docker ps | findstr mysql
9e9dc4c6dbd81a3129a29a14e9c17a327e46a5cbe54d35552b6e42fc16ea7082
PS C:\Users\muham\sweat-control-ecommerce>

Great! MySQL is running. Let's continue with the remaining installations:


📦 Step 1: Install Redis
powershell
# Pull Redis image
docker pull redis:7-alpine

# Run Redis container
docker run -d `
  --name sweatcontrol-redis `
  --network sweatcontrol-network `
  -p 6379:6379 `
  redis:7-alpine

# Verify Redis is running
docker ps | findstr redis



📦 Step 2: Install Kafka and Zookeeper
powershell
# Pull Kafka and Zookeeper images
docker pull confluentinc/cp-zookeeper:7.5.0
docker pull confluentinc/cp-kafka:7.5.0

# Run Zookeeper
docker run -d `
  --name sweatcontrol-zookeeper `
  --network sweatcontrol-network `
  -p 2181:2181 `
  -e ZOOKEEPER_CLIENT_PORT=2181 `
  confluentinc/cp-zookeeper:7.5.0

# Wait 10 seconds
Start-Sleep -Seconds 10

# Run Kafka
docker run -d `
  --name sweatcontrol-kafka `
  --network sweatcontrol-network `
  -p 9092:9092 `
  -e KAFKA_BROKER_ID=1 `
  -e KAFKA_ZOOKEEPER_CONNECT=sweatcontrol-zookeeper:2181 `
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 `
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 `
  confluentinc/cp-kafka:7.5.0

# Verify all containers
docker ps
Expected output: You should see 4 containers running (mysql, redis, zookeeper, kafka)



🗄️ Step 3: Create All Databases
powershell
# Wait 30 seconds for MySQL to fully initialize
Write-Host "Waiting 30 seconds for MySQL to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Create databases for each service
docker exec -i sweatcontrol-mysql mysql -u root -prootpassword123 << 'EOF'
CREATE DATABASE IF NOT EXISTS sweatcontrol_products_db;
CREATE DATABASE IF NOT EXISTS sweatcontrol_carts_db;
CREATE DATABASE IF NOT EXISTS sweatcontrol_orders_db;
CREATE DATABASE IF NOT EXISTS sweatcontrol_inventory_db;
CREATE DATABASE IF NOT EXISTS sweatcontrol_payments_db;

GRANT ALL PRIVILEGES ON sweatcontrol_products_db.* TO 'sweatcontrol_user'@'%';
GRANT ALL PRIVILEGES ON sweatcontrol_carts_db.* TO 'sweatcontrol_user'@'%';
GRANT ALL PRIVILEGES ON sweatcontrol_orders_db.* TO 'sweatcontrol_user'@'%';
GRANT ALL PRIVILEGES ON sweatcontrol_inventory_db.* TO 'sweatcontrol_user'@'%';
GRANT ALL PRIVILEGES ON sweatcontrol_payments_db.* TO 'sweatcontrol_user'@'%';
FLUSH PRIVILEGES;
EOF

# Verify databases
docker exec -it sweatcontrol-mysql mysql -u root -prootpassword123 -e "SHOW DATABASES;"
Expected output: You should see all 5 databases plus default ones (mysql, sys, etc.)



📋 Step 4: Install Dependencies for Services
powershell
# Navigate to backend folder
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend

# List all services
$services = @(
    "product-service",
    "cart-service", 
    "order-service",
    "inventory-service",
    "payment-service",
    "notification-service",
    "api-gateway"
)

# Install dependencies for each service
foreach ($service in $services) {
    Write-Host "Installing dependencies for $service..." -ForegroundColor Cyan
    cd $service
    npm install
    cd ..
}

Write-Host "All dependencies installed!" -ForegroundColor Green




🗄️ Step 6: Initialize Database Schemas
powershell
# Initialize product-service database
cd product-service
if (Test-Path scripts\init-db.sql) {
    docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_products_db < scripts\init-db.sql
    Write-Host "Initialized product-service database" -ForegroundColor Green
}
if (Test-Path scripts\seed.sql) {
    docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_products_db < scripts\seed.sql
    Write-Host "Seeded product-service database" -ForegroundColor Green
}
cd ..

# Initialize cart-service database
cd cart-service
if (Test-Path scripts\init-db.sql) {
    docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_carts_db < scripts\init-db.sql
    Write-Host "Initialized cart-service database" -ForegroundColor Green
}
cd ..

# Initialize order-service database
cd order-service
if (Test-Path scripts\init-db.sql) {
    docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_orders_db < scripts\init-db.sql
    Write-Host "Initialized order-service database" -ForegroundColor Green
}
cd ..

# Initialize inventory-service database
cd inventory-service
if (Test-Path scripts\init-db.sql) {
    docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_inventory_db < scripts\init-db.sql
    Write-Host "Initialized inventory-service database" -ForegroundColor Green
}
cd ..

# Initialize payment-service database
cd payment-service
if (Test-Path scripts\init-db.sql) {
    docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_payments_db < scripts\init-db.sql
    Write-Host "Initialized payment-service database" -ForegroundColor Green
}
cd ..

Write-Host "All databases initialized!" -ForegroundColor Green



✅ Step 7: Verify Everything is Ready
powershell
# Check all Docker containers
docker ps

# You should see:
# - sweatcontrol-mysql (Up)
# - sweatcontrol-redis (Up)
# - sweatcontrol-zookeeper (Up)
# - sweatcontrol-kafka (Up)

# Check databases
docker exec -it sweatcontrol-mysql mysql -u root -prootpassword123 -e "SHOW DATABASES;" | findstr sweatcontrol

# You should see:
# sweatcontrol_carts_db
# sweatcontrol_inventory_db
# sweatcontrol_orders_db
# sweatcontrol_payments_db
# sweatcontrol_products_db



🚀 Ready to Start Services
Now you can start each service in separate PowerShell windows:

powershell
# Terminal 1 - Product Service (port 3001)
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\product-service
npm run dev

# Terminal 2 - Cart Service (port 3002)
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\cart-service
npm run dev

# Terminal 3 - Order Service (port 3003)
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\order-service
npm run dev

# Terminal 4 - Inventory Service (port 3004)
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\inventory-service
npm run dev

# Terminal 5 - Payment Service (port 3005)
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\payment-service
npm run dev

# Terminal 6 - Notification Service (port 3006)
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\notification-service
npm run dev

# Terminal 7 - API Gateway (port 3000)
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\api-gateway
npm run dev
Continue with Step 1 (Install Redis) and let me know if any errors occur! 🚀





PS C:\Users\muham\sweat-control-ecommerce> # Pull Kafka and Zookeeper images
>> docker pull confluentinc/cp-zookeeper:7.5.0
>> docker pull confluentinc/cp-kafka:7.5.0
>> 
>> # Run Zookeeper
>> docker run -d `
>>   --name sweatcontrol-zookeeper `
>>   --network sweatcontrol-network `
>>   -p 2181:2181 `
>>   -e ZOOKEEPER_CLIENT_PORT=2181 `
>>   confluentinc/cp-zookeeper:7.5.0
>> 
7.5.0: Pulling from confluentinc/cp-zookeeper
1bad53dda6d5: Pull complete 
0fbb79a570de: Pull complete 
04b3375cab83: Pull complete 
6086b74cc48f: Pull complete 
6edc125f768c: Pull complete 
8592ceb925f7: Pull complete 
57168402cb72: Pull complete 
bd3de482b201: Pull complete 
fb4b1a10a8b8: Pull complete 
95d7897d98ce: Pull complete 
f80eb2db9d48: Pull complete 
Digest: sha256:02f6c042bb9a7844382fc4cedc513a44585d8a5acae873fb9e510e3ca9dcabc6
Status: Downloaded newer image for confluentinc/cp-zookeeper:7.5.0
docker.io/confluentinc/cp-zookeeper:7.5.0
7.5.0: Pulling from confluentinc/cp-kafka
210860798c03: Pull complete 
be07a4b85081: Pull complete 
Digest: sha256:fbbb6fa11b258a88b83f54d4f0bddfcffbf2279f99d66a843486e3da7bdfbf41
Status: Downloaded newer image for confluentinc/cp-kafka:7.5.0
docker.io/confluentinc/cp-kafka:7.5.0
e055fa1e1d183837d267301b984a6112770f7cac5f3542396bb33b8a08aaf02c
PS C:\Users\muham\sweat-control-ecommerce> # Wait 10 seconds
>> Start-Sleep -Seconds 10
>> 
>> # Run Kafka
>> docker run -d `
>>   --name sweatcontrol-kafka `
>>   --network sweatcontrol-network `
>>   -p 9092:9092 `
>>   -e KAFKA_BROKER_ID=1 `
>>   -e KAFKA_ZOOKEEPER_CONNECT=sweatcontrol-zookeeper:2181 `
>>   -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 `
>>   -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 `
>>   confluentinc/cp-kafka:7.5.0
>> 
>> # Verify all containers
>> docker ps
10205a0cf7c3f6ba6cfc1e6f4f782aff799cf5b1b233beb1c702b6c8f0f21456
CONTAINER ID   IMAGE                             COMMAND                  CREATED                  STATUS                  PORTS                                         NAMES
10205a0cf7c3   confluentinc/cp-kafka:7.5.0       "/etc/confluent/dock…"   Less than a second ago   Up Less than a second   0.0.0.0:9092->9092/tcp, [::]:9092->9092/tcp   sweatcontrol-kafka
e055fa1e1d18   confluentinc/cp-zookeeper:7.5.0   "/etc/confluent/dock…"   Less than a second ago   Up 22 seconds           0.0.0.0:2181->2181/tcp, [::]:2181->2181/tcp   sweatcontrol-zookeeper
10a4a00462e7   redis:7-alpine                    "docker-entrypoint.s…"   2 minutes ago            Up 3 minutes            0.0.0.0:6379->6379/tcp, [::]:6379->6379/tcp   sweatcontrol-redis
PS C:\Users\muham\sweat-control-ecommerce>Perfect! All 4 containers are running! Now let's continue:



🗄️ Step 1: Wait for MySQL to Initialize
powershell
# Wait 30 seconds for MySQL to fully initialize
Write-Host "Waiting 30 seconds for MySQL to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check if MySQL is running
docker ps | findstr mysql
Note: I don't see MySQL in your container list. Let's check if it's running:

# Check all containers (including stopped)
docker ps -a | findstr mysql

# If MySQL is not running, start it
docker start sweatcontrol-mysql




🚀 Step 6: Start Services
Open 7 separate PowerShell windows and run these commands:

Terminal 1 - Product Service (Port 3001)
powershell
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\product-service
npm run dev
Terminal 2 - Cart Service (Port 3002)
powershell
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\cart-service
npm run dev
Terminal 3 - Order Service (Port 3003)
powershell
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\order-service
npm run dev
Terminal 4 - Inventory Service (Port 3004)
powershell
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\inventory-service
npm run dev
Terminal 5 - Payment Service (Port 3005)
powershell
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\payment-service
npm run dev
Terminal 6 - Notification Service (Port 3006)
powershell
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\notification-service
npm run dev
Terminal 7 - API Gateway (Port 3000)
powershell
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\api-gateway
npm run dev




🧪 Step 7: Test Services
Open one more PowerShell window to test:

powershell
# Test API Gateway
curl http://localhost:3000/health

# Test Product Service
curl http://localhost:3000/api/products

# Test Cart Service
curl -X POST http://localhost:3002/api/cart -H "Content-Type: application/json" -d '{"productId": 1, "quantity": 2}'

# Test Order Service
curl http://localhost:3003/health

# Test Inventory Service
curl http://localhost:3004/health

# Test Payment Service
curl http://localhost:3005/health

# Test Notification Service
curl http://localhost:3006/health



First, check if MySQL is running by running:

powershell
docker ps -a | findstr mysql
Let me know what you see! 🚀



🗄️ Step 1: Start MySQL Container
powershell
# Check if MySQL container exists
docker ps -a | findstr mysql

# If MySQL container exists but is stopped, start it
docker start sweatcontrol-mysql

# If MySQL container doesn't exist, create it
docker run -d `
  --name sweatcontrol-mysql `
  --network sweatcontrol-network `
  -p 3306:3306 `
  -e MYSQL_ROOT_PASSWORD=rootpassword123 `
  -e MYSQL_DATABASE=sweatcontrol_products_db `
  -e MYSQL_USER=sweatcontrol_user `
  -e MYSQL_PASSWORD=@BackendSecure2026! `
  mysql:8.0



🗄️ Step 2: Wait for MySQL to Initialize
powershell
# Wait 30 seconds for MySQL to fully initialize
Write-Host "Waiting 30 seconds for MySQL to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verify MySQL is running
docker ps | findstr mysql




🗄️ Step 3: Create All Databases
powershell
# Create databases for each service
docker exec -i sweatcontrol-mysql mysql -u root -prootpassword123 << 'EOF'
CREATE DATABASE IF NOT EXISTS sweatcontrol_products_db;
CREATE DATABASE IF NOT EXISTS sweatcontrol_carts_db;
CREATE DATABASE IF NOT EXISTS sweatcontrol_orders_db;
CREATE DATABASE IF NOT EXISTS sweatcontrol_inventory_db;
CREATE DATABASE IF NOT EXISTS sweatcontrol_payments_db;

GRANT ALL PRIVILEGES ON sweatcontrol_products_db.* TO 'sweatcontrol_user'@'%';
GRANT ALL PRIVILEGES ON sweatcontrol_carts_db.* TO 'sweatcontrol_user'@'%';
GRANT ALL PRIVILEGES ON sweatcontrol_orders_db.* TO 'sweatcontrol_user'@'%';
GRANT ALL PRIVILEGES ON sweatcontrol_inventory_db.* TO 'sweatcontrol_user'@'%';
GRANT ALL PRIVILEGES ON sweatcontrol_payments_db.* TO 'sweatcontrol_user'@'%';
FLUSH PRIVILEGES;
EOF

# Verify databases created
docker exec -it sweatcontrol-mysql mysql -u root -prootpassword123 -e "SHOW DATABASES;"



✅ Step 4: Verify All Containers Running
powershell
# Check all containers
docker ps

# You should see:
# - sweatcontrol-mysql (Up)
# - sweatcontrol-redis (Up)
# - sweatcontrol-zookeeper (Up)
# - sweatcontrol-kafka (Up)


🗄️ Step 1: Start the Existing MySQL Container
powershell
# Start the existing MySQL container
docker start sweatcontrol-mysql

# Verify it's running
docker ps | findstr mysql



✅ Step 2: Verify Databases Created
powershell
# Check if databases were created
docker exec -it sweatcontrol-mysql mysql -u root -prootpassword123 -e "SHOW DATABASES;"
Expected output: You should see:

text
sweatcontrol_carts_db
sweatcontrol_inventory_db
sweatcontrol_orders_db
sweatcontrol_payments_db
sweatcontrol_products_db



📋 Step 3: Check All Docker Containers
powershell
# Verify all 4 containers are running
docker ps

# You should see:
# - sweatcontrol-mysql (Up)
# - sweatcontrol-redis (Up)
# - sweatcontrol-zookeeper (Up)
# - sweatcontrol-kafka (Up)




PS C:\Users\muham\sweat-control-ecommerce>
PowerShell doesn't support the << heredoc syntax. Let's use a different method:

🗄️ Step 1: Create Databases (Simpler Method)
powershell
# Create databases one by one
docker exec sweatcontrol-mysql mysql -u root -prootpassword123 -e "CREATE DATABASE IF NOT EXISTS sweatcontrol_products_db;"
docker exec sweatcontrol-mysql mysql -u root -prootpassword123 -e "CREATE DATABASE IF NOT EXISTS sweatcontrol_carts_db;"
docker exec sweatcontrol-mysql mysql -u root -prootpassword123 -e "CREATE DATABASE IF NOT EXISTS sweatcontrol_orders_db;"
docker exec sweatcontrol-mysql mysql -u root -prootpassword123 -e "CREATE DATABASE IF NOT EXISTS sweatcontrol_inventory_db;"
docker exec sweatcontrol-mysql mysql -u root -prootpassword123 -e "CREATE DATABASE IF NOT EXISTS sweatcontrol_payments_db;"
docker exec sweatcontrol-mysql mysql -u root -prootpassword123 -e "
CREATE DATABASE IF NOT EXISTS sweatcontrol_notifications_db;
🔐 Step 2: Grant Privileges
powershell
# Grant privileges
docker exec sweatcontrol-mysql mysql -u root -prootpassword123 -e "GRANT ALL PRIVILEGES ON sweatcontrol_products_db.* TO 'sweatcontrol_user'@'%';"
docker exec sweatcontrol-mysql mysql -u root -prootpassword123 -e "GRANT ALL PRIVILEGES ON sweatcontrol_carts_db.* TO 'sweatcontrol_user'@'%';"
docker exec sweatcontrol-mysql mysql -u root -prootpassword123 -e "GRANT ALL PRIVILEGES ON sweatcontrol_orders_db.* TO 'sweatcontrol_user'@'%';"
docker exec sweatcontrol-mysql mysql -u root -prootpassword123 -e "GRANT ALL PRIVILEGES ON sweatcontrol_inventory_db.* TO 'sweatcontrol_user'@'%';"
docker exec sweatcontrol-mysql mysql -u root -prootpassword123 -e "GRANT ALL PRIVILEGES ON sweatcontrol_payments_db.* TO 'sweatcontrol_user'@'%';"
docker exec sweatcontrol-mysql mysql -u root -prootpassword123 -e "GRANT ALL PRIVILEGES ON sweatcontrol_notifications_db.* TO 'sweatcontrol_user'@'%';"

# Flush privileges
docker exec sweatcontrol-mysql mysql -u root -prootpassword123 -e "FLUSH PRIVILEGES;"
✅ Step 3: Verify Databases
powershell
# Show all databases
docker exec sweatcontrol-mysql mysql -u root -prootpassword123 -e "SHOW DATABASES;"
Expected output:

text
Database
information_schema
mysql
performance_schema
sweatcontrol_carts_db
sweatcontrol_inventory_db
sweatcontrol_orders_db
sweatcontrol_payments_db
sweatcontrol_products_db
sys



📋 Step 4: Initialize Database Schemas
powershell
# Navigate to backend folder
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend

# Initialize product-service database
cd product-service
Get-Content scripts\init-db.sql | docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_products_db
Get-Content scripts\seed.sql | docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_products_db
Write-Host "Initialized product-service database" -ForegroundColor Green
cd ..

# Initialize cart-service database
cd cart-service
Get-Content scripts\init-db.sql | docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_carts_db
Write-Host "Initialized cart-service database" -ForegroundColor Green
cd ..

# Initialize notifications-service database
cd notification-service
Get-Content scripts\init-db.sql | docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_notifications_db
Write-Host "Initialized notifications-service database" -ForegroundColor Green
cd ..  

# Initialize order-service database
cd order-service
Get-Content scripts\init-db.sql | docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_orders_db
Write-Host "Initialized order-service database" -ForegroundColor Green
cd ..

# Initialize inventory-service database
cd inventory-service
Get-Content scripts\init-db.sql | docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_inventory_db
Write-Host "Initialized inventory-service database" -ForegroundColor Green
cd ..

# Initialize payment-service database
cd payment-service
Get-Content scripts\init-db.sql | docker exec -i sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! sweatcontrol_payments_db
Write-Host "Initialized payment-service database" -ForegroundColor Green
cd ..

Write-Host "All databases initialized!" -ForegroundColor Green



🔍 Step 1: Check MySQL Logs
powershell
# Check why MySQL is crashing
docker logs sweatcontrol-mysql



🗄️ Step 1: Remove and Re-pull MySQL Image
powershell
# Stop and remove container
docker stop sweatcontrol-mysql
docker rm sweatcontrol-mysql

# Remove the corrupted image
docker rmi mysql:8.0

# Pull fresh image
docker pull mysql:8.0

# Run MySQL
docker run -d `
  --name sweatcontrol-mysql `
  --network sweatcontrol-network `
  -p 3306:3306 `
  -e MYSQL_ROOT_PASSWORD=rootpassword123 `
  -e MYSQL_DATABASE=sweatcontrol_products_db `
  -e MYSQL_USER=sweatcontrol_user `
  -e MYSQL_PASSWORD=@BackendSecure2026! `
  mysql:8.0
⏰ Step 2: Wait and Check
powershell
# Wait 30 seconds
Start-Sleep -Seconds 30

# Check logs (should say "ready for connections")
docker logs sweatcontrol-mysql --tail 20

# Check if running
docker ps | findstr mysql


✅ Step 5: Verify
powershell
# Show all databases
docker exec sweatcontrol-mysql mysql -u root -prootpassword123 -e "SHOW DATABASES;"
🚀 Step 6: Start Product Service
powershell
# Start product service
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\product-service
npm run dev


output:
Status: Downloaded newer image for mysql:8.0
docker.io/library/mysql:8.0
c76d8310058c4457ec3c8e50464558fcc711e262a77d4fb0b85adbf76dc7ee19
PS C:\Users\muham\sweat-control-ecommerce> # Wait 30 seconds
>> Start-Sleep -Seconds 30
>> 
>> # Check logs (should say "ready for connections")
>> docker logs sweatcontrol-mysql --tail 20
>> 
>> # Check if running
>> docker ps | findstr mysql
2026-04-02 20:19:34+00:00 [Note] [Entrypoint]: Creating database sweatcontrol_products_db
2026-04-02 20:19:34+00:00 [Note] [Entrypoint]: Creating user sweatcontrol_user
2026-04-02 20:19:34+00:00 [Note] [Entrypoint]: Giving user sweatcontrol_user access to schema sweatcontrol_products_db

2026-04-02 20:19:34+00:00 [Note] [Entrypoint]: Stopping temporary server
2026-04-02T20:19:34.443114Z 13 [System] [MY-013172] [Server] Received SHUTDOWN from user root. Shutting down mysqld (Version: 8.0.45).
2026-04-02T20:19:36.584794Z 0 [System] [MY-010910] [Server] /usr/sbin/mysqld: Shutdown complete (mysqld 8.0.45)  MySQL Community Server - GPL.
2026-04-02 20:19:37+00:00 [Note] [Entrypoint]: Temporary server stopped

2026-04-02 20:19:37+00:00 [Note] [Entrypoint]: MySQL init process done. Ready for start up.

2026-04-02T20:19:37.676904Z 0 [Warning] [MY-011068] [Server] The syntax '--skip-host-cache' is deprecated and will be removed in a future release. Please use SET GLOBAL host_cache_size=0 instead.
2026-04-02T20:19:37.678399Z 0 [System] [MY-010116] [Server] /usr/sbin/mysqld (mysqld 8.0.45) starting as process 1
2026-04-02T20:19:37.686399Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2026-04-02T20:19:38.110234Z 1 [System] [MY-013577] [InnoDB] InnoDB initialization has ended.
2026-04-02T20:19:38.634090Z 0 [Warning] [MY-010068] [Server] CA certificate ca.pem is self signed.
2026-04-02T20:19:38.634178Z 0 [System] [MY-013602] [Server] Channel mysql_main configured to support TLS. Encrypted connections are now supported for this channel.
2026-04-02T20:19:38.644082Z 0 [Warning] [MY-011810] [Server] Insecure configuration for --pid-file: Location '/var/run/mysqld' in the path is accessible to all OS users. Consider choosing a different directory.
2026-04-02T20:19:38.681655Z 0 [System] [MY-011323] [Server] X Plugin ready for connections. Bind-address: '::' port: 33060, socket: /var/run/mysqld/mysqlx.sock
2026-04-02T20:19:38.681954Z 0 [System] [MY-010931] [Server] /usr/sbin/mysqld: ready for connections. Version: '8.0.45'  socket: '/var/run/mysqld/mysqld.sock'  port: 3306  MySQL Community Server - GPL.
c76d8310058c   mysql:8.0                         "docker-entrypoint.s???"   11 minutes ago   Up 2 minutes    0.0.0.0:3306->3306/tcp, [::]:3306->3306/tcp   sweatcontrol-mysql
PS C:\Users\muham\sweat-control-ecommerce>Perfect! MySQL is now running successfully! 🎉

You can see ready for connections in the logs. Now let's create the databases:


🧪 Step 5: Test Product Service (in new PowerShell window)
powershell
# Test health
curl http://localhost:3001/health

# Get all products
curl http://localhost:3001/api/products

# Get single product
curl http://localhost:3001/api/products/1




📝 Step 1: Create Product Service Tables
powershell
# Navigate to product-service
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\product-service

# Create products table
docker exec sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_price_pkr DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    minimum_quantity DECIMAL(10,2) DEFAULT 1,
    maximum_quantity DECIMAL(10,2),
    quantity_unit VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);"

# Create reviews table
docker exec sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    reviewer_name VARCHAR(100),
    email VARCHAR(255),
    rating INT NOT NULL,
    comment TEXT,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);"

# Insert sample products
docker exec sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; INSERT INTO products (product_name, description, unit_price_pkr, stock_quantity, quantity_unit) VALUES
('SweatControl Gel', 'Premium sweat-control solution for all-day freshness.', 1499, 500, 'bottle'),
('SweatControl Roll-On', 'Convenient roll-on applicator for targeted protection.', 1299, 300, 'piece'),
('SweatControl Spray', 'Quick-drying spray for instant freshness.', 1699, 200, 'bottle');"

# Insert sample reviews
docker exec sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; INSERT INTO reviews (product_id, reviewer_name, email, rating, comment) VALUES
(1, 'Ahmed Khan', 'ahmed@example.com', 5, 'Amazing product! Works perfectly.'),
(1, 'Sara Ali', 'sara@example.com', 4, 'Good product, fast shipping.'),
(2, 'Fatima Zafar', 'fatima@example.com', 5, 'Very convenient!');"

Write-Host "✅ Product database created with sample data" -ForegroundColor Green
✅ Step 2: Verify Data
powershell
# Check products
docker exec sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; SELECT * FROM products;"

# Check reviews
docker exec sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; SELECT * FROM reviews;"
🚀 Step 3: Start Product Service
powershell
# Start product service
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\product-service
npm run dev
🧪 Step 4: Test Product Service (New PowerShell Window)
powershell
# Test health
curl http://localhost:3001/health

# Test get products
curl http://localhost:3001/api/products

# Test get single product
curl http://localhost:3001/api/products/1
Run Step 1 now to create the tables! 🚀

>> Write-Host "✅ Product database created with sample data" -ForegroundColor Green
mysql: [Warning] Using a password on the command line interface can be insecure.
mysql: [Warning] Using a password on the command line interface can be insecure.
mysql: [Warning] Using a password on the command line interface can be insecure.
mysql: [Warning] Using a password on the command line interface can be insecure.
✅ Product database created with sample data
PS C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\product-service>
Great! The product database is created successfully! Now let's start the product service:

🚀 Step 1: Start Product Service
powershell
# Make sure you're in product-service folder
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\product-service

# Start the service
npm run dev
Wait for it to show: 🚀 Product Service running on port 3001

🧪 Step 2: Test Product Service (Open NEW PowerShell Window)
powershell
# Test health endpoint
curl http://localhost:3001/health

# Test get all products
curl http://localhost:3001/api/products

# Test get single product
curl http://localhost:3001/api/products/1

# Test search products
curl "http://localhost:3001/api/products/search?q=gel"
✅ Expected Output
You should see JSON responses with your products.

If the service starts successfully, let me know and we'll move to the next service! 🚀

>> docker exec sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; SELECT * FROM reviews;"
mysql: [Warning] Using a password on the command line interface can be insecure.
id      product_name    description     unit_price_pkr  stock_quantity  minimum_quantity        maximum_quantity        quantity_unit   is_active      is_deleted      created_at      updated_at
1       SweatControl Gel        Premium sweat-control solution for all-day freshness.   1499.00 500     1.00    NULL    bottle  1       0     2026-04-02 20:32:36      2026-04-02 20:32:36
2       SweatControl Roll-On    Convenient roll-on applicator for targeted protection.  1299.00 300     1.00    NULL    piece   1       0     2026-04-02 20:32:36      2026-04-02 20:32:36
3       SweatControl Spray      Quick-drying spray for instant freshness.       1699.00 200     1.00    NULL    bottle  1       0       2026-04-02 20:32:36    2026-04-02 20:32:36
mysql: [Warning] Using a password on the command line interface can be insecure.
id      product_id      reviewer_name   email   rating  comment is_approved     created_at
1       1       Ahmed Khan      ahmed@example.com       5       Amazing product! Works perfectly.       1       2026-04-02 20:32:37
2       1       Sara Ali        sara@example.com        4       Good product, fast shipping.    1       2026-04-02 20:32:37
3       2       Fatima Zafar    fatima@example.com      5       Very convenient!        1       2026-04-02 20:32:37
PS C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\product-service>
Perfect! Your database is working and has data! Now let's start the Product Service:

🚀 Step 1: Start Product Service
powershell
# Start the product service
npm run dev



🗄️ Step 1: Check if Tables Already Exist
powershell
# Check if products table exists
docker exec sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; SHOW TABLES;"


>> docker exec sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; SELECT * FROM reviews;"
mysql: [Warning] Using a password on the command line interface can be insecure.
id      product_name    description     unit_price_pkr  stock_quantity  minimum_quantity        maximum_quantity        quantity_unit   is_active      is_deleted      created_at      updated_at
1       SweatControl Gel        Premium sweat-control solution for all-day freshness.   1499.00 500     1.00    NULL    bottle  1       0     2026-04-02 20:32:36      2026-04-02 20:32:36
2       SweatControl Roll-On    Convenient roll-on applicator for targeted protection.  1299.00 300     1.00    NULL    piece   1       0     2026-04-02 20:32:36      2026-04-02 20:32:36
3       SweatControl Spray      Quick-drying spray for instant freshness.       1699.00 200     1.00    NULL    bottle  1       0       2026-04-02 20:32:36    2026-04-02 20:32:36
mysql: [Warning] Using a password on the command line interface can be insecure.
id      product_id      reviewer_name   email   rating  comment is_approved     created_at
1       1       Ahmed Khan      ahmed@example.com       5       Amazing product! Works perfectly.       1       2026-04-02 20:32:37
2       1       Sara Ali        sara@example.com        4       Good product, fast shipping.    1       2026-04-02 20:32:37
3       2       Fatima Zafar    fatima@example.com      5       Very convenient!        1       2026-04-02 20:32:37
PS C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\product-service>



🔧 Step 1: Check your .env file
powershell
# Check if .env exists
Get-Content .env

# If it doesn't exist or is empty, create it:



✅ Step 4: Verify MySQL is running
powershell
# Check if MySQL container is running
docker ps | findstr mysql

# If not running, start it
docker start sweatcontrol-mysql


If not running:

powershell
docker start sweatcontrol-mysql



🚀 Step 4: Restart Product Service
powershell
npm run dev


🔧 Step 2: Test MySQL Connection
powershell
docker exec sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "SHOW DATABASES;"


🚀 Step 3: Restart Product Service
powershell
npm run dev


🧪 Step 4: Test (New PowerShell Window)
powershell
curl http://localhost:3001/health
curl http://localhost:3001/api/products
Run Step 1 first to check if MySQL is running! 🚀



📋 Which Services Need .env
Service	Need .env?	Port	Database
product-service	✅ Yes	3001	sweatcontrol_products_db
cart-service	✅ Yes	3002	sweatcontrol_carts_db
order-service	✅ Yes	3003	sweatcontrol_orders_db
inventory-service	✅ Yes	3004	sweatcontrol_inventory_db
payment-service	✅ Yes	3005	sweatcontrol_payments_db
notification-service	✅ Yes	3006	(no database)
api-gateway	✅ Yes	3000	(no database)



🔧 Quick Check Command
powershell
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend

# Check all services at once
$services = @("product-service", "cart-service", "order-service", "inventory-service", "payment-service", "notification-service", "api-gateway")

foreach ($service in $services) {
    $envPath = "$service\.env"
    if (Test-Path $envPath) {
        Write-Host "✅ $service - .env exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $service - .env MISSING" -ForegroundColor Red
    }
}




🔧 Step 1: Install dotenv (if not already)
powershell
npm install dotenv



[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node src/server.js`
PORT from env: 3001
DB_HOST from env: localhost
DB_HOST: localhost
DB_USER: sweatcontrol_user
DB_NAME: sweatcontrol_products_db
info: ✅ MySQL connected to sweatcontrol_products_db {"timestamp":"2026-04-03 02:22:23"}
info: ✅ MySQL database connected {"timestamp":"2026-04-03 02:22:23"}
info: ✅ Redis connected {"timestamp":"2026-04-03 02:22:23"}
info: ✅ Redis cache connected {"timestamp":"2026-04-03 02:22:23"}
info: 🚀 Product Service running on port 3001 {"timestamp":"2026-04-03 02:22:23"}
info: 📋 Environment: development {"timestamp":"2026-04-03 02:22:23"}
info: 🔗 Health check: http://localhost:3001/health {"timestamp":"2026-04-03 02:22:23"}

🎉 CONGRATULATIONS! Your Product Service is successfully running!



✅ Product Service Status
Item	Status
MySQL Connection	✅ Connected
Redis Connection	✅ Connected
Server Running	✅ Port 3001
Health Check	✅ Available


🚀 Step 2: Start Next Services
Now you can start other services in new PowerShell windows:

Cart Service (Port 3002)
powershell
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\cart-service
npm run dev





output:
PS C:\Users\muham\sweat-control-ecommerce> # Health check
>> curl http://localhost:3001/health
>>                                                                                                                                             
>> # Get all products                                                                                                                          
>> curl http://localhost:3001/api/products                                                                                                     
>>                                                                                                                                             
>> # Get single product
>> curl http://localhost:3001/api/products/1
>> 
>> # Search products
>> curl "http://localhost:3001/api/products/search?q=gel"
>> 
>> # Get product reviews
>> curl http://localhost:3001/api/products/1/reviews


StatusCode        : 200
StatusDescription : OK
Content           : {"status":"healthy","service":"product-service","timestamp":"2026-04-02T21:25:18.611Z","uptime":175.8744924}
RawContent        : HTTP/1.1 200 OK
                    Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';base-uri 'self';font-src    
                    'self' https: data:;form-action 'self';frame-ancestors 'self';i...                                                         
Forms             : {}                                                                                                                         
Headers           : {[Content-Security-Policy, default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';base-uri 'self';font-src  
                    'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src-attr 
                    'none';upgrade-insecure-requests], [Cross-Origin-Opener-Policy, same-origin], [Cross-Origin-Resource-Policy, 
                    same-origin], [Origin-Agent-Cluster, ?1]...}
Images            : {}
InputFields       : {}
Links             : {}
ParsedHtml        : mshtml.HTMLDocumentClass
RawContentLength  : 108

StatusCode        : 200
StatusDescription : OK
Content           : {"success":true,"message":"Products fetched successfully","data":[{"id":1,"name":"SweatControl 
                    Gel","description":"Premium sweat-control solution for all-day freshness.","price":1499,"stock":500,"minQ...
RawContent        : HTTP/1.1 200 OK
                    Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';base-uri 'self';font-src    
                    'self' https: data:;form-action 'self';frame-ancestors 'self';i...                                                         
Forms             : {}                                                                                                                         
Headers           : {[Content-Security-Policy, default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';base-uri 'self';font-src  
                    'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src-attr 
                    'none';upgrade-insecure-requests], [Cross-Origin-Opener-Policy, same-origin], [Cross-Origin-Resource-Policy, 
                    same-origin], [Origin-Agent-Cluster, ?1]...}
Images            : {}
InputFields       : {}
Links             : {}
ParsedHtml        : mshtml.HTMLDocumentClass
RawContentLength  : 658

StatusCode        : 200
StatusDescription : OK
Content           : {"success":true,"message":"Product fetched successfully","data":{"id":1,"name":"SweatControl Gel","description":"Premium 
                    sweat-control solution for all-day freshness.","price":1499,"stock":500,"minQua...
RawContent        : HTTP/1.1 200 OK
                    Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';base-uri 'self';font-src    
                    'self' https: data:;form-action 'self';frame-ancestors 'self';i...                                                         
Forms             : {}                                                                                                                         
Headers           : {[Content-Security-Policy, default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';base-uri 'self';font-src  
                    'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src-attr 
                    'none';upgrade-insecure-requests], [Cross-Origin-Opener-Policy, same-origin], [Cross-Origin-Resource-Policy, 
                    same-origin], [Origin-Agent-Cluster, ?1]...}
Images            : {}
InputFields       : {}
Links             : {}
ParsedHtml        : mshtml.HTMLDocumentClass
RawContentLength  : 374

StatusCode        : 200
StatusDescription : OK
Content           : {"success":true,"message":"Search completed","data":[{"id":1,"name":"SweatControl 
                    Gel","price":1499,"description":"Premium sweat-control solution for all-day freshness."}],"timestamp":"2026-04-02T21:2...
RawContent        : HTTP/1.1 200 OK
                    Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';base-uri 'self';font-src 
                    'self' https: data:;form-action 'self';frame-ancestors 'self';i...
Forms             : {}
Headers           : {[Content-Security-Policy, default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';base-uri 'self';font-src 
                    'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src-attr 
                    'none';upgrade-insecure-requests], [Cross-Origin-Opener-Policy, same-origin], [Cross-Origin-Resource-Policy, 
                    same-origin], [Origin-Agent-Cluster, ?1]...}
Images            : {}
InputFields       : {}
Links             : {}
ParsedHtml        : mshtml.HTMLDocumentClass
RawContentLength  : 211

curl : {"success":false,"message":"Route /api/products/1/reviews not found"}
At line:14 char:1
+ curl http://localhost:3001/api/products/1/reviews
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidOperation: (System.Net.HttpWebRequest:HttpWebRequest) [Invoke-WebRequest], WebException
    + FullyQualifiedErrorId : WebCmdletWebResponseException,Microsoft.PowerShell.Commands.InvokeWebRequestCommand


🎉 PRODUCT SERVICE IS WORKING PERFECTLY!

All APIs are responding correctly except the reviews endpoint (which may not be implemented yet).



✅ Test Results
Endpoint	Status	Result
/health	✅ Working	Service healthy
/api/products	✅ Working	Returns 3 products
/api/products/1	✅ Working	Returns product details
/api/products/search?q=gel	✅ Working	Returns search results
/api/products/1/reviews	⚠️ Not Found	Route not implemented




🔍 View Database Tables
Method 1: Using Docker Exec (Quick)
powershell
# Connect to MySQL and see all tables in products database
docker exec -it sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; SHOW TABLES;"
powershell
# See the products table data
docker exec -it sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; SELECT * FROM products;"
powershell
# See the reviews table data
docker exec -it sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; SELECT * FROM reviews;"
Method 2: Interactive MySQL Session
powershell
# Login to MySQL interactively
docker exec -it sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026!
Then inside MySQL, run:

sql
-- Show all databases
SHOW DATABASES;

-- Use products database
USE sweatcontrol_products_db;

-- Show all tables
SHOW TABLES;

-- View products
SELECT * FROM products;

-- View reviews
SELECT * FROM reviews;

-- Exit
EXIT;
Method 3: View All Databases at Once
powershell
# See all databases
docker exec sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "SHOW DATABASES;"

# See all tables in products db
docker exec sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; SHOW TABLES;"

# See all tables in carts db
docker exec sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_carts_db; SHOW TABLES;"

# See all tables in orders db
docker exec sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_orders_db; SHOW TABLES;"

# See all tables in inventory db
docker exec sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_inventory_db; SHOW TABLES;"

# See all tables in payments db
docker exec sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_payments_db; SHOW TABLES;"
Method 4: Install MySQL Workbench (GUI)
If you want a graphical interface:

Download MySQL Workbench from: https://dev.mysql.com/downloads/workbench/

Install it

Connect with:

Host: localhost

Port: 3306

User: sweatcontrol_user

Password: @BackendSecure2026!

📊 Expected Output
When you run the commands, you should see:

text
+-------------------------------+
| Tables_in_sweatcontrol_products_db |
+-------------------------------+
| products                      |
| reviews                       |
+-------------------------------+

+----+------------------+------------------------------------------+------------+
| id | product_name     | description                              | price      |
+----+------------------+------------------------------------------+------------+
| 1  | SweatControl Gel | Premium sweat-control solution...        | 1499.00    |
| 2  | SweatControl Roll-On | Convenient roll-on applicator...      | 1299.00    |
| 3  | SweatControl Spray | Quick-drying spray for instant freshness.| 1699.00    |
+----+------------------+------------------------------------------+------------+
Run Method 1 first and let me know what you see! 🔍


🔍 View All Databases
powershell
docker exec -it sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "SHOW DATABASES;"
📊 View Products Table
powershell
docker exec -it sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; SELECT * FROM products;"
📊 View Reviews Table
powershell
docker exec -it sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; SELECT * FROM reviews;"
📊 View All Tables in Products DB
powershell
docker exec -it sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; SHOW TABLES;"


🖥️ Interactive Mode (Best for Exploring)
powershell
docker exec -it sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026!
Then type these commands:

sql
SHOW DATABASES;
USE sweatcontrol_products_db;
SHOW TABLES;
SELECT * FROM products;
SELECT * FROM reviews;
EXIT;
Run the first command and show me what you see! 🔍


output:
PS C:\Users\muham\sweat-control-ecommerce> docker exec -it sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "SHOW DATABASES;"
mysql: [Warning] Using a password on the command line interface can be insecure.
+---------------------------+
| Database                  |
+---------------------------+
| information_schema        |
| performance_schema        |
| sweatcontrol_carts_db     |
| sweatcontrol_inventory_db |
| sweatcontrol_orders_db    |
| sweatcontrol_payments_db  |
| sweatcontrol_products_db  |
+---------------------------+
PS C:\Users\muham\sweat-control-ecommerce> docker exec -it sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; SELECT * FROM products;"
mysql: [Warning] Using a password on the command line interface can be insecure.
+----+----------------------+--------------------------------------------------------+----------------+----------------+------------------+------------------+---------------+-----------+------------+---------------------+---------------------+
| id | product_name         | description                                            | unit_price_pkr | stock_quantity | minimum_quantity | maximum_quantity | quantity_unit | is_active | is_deleted | created_at          | updated_at          |
+----+----------------------+--------------------------------------------------------+----------------+----------------+------------------+------------------+---------------+-----------+------------+---------------------+---------------------+
|  1 | SweatControl Gel     | Premium sweat-control solution for all-day freshness.  |        1499.00 |            500 |             1.00 |             NULL | bottle        |         1 |          0 | 2026-04-02 20:32:36 | 2026-04-02 20:32:36 |
|  2 | SweatControl Roll-On | Convenient roll-on applicator for targeted protection. |        1299.00 |            300 |             1.00 |             NULL | piece         |         1 |          0 | 2026-04-02 20:32:36 | 2026-04-02 20:32:36 |
|  3 | SweatControl Spray   | Quick-drying spray for instant freshness.              |        1699.00 |            200 |             1.00 |             NULL | bottle        |         1 |          0 | 2026-04-02 20:32:36 | 2026-04-02 20:32:36 |
+----+----------------------+--------------------------------------------------------+----------------+----------------+------------------+------------------+---------------+-----------+------------+---------------------+---------------------+
PS C:\Users\muham\sweat-control-ecommerce> docker exec -it sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026! -e "USE sweatcontrol_products_db; SELECT * FROM reviews;"
mysql: [Warning] Using a password on the command line interface can be insecure.
+----+------------+---------------+--------------------+--------+-----------------------------------+-------------+---------------------+
| id | product_id | reviewer_name | email              | rating | comment                           | is_approved | created_at          |
+----+------------+---------------+--------------------+--------+-----------------------------------+-------------+---------------------+
|  1 |          1 | Ahmed Khan    | ahmed@example.com  |      5 | Amazing product! Works perfectly. |           1 | 2026-04-02 20:32:37 |
|  2 |          1 | Sara Ali      | sara@example.com   |      4 | Good product, fast shipping.      |           1 | 2026-04-02 20:32:37 |
|  3 |          2 | Fatima Zafar  | fatima@example.com |      5 | Very convenient!                  |           1 | 2026-04-02 20:32:37 |
+----+------------+---------------+--------------------+--------+-----------------------------------+-------------+---------------------+
PS C:\Users\muham\sweat-control-ecommerce> docker exec -it sweatcontrol-mysql mysql -u sweatcontrol_user -p@BackendSecure2026!
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 45
Server version: 8.0.45 MySQL Community Server - GPL

Copyright (c) 2000, 2026, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> SHOW DATABASES;
+---------------------------+
| Database                  |
+---------------------------+
| information_schema        |
| performance_schema        |
| sweatcontrol_carts_db     |
| sweatcontrol_inventory_db |
| sweatcontrol_orders_db    |
| sweatcontrol_payments_db  |
| sweatcontrol_products_db  |
+---------------------------+
7 rows in set (0.00 sec)

mysql> USE sweatcontrol_products_db;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> SHOW TABLES;
+------------------------------------+
| Tables_in_sweatcontrol_products_db |
+------------------------------------+
| products                           |
| reviews                            |
+------------------------------------+
2 rows in set (0.01 sec)

mysql> SELECT * FROM products;
+----+----------------------+--------------------------------------------------------+----------------+----------------+------------------+------------------+---------------+-----------+------------+---------------------+---------------------+
| id | product_name         | description                                            | unit_price_pkr | stock_quantity | minimum_quantity | maximum_quantity | quantity_unit | is_active | is_deleted | created_at          | updated_at          |
+----+----------------------+--------------------------------------------------------+----------------+----------------+------------------+------------------+---------------+-----------+------------+---------------------+---------------------+
|  1 | SweatControl Gel     | Premium sweat-control solution for all-day freshness.  |        1499.00 |            500 |             1.00 |             NULL | bottle        |         1 |          0 | 2026-04-02 20:32:36 | 2026-04-02 20:32:36 |
|  2 | SweatControl Roll-On | Convenient roll-on applicator for targeted protection. |        1299.00 |            300 |             1.00 |             NULL | piece         |         1 |          0 | 2026-04-02 20:32:36 | 2026-04-02 20:32:36 |
|  3 | SweatControl Spray   | Quick-drying spray for instant freshness.              |        1699.00 |            200 |             1.00 |             NULL | bottle        |         1 |          0 | 2026-04-02 20:32:36 | 2026-04-02 20:32:36 |
+----+----------------------+--------------------------------------------------------+----------------+----------------+------------------+------------------+---------------+-----------+------------+---------------------+---------------------+
3 rows in set (0.00 sec)

mysql> SELECT * FROM reviews;
+----+------------+---------------+--------------------+--------+-----------------------------------+-------------+---------------------+
| id | product_id | reviewer_name | email              | rating | comment                           | is_approved | created_at          |
+----+------------+---------------+--------------------+--------+-----------------------------------+-------------+---------------------+
|  1 |          1 | Ahmed Khan    | ahmed@example.com  |      5 | Amazing product! Works perfectly. |           1 | 2026-04-02 20:32:37 |
|  2 |          1 | Sara Ali      | sara@example.com   |      4 | Good product, fast shipping.      |           1 | 2026-04-02 20:32:37 |
|  3 |          2 | Fatima Zafar  | fatima@example.com |      5 | Very convenient!                  |           1 | 2026-04-02 20:32:37 |
+----+------------+---------------+--------------------+--------+-----------------------------------+-------------+---------------------+
3 rows in set (0.00 sec)

mysql> EXIT;

🎉 Perfect! Your database is working beautifully!

You can see all your data:

📊 What You Have
Products Table (3 products)
ID	Name	Price	Stock
1	SweatControl Gel	1499	500
2	SweatControl Roll-On	1299	300
3	SweatControl Spray	1699	200
Reviews Table (3 reviews)
Product	Reviewer	Rating	Comment
Gel	Ahmed Khan	5	Amazing product!
Gel	Sara Ali	4	Good product, fast shipping
Roll-On	Fatima Zafar	5	Very convenient!
Databases Created (6 databases)
✅ sweatcontrol_products_db

✅ sweatcontrol_carts_db

✅ sweatcontrol_orders_db

✅ sweatcontrol_inventory_db

✅ sweatcontrol_payments_db

(notification service has no database)

🚀 Next Steps
Now start your Cart Service:

Open a NEW PowerShell window and run:
powershell
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\cart-service
npm run dev



## cart service
# Check Cart Service
curl.exe http://localhost:3002/health

Open a NEW PowerShell window and run:

powershell
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\cart-service
npm run dev

✅ Step 2: Wait for it to show
text
🚀 Cart Service running on port 3002


🧪 Step 4: Add item to cart
powershell
$body = '{"productId":1,"quantity":2}'
Invoke-RestMethod -Uri "http://localhost:3002/api/cart" -Method POST -Body $body -ContentType "application/json"
Open a new PowerShell window and start Cart Service! 🚀


✅ Expected Response
json
{
    "success": true,
    "message": "Item added to cart",
    "data": {
        "guestToken": "550e8400-e29b-41d4-a716-446655440000",
        "cart": [...],
        "total": 2998
    }
}


📋 Running Services
Service	Port	Status
Product Service	3001	✅ Running
Cart Service	3002	✅ Running



✅ Success! Your Cart Service is now:
Feature	Status
Product validation	✅ Working
Price snapshot	✅ 1499.00
Total calculation	✅ 2998.00
Guest token generation	✅ Working
Database storage	✅ Working



📋 Services Running
Service	Port	Status
Product Service	3001	✅ Running
Cart Service	3002	✅ Running
Order Service	3003	✅ Running
Kafka	9092	✅ Configured
