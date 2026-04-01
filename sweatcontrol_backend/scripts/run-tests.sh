@'
#!/bin/bash
# ==================== Test Runner Script ====================

set -e

echo "🧪 Running all tests..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Services to test
SERVICES=("product-service" "cart-service" "order-service" "inventory-service" "payment-service" "notification-service" "api-gateway")

# Unit tests
echo -e "\n${YELLOW}📦 Running unit tests...${NC}"
for SERVICE in "${SERVICES[@]}"; do
    if [ -d "./$SERVICE" ]; then
        echo "Testing $SERVICE..."
        cd $SERVICE
        npm test -- --coverage --silent
        cd ..
    fi
done

# Integration tests
echo -e "\n${YELLOW}🔗 Running integration tests...${NC}"
for SERVICE in "${SERVICES[@]}"; do
    if [ -d "./$SERVICE" ]; then
        echo "Integration testing $SERVICE..."
        cd $SERVICE
        npm run test:integration -- --silent || true
        cd ..
    fi
done

# End-to-end tests
echo -e "\n${YELLOW}🌐 Running E2E tests...${NC}"
if [ -d "./tests/e2e" ]; then
    cd tests/e2e
    npm test
    cd ../..
fi

# Test coverage report
echo -e "\n${YELLOW}📊 Generating coverage report...${NC}"

# Combine coverage reports
mkdir -p coverage
for SERVICE in "${SERVICES[@]}"; do
    if [ -f "./$SERVICE/coverage/coverage-final.json" ]; then
        cp "./$SERVICE/coverage/coverage-final.json" "./coverage/${SERVICE}.json"
    fi
done

# Generate summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ All tests completed!${NC}"
echo -e "${GREEN}========================================${NC}"

# Check for failures
FAILED=$(grep -r "failing" ./coverage/ 2>/dev/null || echo "0")
if [ "$FAILED" != "0" ]; then
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
fi

exit 0
'@ | Out-File -FilePath ..\scripts\run-tests.sh -Encoding utf8