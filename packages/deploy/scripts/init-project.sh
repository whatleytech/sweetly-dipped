#!/bin/bash
set -e

# Get the repository root (three directories up from scripts/)
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
PROJECT_NAME=${1:-sweetly-dipped-production}

echo "🚀 Initializing Railway project..."
echo "Repository root: $REPO_ROOT"
echo "Project name: $PROJECT_NAME"
echo ""

# Check if Railway CLI is available
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    cd "$REPO_ROOT/packages/deploy"
    yarn install
fi

# Change to repo root for Railway operations
cd "$REPO_ROOT"

# Login to Railway
echo "📝 Logging in to Railway..."
railway login

# Initialize project
echo "🏗️  Creating Railway project..."
railway init --name "$PROJECT_NAME"

# Link local directory
echo "🔗 Linking local directory to Railway project..."
railway link

echo ""
echo "✅ Railway project initialized successfully!"
echo ""
echo "Next steps:"
echo "  1. Run 'yarn deploy:setup' to create services and database"
echo "  2. Edit packages/deploy/.env.railway with your service URLs"
echo "  3. Run 'yarn deploy:vars' to set environment variables"
