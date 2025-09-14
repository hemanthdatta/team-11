#!/bin/bash

# Run from the backend directory
cd "$(dirname "$0")"

echo "Running database migration..."
python -c "from app.init_db import init_db; init_db()"

echo "Generating fake customer interaction data..."
python create_fake_interactions.py

echo "Setup complete!"
