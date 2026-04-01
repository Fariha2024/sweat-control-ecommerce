@'
#!/bin/bash
# ==================== Health Check Script ====================

set -e

echo "🏥 Running health checks..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Service endpoints
SERVICES=(
    "product-service:3001"
    "cart-service:3002"
    "order-service:3003"
    "inventory-service:3004"
    "payment-service:3005"
    "notification-service:3006"
    "api-gateway:3000"
)

# Health check function
check_health() {
    local service=$1
    local host=$(echo $service | cut -d: -f1)
    local port=$(echo $service | cut -d: -f2)
    local url="http://localhost:$port/health"
    
    if curl -s -o /dev/null -w "%{http_code}" $url | grep -q "200"; then
        echo -e "${GREEN}✅ $host: healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ $host: unhealthy${NC}"
        return 1
    fi
}

# Check all services
FAILED=0
for service in "${SERVICES[@]}"; do
    check_health $service || FAILED=1
done

# Database health
echo -e "\n${YELLOW}🗄️ Checking database...${NC}"
if mysqladmin ping -h localhost -u root -p${DB_PASSWORD} 2>/dev/null; then
    echo -e "${GREEN}✅ MySQL: healthy${NC}"
else
    echo -e "${RED}❌ MySQL: unhealthy${NC}"
    FAILED=1
fi

# Redis health
echo -e "\n${YELLOW}💾 Checking Redis...${NC}"
if redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}✅ Redis: healthy${NC}"
else
    echo -e "${RED}❌ Redis: unhealthy${NC}"
    FAILED=1
fi

# Kafka health
echo -e "\n${YELLOW}📨 Checking Kafka...${NC}"
if nc -z localhost 9092 2>/dev/null; then
    echo -e "${GREEN}✅ Kafka: healthy${NC}"
else
    echo -e "${RED}❌ Kafka: unhealthy${NC}"
    FAILED=1
fi

# Summary
echo -e "\n${GREEN}========================================${NC}"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All services are healthy!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some services are unhealthy!${NC}"
    exit 1
fi
'@ | Out-File -FilePath ..\scripts\health-check.sh -Encoding utf8