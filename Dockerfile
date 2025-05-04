FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies for production
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build the frontend
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run client:install
RUN npm run client:build

# Production image
FROM base AS runner
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser
USER appuser

# Copy only necessary files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/client/build ./client/build
COPY --chown=appuser:nodejs ./src ./src
COPY --chown=appuser:nodejs package.json ./

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chown -R appuser:nodejs uploads

# Expose the port
EXPOSE 3001

# Start the application
CMD ["node", "src/index.js"]