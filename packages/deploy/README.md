# Railway Deployment Package

This package centralizes every script, configuration, and reference required to deploy the Sweetly Dipped monorepo to Railway. All files live under version control, while private credentials stay outside git thanks to package-specific ignore rules.

## Prerequisites

- Node.js (LTS) + Yarn Berry (already configured in the monorepo)
- Railway account with access to create services and databases
- Docker configured for local builds (Railway builds via Dockerfiles)
- CLI authentication (handled via `railway login` when running the scripts)

## Directory Structure

```
packages/deploy/
├── configs/
│   ├── railway.json             # Project-level defaults
│   ├── api.railway.toml         # API service definition
│   └── web.railway.toml         # Web service definition
├── scripts/
│   ├── init-project.sh          # One-time CLI bootstrap
│   ├── setup-services.sh        # Creates API, web, and Postgres services
│   ├── set-vars.sh              # Syncs env vars to Railway
│   ├── deploy-api.sh            # Deploys API + migrations
│   ├── deploy-web.sh            # Deploys static web build
│   └── verify-deployment.sh     # Health-checks both services
├── .env.railway.example         # Safe placeholder template
├── .gitignore                   # Protects secrets (.env.railway, etc.)
├── package.json                 # Workspace scripts + @railway/cli dep
└── README.md                    # This file
```

## Environment Files

1. Copy the template:
   ```bash
   cp packages/deploy/.env.railway.example packages/deploy/.env.railway
   ```
2. Fill in the actual Railway service URLs **after** deploying each service.
3. Never commit `.env.railway`—it is already gitignored both in the package and at the repo root.
4. Database credentials stay managed by Railway: use `${{Postgres.DATABASE_URL}}` references instead of hardcoding secrets.

## Root Package Commands

The root `package.json` now exposes shortcut scripts that proxy to this workspace:

- `yarn deploy:init` – Bootstrap Railway CLI login + project
- `yarn deploy:setup` – Create API, web, and Postgres services
- `yarn deploy:vars` – Push environment variables to Railway services
- `yarn deploy:api` – Deploy API Docker image + migrations
- `yarn deploy:web` – Deploy frontend Docker image
- `yarn deploy:all` – Sequentially deploy API then web
- `yarn deploy:verify` – Run automated health checks
- `yarn logs:api[:follow]`, `yarn logs:web[:follow]` – Tail service logs
- `yarn railway:status` – Show overall project status
- `yarn db:migrate:prod`, `yarn db:seed:prod` – Run Prisma commands inside the API service container

## Deployment Workflow

1. **Initialize project** (one-time):
   ```bash
   yarn deploy:init
   ```
   - Installs the CLI if missing, performs `railway login`, `railway init`, and `railway link`.

2. **Provision services** (one-time per project):
   ```bash
   yarn deploy:setup
   ```
   - Creates `sweetly-dipped-api`, `sweetly-dipped-web`, and a managed Postgres database.

3. **Prepare environment variables**:
   ```bash
   cp packages/deploy/.env.railway.example packages/deploy/.env.railway
   # Fill in API_URL and WEB_URL after each deployment
   yarn deploy:vars
   ```
   - Sets Dockerfile paths, `NODE_ENV`, `PORT`, the Postgres reference, `ALLOWED_ORIGINS`, and `VITE_API_URL` (auto-appends `/api`).

4. **Deploy API**:
   ```bash
   yarn deploy:api
   ```
   - Builds via `packages/api/Dockerfile`, pushes to Railway, runs Prisma migrations, optionally seeds, and prints the public domain.

5. **Deploy web**:
   ```bash
   yarn deploy:web
   ```
   - Ensures `API_URL` exists in `.env.railway`, builds via `packages/web/Dockerfile`, deploys, and prints the public domain.

6. **Update CORS + verify**:
   ```bash
   yarn deploy:vars    # updates ALLOWED_ORIGINS with WEB_URL
   yarn deploy:verify  # hits /api/health and the web root via curl
   ```

7. **Monitor / maintain**:
   ```bash
   yarn logs:api:follow
   yarn logs:web:follow
   yarn railway:status
   ```

## Environment Variable Reference

| Variable | Service | Description |
| --- | --- | --- |
| `RAILWAY_DOCKERFILE_PATH` | API & Web | Ensures Railway builds the correct Dockerfile |
| `NODE_ENV` | API & Web | Forced to `production` |
| `PORT` | API | 3001 (matches Nest app) |
| `DATABASE_URL` | API | `${{Postgres.DATABASE_URL}}` reference provided by Railway |
| `ALLOWED_ORIGINS` | API | Populated with `WEB_URL` via `set-vars.sh` |
| `VITE_API_URL` | Web | Derived from `API_URL` with `/api` suffix |

## Common Issues

- **CLI missing**: `init-project.sh` installs dependencies automatically, but you can also run `yarn install` at the repo root.
- **Not logged in**: Run `yarn deploy:init` (or `railway login`) before any other command.
- **Variables not set**: Re-run `yarn deploy:vars` whenever API or web domains change.
- **Health checks failing**: Use `yarn logs:api:follow` or `yarn logs:web:follow` to inspect real-time logs.

## Future GitHub Automation

After validating manual deployments:
1. In the Railway dashboard, connect the GitHub repo.
2. Configure service-level auto-deploy filters:
   - API: trigger on `packages/api/**` changes.
   - Web: trigger on `packages/web/**` changes.
3. Toggle auto-deploy per service when ready.

## Troubleshooting Commands

- `railway status` – Current project/resource state.
- `railway variables --service Postgres` – Inspect managed database creds.
- `railway domain --service <service>` – Print service URL if you need to refresh `.env.railway`.

> ⚠️ **Security Reminder**: Never commit `.env.railway` or any secrets. The example file contains public placeholders only, and database credentials are injected by Railway via references.
