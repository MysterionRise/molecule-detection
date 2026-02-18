# ---- Build stage: install dependencies (including build tools) ----
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build-time system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY pyproject.toml ./

# Install only production dependencies into a virtual env
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir .

# ---- Runtime stage: lean production image ----
FROM python:3.11-slim AS runner

WORKDIR /app

# Copy virtual env from builder (no gcc, no dev deps)
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Create non-root user for security
RUN groupadd --gid 1000 chemvision && \
    useradd --uid 1000 --gid chemvision --shell /bin/bash --create-home chemvision

# Copy application code
COPY app ./app

# Change ownership to non-root user
RUN chown -R chemvision:chemvision /app

# Switch to non-root user
USER chemvision

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
