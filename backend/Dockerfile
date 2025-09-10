FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Upgrade pip and install dependencies with proper error handling
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir --timeout=120 --retries=5 -r requirements.txt

# Copy application code
COPY . .

# Create templates directory (required by your FastAPI app)
RUN mkdir -p templates

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Run the FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
