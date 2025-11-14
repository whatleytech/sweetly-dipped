# Railway Production Deployment Plan

## Overview

Deploy the Sweetly Dipped monorepo to Railway using a dedicated deployment package with version-controlled scripts and configurations. This approach uses manual CLI control initially, with managed PostgreSQL for the backend and separate services for API and frontend.

## Phase 1: Create Deployment Package

Create a dedicated `packages/deploy` package containing all Railway deployment scripts, configurations, and documentation.

### Create package structure

```bash
cd /Users/epwhatley/WhatleyTech/sweetly-dipped
mkdir -p packages/deploy/{configs,scripts}
```

### Add `.env.railway` to root `.gitignore`

Ensure the root `.gitignore` includes (add if not already present):

```gitignore
# Railway deployment secrets (never commit these)
packages/deploy/.env.railway
packages/deploy/.env.railway.local
packages/deploy/.env.*.local
.railway

# Local environment files with secrets
*.local
.env.local
.env.*.local
```

**CRITICAL**: This prevents accidental commits of sensitive deployment URLs and credentials.

### Create `packages/deploy/package.json`

```json
{
  "name": "@sweetly-dipped/deploy",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "description": "Railway deployment scripts and configuration",
  "scripts": {
    "init": "./scripts/init-project.sh",
    "setup:services": "./scripts/setup-services.sh",
    "setup:db": "railway add --database postgresql",
    "vars:set": "./scripts/set-vars.sh",
    "deploy:api": "./scripts/deploy-api.sh",
    "deploy:web": "./scripts/deploy-web.sh",
    "deploy:all": "yarn deploy:api && yarn deploy:web",
    "verify": "./scripts/verify-deployment.sh",
    "logs:api": "railway logs --service sweetly-dipped-api",
    "logs:web": "railway logs --service sweetly-dipped-web",
    "logs:api:follow": "railway logs --service sweetly-dipped-api --follow",
    "logs:web:follow": "railway logs --service sweetly-dipped-web --follow",
    "status": "railway status",
    "db:migrate": "railway run --service sweetly-dipped-api yarn db:migrate:docker",
    "db:generate": "railway run --service sweetly-dipped-api yarn db:generate:docker",
    "db:seed": "railway run --service sweetly-dipped-api yarn db:seed:docker"
  },
  "devDependencies": {
    "@railway/cli": "^3.0.0"
  }
}
```

### Create `packages/deploy/.env.railway.example`

**IMPORTANT**: This is a template file with placeholders only. Never commit actual URLs or secrets.

```bash
# Railway Project Configuration
# Copy this file to .env.railway and fill in your actual values after deployment
# 
# SECURITY NOTE: .env.railway is gitignored and should NEVER be committed
# These are PLACEHOLDERS - replace with your actual Railway URLs after deployment

# API Service Configuration (replace with actual Railway URL after API deployment)
API_URL=https://your-api-service.up.railway.app

# Web Service Configuration (replace with actual Railway URL after web deployment)
WEB_URL=https://your-web-service.up.railway.app

# Environment (these values are safe to keep as-is)
NODE_ENV=production
PORT=3001

# DATABASE_URL is NOT stored here - it's referenced via Railway's ${{Postgres.DATABASE_URL}}
# NEVER hardcode database credentials in any file
```

### Create `packages/deploy/.gitignore`

**CRITICAL**: This prevents secrets from being committed to version control.

```
# Environment files with actual secrets/URLs
.env.railway
.env.railway.local
.env.*.local

# Railway CLI state (if it generates any)
.railway
```

### Create `packages/deploy/configs/railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Create `packages/deploy/configs/api.railway.toml`

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "packages/api/Dockerfile"

[deploy]
startCommand = "node packages/api/dist/main.js"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Create `packages/deploy/configs/web.railway.toml`

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "packages/web/Dockerfile"

[deploy]
startCommand = "serve -s dist -l 3000 --no-clipboard"
healthcheckPath = "/"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Create `packages/deploy/scripts/init-project.sh`

```bash
#!/bin/bash
set -e

# Get the repository root (two directories up from scripts/)
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "🚀 Initializing Railway project..."
echo "Repository root: $REPO_ROOT"
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
railway init

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
```

### Create `packages/deploy/scripts/setup-services.sh`

```bash
#!/bin/bash
set -e

# Get the repository root (two directories up from scripts/)
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "🏗️  Setting up Railway services..."
echo ""

# Change to repo root for Railway operations
cd "$REPO_ROOT"

# Create API service
echo "📦 Creating API service..."
railway service create sweetly-dipped-api

# Create web service
echo "📦 Creating web service..."
railway service create sweetly-dipped-web

# Add PostgreSQL
echo "🗄️  Adding PostgreSQL database..."
railway add --database postgresql

echo ""
echo "✅ Services created successfully!"
echo ""
echo "Next steps:"
echo "  1. Copy packages/deploy/.env.railway.example to packages/deploy/.env.railway"
echo "  2. Deploy API: yarn deploy:api"
echo "  3. Get API URL and update .env.railway"
echo "  4. Run 'yarn deploy:vars' to set environment variables"
echo "  5. Deploy web: yarn deploy:web"
```

