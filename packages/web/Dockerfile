# Build stage
FROM node:20-alpine AS builder

# Enable Corepack for Yarn Berry
RUN corepack enable

WORKDIR /app

# Copy Yarn Berry files
COPY .yarn .yarn
COPY .yarnrc.yml .
COPY yarn.lock .

# Copy workspace package.json files
COPY package.json .
COPY packages/web/package.json packages/web/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/config-ts/package.json packages/config-ts/
COPY packages/config-eslint/package.json packages/config-eslint/
COPY packages/api/package.json packages/api/

# Install dependencies
RUN yarn install

# Copy shared packages source code
COPY packages/shared-types packages/shared-types
COPY packages/config-ts packages/config-ts
COPY packages/config-eslint packages/config-eslint

# Copy web source code
COPY packages/web packages/web

# Accept build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the application
WORKDIR /app/packages/web
RUN yarn build

# Production stage
FROM node:20-alpine AS production

# Install serve package globally and wget for healthchecks
RUN npm install -g serve@14.2.3 && \
    apk add --no-cache wget

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built dist directory from builder
COPY --from=builder /app/packages/web/dist ./dist

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Start the static file server
CMD ["serve", "-s", "dist", "-l", "3000", "--no-clipboard"]

