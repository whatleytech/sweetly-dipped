#!/bin/bash
set -e

# Get the repository root (three directories up from scripts/)
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
DEPLOY_DIR="$REPO_ROOT/packages/deploy"

# Load environment variables from .env.railway
if [ -f "$DEPLOY_DIR/.env.railway" ]; then
    set -a
    source "$DEPLOY_DIR/.env.railway"
    set +a
else
    echo "⚠️  Warning: .env.railway file not found at $DEPLOY_DIR/.env.railway"
    echo "Using default values where possible."
fi

echo "🔧 Setting Railway environment variables..."
echo ""

# Change to repo root for Railway operations
cd "$REPO_ROOT"

# API Service Variables
echo "📦 Setting API service variables..."

# Non-sensitive configuration
railway variables --service sweetly-dipped-api --set "RAILWAY_DOCKERFILE_PATH=packages/api/Dockerfile" --skip-deploys
railway variables --service sweetly-dipped-api --set "NODE_ENV=production" --skip-deploys
railway variables --service sweetly-dipped-api --set "PORT=3001" --skip-deploys

# SECURITY: Database URL is a REFERENCE to Railway's managed Postgres, not a hardcoded secret
# The ${{Postgres.DATABASE_URL}} syntax tells Railway to inject the actual URL at runtime
# This means the database credentials never exist in our scripts or version control
railway variables --service sweetly-dipped-api --set "DATABASE_URL=\${{Postgres.DATABASE_PUBLIC_URL}}" --skip-deploys

# Set ALLOWED_ORIGINS if WEB_URL is provided
# NOTE: WEB_URL is a public service URL, not a secret - it's loaded from .env.railway (gitignored)
if [ -n "$WEB_URL" ]; then
    echo "Setting ALLOWED_ORIGINS to $WEB_URL"
    railway variables --service sweetly-dipped-api --set "ALLOWED_ORIGINS=$WEB_URL" --skip-deploys
fi

echo "✅ API variables set successfully"
echo ""

# Web Service Variables
echo "📦 Setting web service variables..."

# Non-sensitive configuration
railway variables --service sweetly-dipped-web --set "RAILWAY_DOCKERFILE_PATH=packages/web/Dockerfile" --skip-deploys
railway variables --service sweetly-dipped-web --set "NODE_ENV=production" --skip-deploys

# Set VITE_API_URL if API_URL is provided (ensuring /api suffix)
# NOTE: API_URL is a public service URL, not a secret - it's loaded from .env.railway (gitignored)
if [ -n "$API_URL" ]; then
    # Remove trailing slash if present
    API_URL_CLEAN="${API_URL%/}"
    
    # Add /api suffix if not already present
    if [[ "$API_URL_CLEAN" != */api ]]; then
        API_URL_CLEAN="${API_URL_CLEAN}/api"
    fi
    
    echo "Setting VITE_API_URL to $API_URL_CLEAN"
    railway variables --service sweetly-dipped-web --set "VITE_API_URL=$API_URL_CLEAN" --skip-deploys
fi

echo "✅ Web variables set successfully"
echo ""

echo "✅ All environment variables set successfully!"
