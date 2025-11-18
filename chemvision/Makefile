.PHONY: help dev test fmt lint build clean install

help:
	@echo "ChemVision Development Commands"
	@echo "================================"
	@echo "make dev        - Start development environment with Docker Compose"
	@echo "make test       - Run all tests (backend + frontend)"
	@echo "make fmt        - Format all code"
	@echo "make lint       - Lint all code"
	@echo "make build      - Build Docker images"
	@echo "make clean      - Clean up containers and build artifacts"
	@echo "make install    - Install dependencies locally"

dev:
	docker-compose -f ops/docker-compose.yml up --build

test:
	@echo "Running backend tests..."
	cd backend && pytest -v --cov=app --cov-report=term-missing
	@echo "\nRunning frontend tests..."
	cd frontend && pnpm test

fmt:
	@echo "Formatting backend..."
	cd backend && ruff format .
	@echo "Formatting frontend..."
	cd frontend && pnpm format

lint:
	@echo "Linting backend..."
	cd backend && ruff check . && mypy app
	@echo "Linting frontend..."
	cd frontend && pnpm lint

build:
	docker-compose -f ops/docker-compose.yml build

clean:
	docker-compose -f ops/docker-compose.yml down -v
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf backend/htmlcov backend/.coverage
	rm -rf frontend/.next frontend/out

install:
	@echo "Installing backend dependencies..."
	cd backend && pip install -e ".[dev]"
	@echo "Installing frontend dependencies..."
	cd frontend && pnpm install
