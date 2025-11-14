# Build stage
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Enable Corepack for Yarn Berry
RUN corepack enable

WORKDIR /app

# Copy Yarn Berry files
COPY .yarn .yarn
COPY .yarnrc.yml .
COPY yarn.lock .

# Copy workspace package.json files
COPY package.json .
COPY packages/api/package.json packages/api/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/config-ts/package.json packages/config-ts/
COPY packages/config-eslint/package.json packages/config-eslint/
COPY packages/web/package.json packages/web/

# Install dependencies
RUN yarn install

# Copy shared packages source code
COPY packages/shared-types packages/shared-types
COPY packages/config-ts packages/config-ts
COPY packages/config-eslint packages/config-eslint

# Copy API source code
COPY packages/api packages/api

# Generate Prisma client
WORKDIR /app/packages/api
ARG DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate

# Build the application
RUN yarn build

# Production stage
FROM node:20-alpine AS production

# Install OpenSSL for Prisma and wget for healthchecks
RUN apk add --no-cache openssl wget

# Enable Corepack for Yarn Berry
RUN corepack enable

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy Yarn Berry files
COPY .yarn .yarn
COPY .yarnrc.yml .
COPY yarn.lock .

# Copy workspace package.json files
COPY package.json .
COPY packages/api/package.json packages/api/
COPY packages/shared-types/package.json packages/shared-types/

# Install production dependencies only
RUN yarn workspaces focus @sweetly-dipped/api --production

# Copy built artifacts from builder
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/api/generated ./packages/api/generated
COPY --from=builder /app/packages/api/prisma ./packages/api/prisma
COPY --from=builder /app/packages/shared-types ./packages/shared-types

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "packages/api/dist/main.js"]

