# Gatsby style website

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/rayrafs-projects-fad582c3/v0-gatsby-style-website)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/E20CzvC57FL)

## 🐳 Docker PostgreSQL Setup (NEW!)

This project now supports running with PostgreSQL in Docker instead of Supabase!

### Development Mode (Quick Start)
```bash
./start-docker.sh
```

Or manually:
```bash
npm install --legacy-peer-deps pg @types/pg
cp .env.example .env
docker-compose up -d
```

### Production Mode
```bash
# Setup
cp .env.production.example .env.production
# IMPORTANT: Edit .env.production and change passwords!

# Build and run
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

**📚 Documentation:**
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - Overview & Assessment
- [DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md) - Quick Start Guide
- [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md) - 🚀 Production Deployment Guide
- [TESTING_PRODUCTION.md](./TESTING_PRODUCTION.md) - 🧪 Testing Production Locally
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Detailed Migration Guide
- [CODE_CHANGES.md](./CODE_CHANGES.md) - Required Code Changes
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Project Structure

---

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/rayrafs-projects-fad582c3/v0-gatsby-style-website](https://vercel.com/rayrafs-projects-fad582c3/v0-gatsby-style-website)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/E20CzvC57FL](https://v0.app/chat/projects/E20CzvC57FL)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository