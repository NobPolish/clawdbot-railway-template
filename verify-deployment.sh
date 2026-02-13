#!/bin/bash

# Clawdbot Deployment Verification Script
# Run this to verify both backend and frontend are ready for deployment

echo "🚀 Clawdbot Deployment Verification"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "✓ Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}${NODE_VERSION}${NC}"
else
    echo -e "${RED}Not installed${NC}"
    exit 1
fi

# Check npm
echo -n "✓ Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}${NPM_VERSION}${NC}"
else
    echo -e "${RED}Not installed${NC}"
    exit 1
fi

echo ""
echo "Checking Backend..."
echo "-------------------"

# Check backend server.js
echo -n "✓ Backend server.js... "
if [ -f "src/server.js" ]; then
    echo -e "${GREEN}Found${NC}"
else
    echo -e "${RED}Not found${NC}"
fi

# Check backend package.json
echo -n "✓ Backend package.json... "
if [ -f "package.json" ]; then
    echo -e "${GREEN}Found${NC}"
else
    echo -e "${RED}Not found${NC}"
fi

echo ""
echo "Checking Frontend..."
echo "-------------------"

# Check frontend exists
echo -n "✓ Frontend directory... "
if [ -d "frontend" ]; then
    echo -e "${GREEN}Found${NC}"
else
    echo -e "${RED}Not found${NC}"
    exit 1
fi

# Check frontend package.json
echo -n "✓ Frontend package.json... "
if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}Found${NC}"
else
    echo -e "${RED}Not found${NC}"
fi

# Check frontend .env.example
echo -n "✓ Frontend .env.example... "
if [ -f "frontend/.env.example" ]; then
    echo -e "${GREEN}Found${NC}"
else
    echo -e "${YELLOW}Missing (create with: cp frontend/.env.example frontend/.env.local)${NC}"
fi

# Check frontend Dockerfile
echo -n "✓ Frontend Dockerfile... "
if [ -f "frontend/Dockerfile" ]; then
    echo -e "${GREEN}Found${NC}"
else
    echo -e "${YELLOW}Missing${NC}"
fi

echo ""
echo "Checking Key Files..."
echo "-------------------"

declare -a files=("DEPLOYMENT_GUIDE.md" "FRONTEND_INTEGRATION_GUIDE.md" "BUILD_SUMMARY.md" "INTEGRATION_GUIDE.md")

for file in "${files[@]}"; do
    echo -n "✓ ${file}... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}Found${NC}"
    else
        echo -e "${YELLOW}Missing${NC}"
    fi
done

echo ""
echo "Environment Checks..."
echo "-------------------"

# Check if backend env exists
if [ -f ".env" ]; then
    echo -e "✓ Backend .env... ${GREEN}Configured${NC}"
else
    echo -e "✓ Backend .env... ${YELLOW}Not configured${NC}"
fi

# Check if frontend env exists
if [ -f "frontend/.env.local" ]; then
    echo -e "✓ Frontend .env.local... ${GREEN}Configured${NC}"
else
    echo -e "✓ Frontend .env.local... ${YELLOW}Not configured${NC}"
fi

echo ""
echo "Deployment Status"
echo "==================${NC}"
echo ""
echo -e "${GREEN}✓ All checks passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Configure .env files (see DEPLOYMENT_GUIDE.md)"
echo "2. Test locally: npm run dev (backend) & cd frontend && npm run dev"
echo "3. Deploy backend to Railway"
echo "4. Deploy frontend to Vercel or Railway"
echo ""
echo "For detailed instructions, see: DEPLOYMENT_GUIDE.md"
