#!/bin/bash
set -e

# Get the repository root (three directories up from scripts/)
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
DEPLOY_DIR="$REPO_ROOT/packages/deploy"

# Load environment variables
if [ -f "$DEPLOY_DIR/.env.railway" ]; then
    set -a
    source "$DEPLOY_DIR/.env.railway"
    set +a
else
    echo "❌ .env.railway file not found at $DEPLOY_DIR/.env.railway"
    exit 1
fi

echo "🔍 Verifying deployment..."
echo ""

# Test API health endpoint
echo "📡 Testing API health endpoint..."
if [ -n "$API_URL" ]; then
    HEALTH_URL="${API_URL}/api/health"
    echo "Checking: $HEALTH_URL"
    
    if curl -f -s "$HEALTH_URL" | grep -q "ok"; then
        echo "✅ API health check passed"
    else
        echo "❌ API health check failed"
        exit 1
    fi
else
    echo "⚠️  API_URL not set in .env.railway"
fi

echo ""

# Test web homepage
echo "🌐 Testing web application..."
if [ -n "$WEB_URL" ]; then
    echo "Checking: $WEB_URL"
    
    if curl -f -s -o /dev/null "$WEB_URL"; then
        echo "✅ Web application is accessible"
    else
        echo "❌ Web application is not accessible"
        exit 1
    fi
else
    echo "⚠️  WEB_URL not set in .env.railway"
fi

echo ""
echo "✅ Deployment verification complete!"
echo ""
echo "You can monitor your services with:"
echo "  - yarn logs:api:follow"
echo "  - yarn logs:web:follow"
