#!/usr/bin/env bash

# Start script for Render deployment
echo "Starting FastAPI application..."

# Set environment variables for production
export PYTHONPATH="${PYTHONPATH}:/opt/render/project/src"

# Start the application with Gunicorn
exec gunicorn app.main:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:$PORT \
  --workers 2 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
