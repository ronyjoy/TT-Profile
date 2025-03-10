# Stage 1: Build the frontend (React app)
FROM node:18 as build-stage

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install all dependencies (both backend and frontend)
RUN npm install

# Copy the entire project
COPY . .

# Build the React app; this creates the "build" folder
RUN npm run build

# Stage 2: Production - setup the backend
FROM node:18

# Set the working directory in the production container
WORKDIR /app

# Copy backend files from the previous stage
COPY --from=build-stage /app/backend ./backend

# Copy the built React app into backend's public folder so Express can serve it.
RUN mkdir -p ./backend/public
COPY --from=build-stage /app/build ./backend/public

# Copy package.json (for backend dependencies)
COPY --from=build-stage /app/package.json ./

# Install only production dependencies for the backend
RUN cd backend && npm install --production

# Expose the backend port
EXPOSE 5001

# Start the backend server
CMD ["node", "backend/server.js"]
