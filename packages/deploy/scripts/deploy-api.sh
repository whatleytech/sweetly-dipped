#!/bin/bash
set -e

# Get the repository root (three directories up from scripts/)
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
SERVICE_NAME="sweetly-dipped-api"
SLEEP_SECONDS=60

echo "🚀 Deploying API service..."
echo ""

# Change to repo root for Railway operations
cd "$REPO_ROOT"

# Deploy API
echo "📦 Building and deploying API..."
railway up --service "$SERVICE_NAME"
echo "⏳ Waiting ${SLEEP_SECONDS}s to allow Railway to finish deploying..."
sleep "$SLEEP_SECONDS"

echo "📊 Running database migrations..."
railway run --service "$SERVICE_NAME" yarn db:migrate:docker

# Ask about seeding (skip prompt when non-interactive)
if [ -t 0 ]; then
    read -p "Do you want to seed the database? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🌱 Seeding database..."
        railway run --service "$SERVICE_NAME" yarn db:seed:docker
    fi
else
    echo "Skipping seed prompt (non-interactive shell). Run 'yarn workspace @sweetly-dipped/deploy db:seed' later if needed."
fi

# Get domain
echo ""
echo "🌐 Getting API URL..."
railway domain --service "$SERVICE_NAME"

echo ""
echo "✅ API deployment complete!"
echo ""
echo "Next steps:"
echo "  1. Copy the API URL above"
echo "  2. Update packages/deploy/.env.railway with API_URL"
echo "  3. Run 'yarn deploy:vars' to update environment variables"
echo "  4. Run 'yarn deploy:web' to deploy the web service"
