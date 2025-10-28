#!/bin/bash

# Quick Start Script for Docker PostgreSQL Migration
# This script sets up the development environment

set -e

echo "🚀 Starting Gatsby Corporate Event Docker Setup..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
if [ -f "package-lock.json" ]; then
    npm install --legacy-peer-deps pg @types/pg
else
    npm install --legacy-peer-deps
fi

echo ""
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if PostgreSQL is ready
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U gatsby_user -d gatsby_db > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ PostgreSQL failed to start"
        docker-compose logs postgres
        exit 1
    fi
    echo "   Waiting... ($i/30)"
    sleep 2
done

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🌐 Application URL: http://localhost:3000"
echo "🗄️  PostgreSQL: localhost:5432"
echo "   Database: gatsby_db"
echo "   User: gatsby_user"
echo "   Password: gatsby_password"
echo ""
echo "📝 Useful commands:"
echo "   View logs:       docker-compose logs -f"
echo "   Stop services:   docker-compose down"
echo "   Restart:         docker-compose restart"
echo "   Connect to DB:   docker-compose exec postgres psql -U gatsby_user -d gatsby_db"
echo ""
echo "📖 For more information, see MIGRATION_GUIDE.md"
