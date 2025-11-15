#!/bin/bash

# CI Check Script - Simulates GitHub Actions CI workflow locally
# This script runs the same checks that will run in CI

set -e  # Exit on error

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "CI Check - Simulating GitHub Actions"
echo "======================================"
echo ""

FAILED=0

# Function to run a command and track failures
run_check() {
    local name="$1"
    shift
    echo -e "${BLUE}→ $name${NC}"
    if "$@"; then
        echo -e "${GREEN}✓ $name passed${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}✗ $name failed${NC}"
        echo ""
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Backend Tests
echo "======================================"
echo "Backend Tests (Python 3.11)"
echo "======================================"
echo ""

cd chemvision/backend

run_check "Backend: Install dependencies" pip install -q -e ".[dev]"
run_check "Backend: Ruff lint" ruff check .
run_check "Backend: Ruff format check" ruff format --check .
run_check "Backend: Mypy type check" mypy app
run_check "Backend: Pytest" python -m pytest -v --cov=app --cov-report=term-missing --cov-report=xml

# Frontend Tests
echo "======================================"
echo "Frontend Tests (Node 20)"
echo "======================================"
echo ""

cd ../frontend

run_check "Frontend: Install dependencies" pnpm install --silent
run_check "Frontend: ESLint" pnpm lint
run_check "Frontend: Vitest" pnpm test --run
run_check "Frontend: Build" pnpm build

# Docker Build Check
echo "======================================"
echo "Docker Build Check"
echo "======================================"
echo ""

cd ..

run_check "Docker: Backend build" docker build -t chemvision-backend:test backend
run_check "Docker: Frontend build" docker build -t chemvision-frontend:test frontend

# Summary
echo "======================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All CI checks passed!${NC}"
    echo "======================================"
    echo ""
    echo "Your code is ready for GitHub Actions CI."
    echo "Push your changes to trigger the workflow."
    exit 0
else
    echo -e "${RED}✗ $FAILED check(s) failed${NC}"
    echo "======================================"
    echo ""
    echo "Please fix the failing checks before pushing."
    exit 1
fi
