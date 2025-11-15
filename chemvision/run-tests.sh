#!/bin/bash

# ChemVision Test Runner Script
# Runs all tests for backend and frontend

set -e  # Exit on error

echo "======================================"
echo "ChemVision Test Suite"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend Tests
echo -e "${BLUE}Running Backend Tests...${NC}"
echo "--------------------------------------"
cd backend

echo "→ Installing backend dependencies..."
pip install -q -e ".[dev]" 2>&1 | tail -5

echo "→ Running ruff (lint)..."
ruff check .

echo "→ Running ruff (format check)..."
ruff format --check .

echo "→ Running mypy (type check)..."
mypy app

echo "→ Running pytest with coverage..."
python -m pytest -v --cov=app --cov-report=term-missing

echo -e "${GREEN}✓ Backend tests passed!${NC}"
echo ""

# Frontend Tests
cd ../frontend
echo -e "${BLUE}Running Frontend Tests...${NC}"
echo "--------------------------------------"

echo "→ Installing frontend dependencies..."
pnpm install --silent 2>&1 | tail -5

echo "→ Running ESLint..."
pnpm lint

echo "→ Running vitest..."
pnpm test --run

echo "→ Building production bundle..."
pnpm build

echo -e "${GREEN}✓ Frontend tests passed!${NC}"
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}✓ All tests passed successfully!${NC}"
echo "======================================"
echo ""
echo "Coverage reports:"
echo "  Backend:  backend/htmlcov/index.html"
echo "  Frontend: Run 'pnpm test:ui' in frontend/"
echo ""
