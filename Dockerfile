# Stage 1: Build the Frontend (React)
FROM node:18 as build-stage

# Set working directory at the root of the project
WORKDIR /app

# Copy the root package.json and package-lock.json
# (This is for installing shared dependencies if you have a monorepo; if not, adjust accordingly.)
COPY package.json package-lock.json ./

# Install dependencies at the root (if needed)
RUN npm install

# Copy the entire project
COPY . .

# Build the React app
# This assumes that your React app is set up with Create React App
# and that running "npm run build" from the root builds the app
RUN npm run build

# Stage 2: Setup the Production Container (Backend + Frontend)
FROM node:18

# Set working directory in production container
WORKDIR /app

# Copy the backend folder from the build stage (including its package.json and files)
COPY --from=build-stage /app/backend ./backend

# Copy the built React app from the build stage into the backend's public folder.
# This assumes that the build folder was created at /app/build in stage 1.
RUN mkdir -p ./backend/public
COPY --from=build-stage /app/build ./backend/public

# Change working directory to backend folder
WORKDIR /app/backend

# Install production dependencies from the backend's package.json
RUN npm install --production

# Expose the backend port (Express server)
EXPOSE 5001

# Start the backend server (make sure server.js is your entry point)
CMD ["node", "server.js"]
