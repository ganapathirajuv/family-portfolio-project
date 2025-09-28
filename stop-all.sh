#!/bin/bash

# Family Portfolio - Stop All Services
# This script stops all three services

set -e

echo "🛑 Stopping Family Portfolio Services..."

# Stop frontend
echo "🌐 Stopping Frontend..."
cd family-portfolio-frontend
docker-compose down

# Stop backend  
echo "🖥️  Stopping Backend API..."
cd ../family-portfolio-backend
docker-compose down

# Stop database
echo "🗄️  Stopping Database..."
cd ../family-portfolio-database
docker-compose down

cd ..

echo "✅ All services stopped successfully!"

# Optionally remove network (uncomment if desired)
# echo "📡 Removing Docker network..."
# docker network rm family_network 2>/dev/null || echo "Network already removed or in use"