#!/bin/bash
set -e

# Get the repository root (three directories up from scripts/)
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
DEPLOY_DIR="$REPO_ROOT/packages/deploy"

echo "🚀 Deploying web service..."
echo ""

# Check if .env.railway exists and has API_URL
if [ ! -f "$DEPLOY_DIR/.env.railway" ]; then
    echo "❌ .env.railway file not found at $DEPLOY_DIR/.env.railway"
    echo "Please create it from .env.railway.example and add your API_URL"
    exit 1
fi

if ! grep -q "API_URL=" "$DEPLOY_DIR/.env.railway"; then
    echo "⚠️  Warning: API_URL not set in .env.railway"
    echo "The web app may not be able to connect to the API"
fi

# Change to repo root for Railway operations
cd "$REPO_ROOT"

# Deploy web
echo "📦 Building and deploying web service..."
railway up --service sweetly-dipped-web

echo "⏳ Waiting for deployment to complete..."
sleep 10

# Get domain
echo ""
echo "🌐 Getting web URL..."
railway domain --service sweetly-dipped-web

echo ""
echo "✅ Web deployment complete!"
echo ""
echo "Next steps:"
echo "  1. Copy the web URL above"
echo "  2. Update packages/deploy/.env.railway with WEB_URL"
echo "  3. Run 'yarn deploy:vars' to update ALLOWED_ORIGINS for API"
echo "  4. Run 'yarn deploy:verify' to test both services"
