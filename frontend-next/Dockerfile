# Use Node.js 18 Alpine image
FROM node:18-alpine

# Install dependencies and curl for health checks
RUN apk add --no-cache libc6-compat curl

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files and config files first
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.js ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy source code
COPY . .

# Debug: List the structure to verify files are copied correctly
RUN echo "=== Debugging file structure ===" && \
    ls -la && \
    echo "=== src directory ===" && \
    ls -la src/ && \
    echo "=== src/lib directory ===" && \
    ls -la src/lib/ && \
    echo "=== tsconfig.json content ===" && \
    cat tsconfig.json

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4000 || exit 1

# Start the application
CMD ["npm", "start"]
