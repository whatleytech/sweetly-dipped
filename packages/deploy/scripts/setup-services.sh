#!/bin/bash
set -e

# Get the repository root (three directories up from scripts/)
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"

echo "🏗️  Setting up Railway services..."
echo ""

# Change to repo root for Railway operations
cd "$REPO_ROOT"

# Create API service
echo "📦 Creating API service..."
railway add --service sweetly-dipped-api

# Create web service
echo "📦 Creating web service..."
railway add --service sweetly-dipped-web

# Add PostgreSQL
echo "🗄️  Adding PostgreSQL database..."
railway add --database postgres

echo ""
echo "✅ Services created successfully!"
echo ""
echo "Next steps:"
echo "  1. Copy packages/deploy/.env.railway.example to packages/deploy/.env.railway"
echo "  2. Deploy API: yarn deploy:api"
echo "  3. Get API URL and update .env.railway"
echo "  4. Run 'yarn deploy:vars' to set environment variables"
echo "  5. Deploy web: yarn deploy:web"
