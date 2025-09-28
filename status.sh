#!/bin/bash

# Family Portfolio - Status Check
# This script shows the status of all services

echo "📊 Family Portfolio Service Status"
echo "=================================="

echo ""
echo "🗄️  DATABASE:"
echo "=============="
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q family_portfolio_database; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep family_portfolio_database
    echo "✅ Database is running"
else
    echo "❌ Database is not running"
fi

echo ""
echo "🖥️  BACKEND:"
echo "============"
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q family_portfolio_backend; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep family_portfolio_backend
    echo "✅ Backend is running"
    
    # Test backend health
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend health check passed"
    else
        echo "⚠️  Backend health check failed"
    fi
else
    echo "❌ Backend is not running"
fi

echo ""
echo "🌐 FRONTEND:"
echo "============"
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q family_portfolio_frontend; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep family_portfolio_frontend
    echo "✅ Frontend is running"
    
    # Test frontend health
    if curl -s -I http://localhost:3000 | grep -q "200 OK"; then
        echo "✅ Frontend health check passed"
    else
        echo "⚠️  Frontend health check failed"
    fi
else
    echo "❌ Frontend is not running"
fi

echo ""
echo "📡 NETWORK:"
echo "==========="
if docker network ls | grep -q family_network; then
    echo "✅ Docker network 'family_network' exists"
else
    echo "❌ Docker network 'family_network' missing"
fi

echo ""
echo "🌍 APPLICATION URLS:"
echo "==================="
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:8000"
echo "API Docs:  http://localhost:8000/docs"
echo "Database:  localhost:5432"