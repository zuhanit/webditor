FROM --platform=linux/amd64 python:3.11-slim

# Install uv
RUN pip install uv

WORKDIR /app

# Copy local dependencies (relative to project root)
COPY eudplib-0.80.6-cp310-abi3-linux_x86_64.whl /eudplib-0.80.6-cp310-abi3-linux_x86_64.whl
COPY wengine/ /wengine/

# Copy backend source
COPY backend/ /app/

# Install dependencies
RUN uv sync --no-dev

# Create required runtime directories
RUN mkdir -p /app/output /app/logs

EXPOSE 8000

CMD ["sh", "-c", "uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
