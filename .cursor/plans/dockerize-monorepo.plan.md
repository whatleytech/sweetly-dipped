# Dockerize Sweetly Dipped Monorepo

## Overview

Create production-ready Dockerfiles for API (NestJS + Prisma) and Web (React + Vite) packages, with docker-compose orchestration for local development. Follow Docker best practices: multi-stage builds, Alpine base images, layer caching, non-root users, and minimal image sizes.

## Implementation Steps

### 1. Create Root-Level Docker Configuration

**File: `.dockerignore`** (at repository root)

Exclude unnecessary files from Docker build context to speed up builds and reduce image size:

- node_modules, dist, coverage, .turbo (build artifacts)
- .git, .vscode, .idea (development files)  
- .env files (except .env.example)
- Test results and logs

### 2. API Environment Configuration

**File: `packages/api/.env.example`**

Document required environment variables:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Web Environment Configuration  

**File: `packages/web/.env.example`**

```env
VITE_API_URL=http://localhost:3001/api
```

### 4. API Dockerfile (Production Multi-Stage Build)

**File: `packages/api/Dockerfile`**

**Build Stage:**

- Base: node:20-alpine with OpenSSL for Prisma
- Copy Yarn Berry files (.yarn/, .yarnrc.yml, yarn.lock)
- Copy all workspace package.json files (api, shared-types, config-ts, config-eslint)
- Run `yarn workspaces focus @sweetly-dipped/api --production=false`
- Copy shared packages source code
- Copy API source code  
- Generate Prisma client: `npx prisma generate` (bypass dotenv wrapper for Docker)
- Build: `yarn build`

**Production Stage:**

- Base: fresh node:20-alpine with OpenSSL
- Create non-root user (nodejs:nodejs, uid/gid 1001)
- Copy Yarn Berry files
- Install production dependencies only: `yarn workspaces focus @sweetly-dipped/api --production`
- Copy built artifacts: dist/, generated/, prisma/, shared-types/
- Expose port 3001
- CMD: `["node", "dist/main.js"]`

**Key Features:**

- Multi-stage build reduces final image size
- Layer caching optimized (dependencies before source)
- Non-root user for security
- Custom Prisma output path handled
- No HEALTHCHECK directive (health checks managed by orchestrator)

### 5. Web Dockerfile (Production Multi-Stage with Serve)

**File: `packages/web/Dockerfile`**

**Build Stage:**

- Base: node:20-alpine
- Copy Yarn Berry files
- Copy workspace package.json files (web, shared-types, config-ts, config-eslint)  
- Run `yarn workspaces focus @sweetly-dipped/web --production=false`
- Copy shared packages and web source
- Accept `VITE_API_URL` build arg
- Build: `yarn build`

**Production Stage:**

- Base: fresh node:20-alpine
- Install serve package globally: `npm install -g serve@14.2.3`
- Create non-root user (nodejs:nodejs)
- Copy built dist/ directory from builder
- Expose port 3000
- CMD: `["serve", "-s", "dist", "-l", "3000", "--no-clipboard"]`

**Key Features:**

- Serve package provides SPA routing with `-s` flag
- Minimal Node.js runtime (~135 MB final image)
- Gzip compression and caching built-in
- Production-ready static file server
- No HEALTHCHECK directive (health checks managed by orchestrator)

### 6. Update API CORS Configuration

**File: `packages/api/src/main.ts`**

Replace `app.enableCors();` with production-ready CORS:

```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || true,
  credentials: true,
});
```

Allows comma-separated origins from environment variable, defaults to permissive for development.

### 7. Make Web API URL Configurable

**File: `packages/web/src/api/formDataApi.ts`**

Change line 3:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

**File: `packages/web/src/api/configApi.ts`**

Change line 8:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

### 8. Update Docker Compose for Full Stack

**File: `docker-compose.yml`**

Add `api` and `web` services to existing `postgres` service:

**Postgres Service:**

- Add healthcheck: `pg_isready` command
- Interval: 10s, timeout: 5s, retries: 5

**API Service:**

- Build from packages/api/Dockerfile (context: root)
- Ports: 3001:3001
- Environment: DATABASE_URL (from postgres service), PORT, NODE_ENV, ALLOWED_ORIGINS
- Depends on: postgres (with service_healthy condition)
- Health check: Node.js HTTP check on `/api/health`
- Restart policy: unless-stopped

**Web Service:**

- Build from packages/web/Dockerfile (context: root)
- Build arg: VITE_API_URL=http://localhost:3001/api
- Ports: 3000:3000  
- Depends on: api (with service_healthy condition)
- Health check: Node.js HTTP check on root path
- Restart policy: unless-stopped

**Networking:**

Services can communicate via service names (api, postgres, web)

### 9. Add Docker-Friendly Prisma Scripts

**File: `packages/api/package.json`**

Add scripts that work without dotenv wrapper:

```json
"db:generate:docker": "prisma generate",
"db:push:docker": "prisma db push",
"db:migrate:docker": "prisma migrate deploy",
"db:seed:docker": "tsx prisma/seed.ts"
```

### 10. Migration Instructions

**Approach:** Manual execution via docker exec for safety and control

**Initial setup:**

```bash
docker compose up -d postgres
docker compose run --rm api npx prisma generate
docker compose run --rm api npx prisma db push
docker compose run --rm api npx tsx prisma/seed.ts
```

**Or using the Docker-friendly scripts:**

```bash
docker compose run --rm api yarn db:generate:docker
docker compose run --rm api yarn db:push:docker
docker compose run --rm api yarn db:seed:docker
```

**After schema changes:**

```bash
docker compose run --rm api yarn db:generate:docker
docker compose run --rm api yarn db:migrate:docker
```

### 11. Testing & Validation

**Build and run:**

```bash
docker compose up --build
```

**Verify:**

- API health: http://localhost:3001/api/health
- Web app: http://localhost:3000
- API logs show database connection
- Web can fetch from API
- React Router navigation works (SPA routing)

**Test production builds locally:**

```bash
# API
docker build -f packages/api/Dockerfile -t sweetly-api .
docker run -p 3001:3001 -e DATABASE_URL="postgres://..." sweetly-api

# Web  
docker build -f packages/web/Dockerfile -t sweetly-web \
  --build-arg VITE_API_URL="http://localhost:3001/api" .
docker run -p 3000:3000 sweetly-web
```

## Docker Best Practices Applied

- Multi-stage builds for minimal image size
- Alpine Linux base images (~40 MB vs ~900 MB standard Node)
- Layer caching optimization (dependencies → source)
- Non-root users for security (UID/GID 1001)
- Health checks managed by orchestrator (docker-compose, Railway)
- .dockerignore to reduce build context
- Build arguments for environment-specific configuration
- Pinned serve version for reproducibility
- Proper handling of Yarn Berry workspaces

## Success Criteria

- `docker compose up` starts all three services
- API accessible at http://localhost:3001/api/health (returns 200)
- Web accessible at http://localhost:3000 (loads app)
- Frontend successfully calls API endpoints
- Prisma migrations can be run via docker compose run
- Production Dockerfiles ready for Railway deployment
- Images follow "build once, deploy everywhere" philosophy
