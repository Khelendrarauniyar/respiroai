# Frontend Dockerfile
FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Serve the built application
CMD ["serve", "-s", "build", "-l", "3000"]
