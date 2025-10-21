# Use Node.js 22 (matching local environment)
FROM node:22-slim

# Install pnpm
RUN npm install -g pnpm@latest

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Build the application
RUN pnpm build

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]

