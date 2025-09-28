#!/bin/bash

# Family Portfolio - View Logs
# This script shows logs from all services

echo "📋 Family Portfolio Service Logs"
echo "================================="

if [ "$1" = "follow" ] || [ "$1" = "-f" ]; then
    echo "Following logs... Press Ctrl+C to stop"
    echo ""
    
    # Follow logs from all services
    docker-compose -f family-portfolio-database/docker-compose.yml logs -f &
    docker-compose -f family-portfolio-backend/docker-compose.yml logs -f &
    docker-compose -f family-portfolio-frontend/docker-compose.yml logs -f &
    
    wait
else
    echo "Recent logs (use './logs.sh follow' to follow):"
    echo ""
    
    echo "🗄️  DATABASE LOGS:"
    echo "=================="
    docker-compose -f family-portfolio-database/docker-compose.yml logs --tail=20
    echo ""
    
    echo "🖥️  BACKEND LOGS:"
    echo "================="  
    docker-compose -f family-portfolio-backend/docker-compose.yml logs --tail=20
    echo ""
    
    echo "🌐 FRONTEND LOGS:"
    echo "================="
    docker-compose -f family-portfolio-frontend/docker-compose.yml logs --tail=20
fi