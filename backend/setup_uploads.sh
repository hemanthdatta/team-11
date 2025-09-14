#!/bin/bash
# setup_uploads.sh - Create directories for profile uploads

# Create main uploads directory
mkdir -p uploads/profile_images

# Set permissions (adjust as needed)
chmod -R 775 uploads

echo "Uploads directory structure created successfully"
