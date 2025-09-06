# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy TypeScript configuration files
COPY tsconfig.json tsconfig.build.json ./

# Copy source code
COPY src ./src

# Build application
RUN pnpm run build

# Remove dev dependencies to reduce size
RUN pnpm prune --prod

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy package.json for reference
COPY package.json ./

# Copy production dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start application using Node.js directly
CMD ["node", "dist/main.js"]