### Create `packages/deploy/scripts/set-vars.sh`

```bash
#!/bin/bash
set -e

# Get the repository root (two directories up from scripts/)
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
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
railway variables set RAILWAY_DOCKERFILE_PATH=packages/api/Dockerfile --service sweetly-dipped-api
railway variables set NODE_ENV=production --service sweetly-dipped-api
railway variables set PORT=3001 --service sweetly-dipped-api

# SECURITY: Database URL is a REFERENCE to Railway's managed Postgres, not a hardcoded secret
# The ${{Postgres.DATABASE_URL}} syntax tells Railway to inject the actual URL at runtime
# This means the database credentials never exist in our scripts or version control
railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}' --service sweetly-dipped-api

# Set ALLOWED_ORIGINS if WEB_URL is provided
# NOTE: WEB_URL is a public service URL, not a secret - it's loaded from .env.railway (gitignored)
if [ -n "$WEB_URL" ]; then
    echo "Setting ALLOWED_ORIGINS to $WEB_URL"
    railway variables set ALLOWED_ORIGINS="$WEB_URL" --service sweetly-dipped-api
fi

echo "✅ API variables set successfully"
echo ""

# Web Service Variables
echo "📦 Setting web service variables..."

# Non-sensitive configuration
railway variables set RAILWAY_DOCKERFILE_PATH=packages/web/Dockerfile --service sweetly-dipped-web
railway variables set NODE_ENV=production --service sweetly-dipped-web

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
    railway variables set VITE_API_URL="$API_URL_CLEAN" --service sweetly-dipped-web
fi

echo "✅ Web variables set successfully"
echo ""

echo "✅ All environment variables set successfully!"
```

### Create `packages/deploy/scripts/deploy-api.sh`

```bash
#!/bin/bash
set -e

# Get the repository root (two directories up from scripts/)
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "🚀 Deploying API service..."
echo ""

# Change to repo root for Railway operations
cd "$REPO_ROOT"

# Deploy API
echo "📦 Building and deploying API..."
railway up --service sweetly-dipped-api

echo "⏳ Waiting for deployment to complete..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
railway run --service sweetly-dipped-api yarn db:migrate:docker

# Ask about seeding
read -p "Do you want to seed the database? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    railway run --service sweetly-dipped-api yarn db:seed:docker
fi

# Get domain
echo ""
echo "🌐 Getting API URL..."
railway domain --service sweetly-dipped-api

echo ""
echo "✅ API deployment complete!"
echo ""
echo "Next steps:"
echo "  1. Copy the API URL above"
echo "  2. Update packages/deploy/.env.railway with API_URL"
echo "  3. Run 'yarn deploy:vars' to update environment variables"
echo "  4. Run 'yarn deploy:web' to deploy the web service"
```

### Create `packages/deploy/scripts/deploy-web.sh`

```bash
#!/bin/bash
set -e

# Get the repository root (two directories up from scripts/)
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
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
```

### Create `packages/deploy/scripts/verify-deployment.sh`

```bash
#!/bin/bash
set -e

# Get the repository root (two directories up from scripts/)
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
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
```

### Make scripts executable

```bash
chmod +x packages/deploy/scripts/*.sh
```

### Create `packages/deploy/README.md`

Create comprehensive documentation covering:

- Prerequisites (Node.js, Yarn, Railway account)
- Initial setup steps
- Deployment workflow
- Environment variables reference
- Common commands
- Troubleshooting guide
- How to enable GitHub auto-deploy later

## Phase 2: Install Dependencies & Update Root Package

### Install deploy package dependencies

```bash
cd packages/deploy
yarn install
```

### Update root `package.json`

Add deployment scripts to the root package.json:

```json
{
  "scripts": {
    "deploy:init": "yarn workspace @sweetly-dipped/deploy init",
    "deploy:setup": "yarn workspace @sweetly-dipped/deploy setup:services",
    "deploy:vars": "yarn workspace @sweetly-dipped/deploy vars:set",
    "deploy:api": "yarn workspace @sweetly-dipped/deploy deploy:api",
    "deploy:web": "yarn workspace @sweetly-dipped/deploy deploy:web",
    "deploy:all": "yarn workspace @sweetly-dipped/deploy deploy:all",
    "deploy:verify": "yarn workspace @sweetly-dipped/deploy verify",
    "logs:api": "yarn workspace @sweetly-dipped/deploy logs:api",
    "logs:web": "yarn workspace @sweetly-dipped/deploy logs:web",
    "logs:api:follow": "yarn workspace @sweetly-dipped/deploy logs:api:follow",
    "logs:web:follow": "yarn workspace @sweetly-dipped/deploy logs:web:follow",
    "railway:status": "yarn workspace @sweetly-dipped/deploy status",
    "db:migrate:prod": "yarn workspace @sweetly-dipped/deploy db:migrate",
    "db:seed:prod": "yarn workspace @sweetly-dipped/deploy db:seed"
  }
}
```

