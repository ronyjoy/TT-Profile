# Stage 1: Build the React Frontend
FROM node:18 as frontend-build
WORKDIR /app/frontend

# Copy frontend package files and install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copy the rest of the frontend code and build the app
COPY frontend ./
RUN npm run build

# Stage 2: Prepare the Backend
FROM node:18 as backend-build
WORKDIR /app/backend

# Copy backend package files and install dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm install --production

# Copy the backend source code
COPY backend ./

# Ensure the public directory exists
RUN mkdir -p public

# Copy the built React app from the frontend stage to the backend's public directory
COPY --from=frontend-build /app/frontend/build ./public

# Stage 3: Final Production Image
FROM node:18
WORKDIR /app/backend

# Copy the prepared backend files from the previous stage
COPY --from=backend-build /app/backend .

# Set environment variable to production
ENV NODE_ENV=production

# Expose the backend port
EXPOSE 5001

# Start the backend server
CMD ["node", "server.js"]
