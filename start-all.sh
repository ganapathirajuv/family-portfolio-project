#!/bin/bash

# Family Portfolio - Start All Services
# This script starts all three services in the correct order

set -e

echo "🚀 Starting Family Portfolio Services..."

# Create network if it doesn't exist
if ! docker network ls | grep -q family_network; then
    echo "📡 Creating Docker network..."
    docker network create family_network
fi

# Start database first
echo "🗄️  Starting Database..."
cd family-portfolio-database
docker-compose up -d
echo "⏳ Waiting for database to be ready..."
sleep 10

# Start backend
echo "🖥️  Starting Backend API..."
cd ../family-portfolio-backend
docker-compose up -d
echo "⏳ Waiting for backend to be ready..."
sleep 5

# Start frontend
echo "🌐 Starting Frontend..."
cd ../family-portfolio-frontend  
docker-compose up -d

cd ..

echo "✅ All services started successfully!"
echo ""
echo "🌍 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo "   Database: localhost:5432"
echo ""
echo "📋 Service Status:"
docker-compose -f family-portfolio-database/docker-compose.yml ps
docker-compose -f family-portfolio-backend/docker-compose.yml ps  
docker-compose -f family-portfolio-frontend/docker-compose.yml ps