## Phase 3: Initialize Railway Project

### Run initialization script

```bash
yarn deploy:init
```

This script will:

1. Check if Railway CLI is installed (uses the local package version)
2. Run `railway login` to authenticate
3. Run `railway init` to create a new project

   - Select "Empty Project"
   - Name it "sweetly-dipped-production"
   - Do NOT link to GitHub yet (manual deployment mode)

4. Run `railway link` to link local directory

## Phase 4: Setup Services and Database

### Create services and database

```bash
yarn deploy:setup
```

This script will:

1. Create `sweetly-dipped-api` service
2. Create `sweetly-dipped-web` service
3. Add PostgreSQL database (will be named `Postgres` by default)

### Verify database connection

```bash
railway variables --service Postgres
```

Should show `DATABASE_URL` environment variable.

### Create environment file

```bash
cp packages/deploy/.env.railway.example packages/deploy/.env.railway
```

**SECURITY NOTES**:

- `.env.railway` is gitignored and will never be committed
- Don't fill in URLs yet - we'll get them after deployment
- Never commit `.env.railway` or any file containing actual service URLs
- Database credentials are managed by Railway and never stored in files

## Phase 5: Deploy API Service

### Set initial API environment variables

```bash
yarn deploy:vars
```

This sets basic API variables (RAILWAY_DOCKERFILE_PATH, NODE_ENV, PORT, DATABASE_URL).

### Deploy API

```bash
yarn deploy:api
```

This script will:

