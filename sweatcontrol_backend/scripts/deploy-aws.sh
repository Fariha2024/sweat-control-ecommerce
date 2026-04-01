@'
#!/bin/bash
# ==================== AWS Deployment Script ====================

set -e

echo "🚀 Starting AWS Deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not installed${NC}"
    exit 1
fi

# Check Terraform
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform not installed${NC}"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not installed${NC}"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set variables
AWS_REGION=${AWS_REGION:-"ap-southeast-1"}
ECR_PREFIX=${ECR_PREFIX:-"sweatcontrol"}
TAG=${TAG:-"latest"}

echo -e "${GREEN}✅ Environment: $AWS_REGION${NC}"

# ==================== Build and Push Docker Images ====================
echo -e "\n${YELLOW}📦 Building and pushing Docker images...${NC}"

SERVICES=("product-service" "cart-service" "order-service" "inventory-service" "payment-service" "notification-service" "api-gateway")

for SERVICE in "${SERVICES[@]}"; do
    echo -e "\n📦 Building $SERVICE..."
    
    # Login to ECR
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Build image
    docker build -t $ECR_PREFIX/$SERVICE:$TAG ./$SERVICE
    
    # Tag image
    docker tag $ECR_PREFIX/$SERVICE:$TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_PREFIX-$SERVICE:$TAG
    
    # Push image
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_PREFIX-$SERVICE:$TAG
    
    echo -e "${GREEN}✅ $SERVICE pushed to ECR${NC}"
done

# ==================== Deploy Infrastructure with Terraform ====================
echo -e "\n${YELLOW}🏗️ Deploying infrastructure with Terraform...${NC}"

cd terraform

# Initialize Terraform
terraform init

# Plan
terraform plan -out=tfplan

# Apply
terraform apply tfplan

# Get outputs
ALB_DNS=$(terraform output -raw alb_dns_name)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)

cd ..

# ==================== Database Migration ====================
echo -e "\n${YELLOW}🗄️ Running database migrations...${NC}"

# Run migrations for each service
for SERVICE in "${SERVICES[@]}"; do
    if [ -f "./$SERVICE/scripts/init-db.sql" ]; then
        echo "Running migrations for $SERVICE..."
        mysql -h $RDS_ENDPOINT -u $DB_USER -p$DB_PASSWORD < "./$SERVICE/scripts/init-db.sql"
    fi
done

# ==================== Update ECS Services ====================
echo -e "\n${YELLOW}🔄 Updating ECS services...${NC}"

for SERVICE in "${SERVICES[@]}"; do
    aws ecs update-service \
        --cluster sweatcontrol-cluster \
        --service sweatcontrol-$SERVICE \
        --force-new-deployment \
        --region $AWS_REGION
    
    echo -e "${GREEN}✅ $SERVICE deployment triggered${NC}"
done

# ==================== Health Check ====================
echo -e "\n${YELLOW}🏥 Running health checks...${NC}"

sleep 30

for i in {1..30}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$ALB_DNS/health)
    if [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}✅ API Gateway is healthy!${NC}"
        break
    fi
    echo "Waiting for API Gateway... ($i/30)"
    sleep 10
done

# ==================== Deployment Summary ====================
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ AWS Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "🌐 API Gateway: http://$ALB_DNS"
echo -e "📊 Grafana: http://$ALB_DNS:3000"
echo -e "📈 Prometheus: http://$ALB_DNS:9090"
echo -e "🔄 Kafka UI: http://$ALB_DNS:8080"
echo -e "\n${YELLOW}To monitor logs:${NC}"
echo -e "  aws logs tail /ecs/sweatcontrol-api-gateway --follow"
echo -e "\n${YELLOW}To scale services:${NC}"
echo -e "  aws ecs update-service --cluster sweatcontrol-cluster --service sweatcontrol-product-service --desired-count 5"
'@ | Out-File -FilePath ..\scripts\deploy-aws.sh -Encoding utf8