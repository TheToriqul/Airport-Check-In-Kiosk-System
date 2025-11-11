#!/bin/bash

# Test script to verify backend-frontend connection

echo "🔍 Testing Backend-Frontend Connection..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Backend Health
echo "1. Testing Backend Health Endpoint..."
BACKEND_HEALTH=$(curl -s http://localhost:8080/api/health 2>/dev/null)
if [ $? -eq 0 ] && echo "$BACKEND_HEALTH" | grep -q "success"; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running or not accessible${NC}"
    echo "   Please start the backend: cd backend && mvn spring-boot:run"
    exit 1
fi

# Test Frontend
echo ""
echo "2. Testing Frontend..."
FRONTEND_RESPONSE=$(curl -s http://localhost:5173 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend may not be running${NC}"
    echo "   Please start the frontend: cd frontend && npm run dev"
fi

# Test API Endpoint
echo ""
echo "3. Testing API Endpoint (Booking Search)..."
API_RESPONSE=$(curl -s -X POST http://localhost:8080/api/bookings/search \
    -H "Content-Type: application/json" \
    -d '{"bookingReference":"BK001"}' 2>/dev/null)

if echo "$API_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ API endpoint is working${NC}"
    echo "   Response: $(echo $API_RESPONSE | head -c 100)..."
else
    echo -e "${YELLOW}⚠️  API endpoint test failed (this is expected if database is not set up)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Connection test complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Ensure PostgreSQL is running and database is created"
echo "2. Start backend: cd backend && mvn spring-boot:run"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Open http://localhost:5173 in your browser"