1. Build and deploy the API using Docker (Prisma client is generated during build)
2. Wait for deployment to complete
3. Run database migrations
4. Optionally seed the database (you'll be prompted)
5. Display the API URL

### Update environment file

Copy the API URL from the deployment output and add it to `packages/deploy/.env.railway`:

```bash
# Replace with your actual Railway-generated URL
API_URL=https://sweetly-dipped-api-production-xxxxx.up.railway.app
```

**SECURITY REMINDER**:

- `.env.railway` is gitignored
- Never commit this file or share these URLs publicly
- The API uses `/api` as a global prefix for all endpoints

## Phase 6: Deploy Web Service

### Update environment variables with API URL

```bash
yarn deploy:vars
```

This will set the `VITE_API_URL` for the web service (automatically adding the `/api` suffix).

### Deploy web service

```bash
yarn deploy:web
```

This script will:

1. Check that API_URL is set in .env.railway
2. Build and deploy the web service using Docker
3. Wait for deployment to complete
4. Display the web URL

### Update CORS configuration

Copy the web URL and add it to `packages/deploy/.env.railway`:

```bash
# Replace with your actual Railway-generated URL
WEB_URL=https://sweetly-dipped-web-production-xxxxx.up.railway.app
```

**SECURITY REMINDER**: Never commit `.env.railway` - it's gitignored for security.

Then update the API's ALLOWED_ORIGINS:

```bash
yarn deploy:vars
```

This will set the `ALLOWED_ORIGINS` environment variable for the API to allow requests from your web domain.

**Note**: The API's CORS configuration (in `packages/api/src/main.ts`) uses `ALLOWED_ORIGINS` with comma-separated values:

```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || true,
  credentials: true,
});
```

For multiple origins (e.g., staging + production), use comma-separated values in `.env.railway`:

```bash
WEB_URL=https://web1.railway.app,https://web2.railway.app
```

## Phase 7: Verification & Testing

### Run automated verification

```bash
yarn deploy:verify
```

This script will:

1. Test API health endpoint at `https://[api-url]/api/health`
2. Test web application homepage
3. Report success or failure

### Manual testing

Open `https://[your-web-url].up.railway.app` in browser and verify:

- Application loads
- Can navigate between pages
- Forms can communicate with API
- No CORS errors in console

### Monitor logs

Watch API logs:

```bash
yarn logs:api:follow
```

Watch web logs:

```bash
yarn logs:web:follow
```

Check service status:

```bash
yarn railway:status
```

## Complete Deployment Workflow

For reference, here's the complete workflow from start to finish:

```bash
# One-time setup
yarn deploy:init                  # Initialize Railway project
yarn deploy:setup                 # Create services and database
cp packages/deploy/.env.railway.example packages/deploy/.env.railway

# Deploy API
yarn deploy:vars                  # Set initial variables
yarn deploy:api                   # Deploy API + migrations
# Copy API URL to .env.railway

# Deploy Web
yarn deploy:vars                  # Update with API URL
yarn deploy:web                   # Deploy web
# Copy Web URL to .env.railway

# Final setup
yarn deploy:vars                  # Update CORS with Web URL
yarn deploy:verify                # Test both services

# Monitor
yarn logs:api:follow              # Watch API logs
yarn logs:web:follow              # Watch web logs
```

## Redeployment

For subsequent deployments after code changes:

```bash
# Deploy both services
yarn deploy:all

# Or deploy individually
yarn deploy:api
yarn deploy:web

# Verify
yarn deploy:verify
```

## Database Operations

Run migrations in production:

```bash
yarn db:migrate:prod
```

Seed the database:

```bash
yarn db:seed:prod
```

## Future: Enable GitHub Integration

Once comfortable with manual deployments, enable auto-deploy:

1. In Railway dashboard → Project Settings → Integrations
2. Connect GitHub repository
3. Configure deployment triggers:

   - API service: Deploy on changes to `packages/api/**` in main branch
   - Web service: Deploy on changes to `packages/web/**` in main branch

4. Enable/disable per-service in service settings

## Key Files Created

- `packages/deploy/package.json` - Deployment scripts and Railway CLI dependency
- `packages/deploy/.env.railway.example` - Environment variable template (safe placeholders only)
- `packages/deploy/.env.railway` - Actual environment variables (gitignored, never committed)
- `packages/deploy/.gitignore` - Ignore sensitive files
- `packages/deploy/configs/railway.json` - Project-level Railway config
- `packages/deploy/configs/api.railway.toml` - API service configuration
- `packages/deploy/configs/web.railway.toml` - Web service configuration
- `packages/deploy/scripts/init-project.sh` - Initialize Railway project
- `packages/deploy/scripts/setup-services.sh` - Create services and database
- `packages/deploy/scripts/set-vars.sh` - Set environment variables from .env.railway
- `packages/deploy/scripts/deploy-api.sh` - Deploy API with migrations
- `packages/deploy/scripts/deploy-web.sh` - Deploy web service
- `packages/deploy/scripts/verify-deployment.sh` - Test both services
- `packages/deploy/README.md` - Deployment documentation
- Root `package.json` - Updated with deployment command shortcuts

## Important Notes

### Security

- **Never commit secrets**: `.env.railway` is gitignored and must never be committed
- **Database credentials**: Managed by Railway via `${{Postgres.DATABASE_URL}}` reference, never hardcoded
- **Service URLs**: Stored only in `.env.railway` (gitignored), not in version control
- **Template file**: `.env.railway.example` contains only safe placeholders, no actual values
- **Railway variable references**: Syntax like `${{Postgres.DATABASE_URL}}` tells Railway to inject values at runtime

### Technical

- **Railway CLI as dependency**: The `@railway/cli` is installed as a dev dependency in the deploy package, not globally
- **API uses `/api` as a global prefix** for all endpoints (configured in `packages/api/src/main.ts`)
- **Automatic /api suffix**: The `set-vars.sh` script automatically adds `/api` to the API URL when setting `VITE_API_URL`
- **Prisma client generation**: The Prisma client is generated during Docker build, not at runtime
- **Database migrations**: Migrations use the already-generated Prisma client from the Docker image
- **Deployment order**: API must be deployed before Web (Web needs API URL with `/api` suffix)
- **Railway certificates**: Railway provides automatic SSL certificates for all domains
- **Service scaling**: Services can be scaled/replicated independently later
- **PostgreSQL service name**: Railway names the PostgreSQL service as `Postgres` (not `postgresql`)
- **CORS configuration**: Use `ALLOWED_ORIGINS` (not `CORS_ORIGIN`) with comma-separated values for multiple domains
- **Version control**: All deployment logic is tracked in git, sensitive values are gitignored

### To-dos

- [ ] Create packages/deploy directory structure
- [ ] Create all configuration files (package.json, railway configs, .env.railway.example)
- [ ] Create all deployment scripts (init, setup, deploy, verify)
- [ ] Make bash scripts executable
- [ ] Update root package.json with deployment commands
- [ ] Install deploy package dependencies
- [ ] Initialize Railway project with yarn deploy:init
- [ ] Create services and database with yarn deploy:setup
- [ ] Copy .env.railway.example to .env.railway
- [ ] Deploy API service and run migrations
- [ ] Update .env.railway with API URL
- [ ] Deploy web service
- [ ] Update .env.railway with web URL and configure CORS
- [ ] Verify deployment with yarn deploy:verify