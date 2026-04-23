# Use Node.js as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json before installing dependencies
COPY package.json package-lock.json ./

# Force React to use version 18 before installing dependencies
RUN npm install react@18 react-dom@18 --legacy-peer-deps

# Install other dependencies
RUN npm install

# Copy the backend source code
COPY . .

# Expose the backend port
EXPOSE 5000

# Start the backend server
CMD ["node", "server.js"]
