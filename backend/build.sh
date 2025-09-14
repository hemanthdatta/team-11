#!/usr/bin/env bash

# Build script for Render deployment
echo "Starting build process..."

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create necessary directories
echo "Creating directories..."
mkdir -p uploads/profile_images

# Initialize database
echo "Initializing database..."
python init_db.py

# Create sample data (optional - comment out for production)
# echo "Creating sample data..."
# python create_sample_data.py

echo "Build completed successfully!"
