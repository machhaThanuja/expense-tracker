# Base image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Set environment variables (should be overridden at runtime)
ENV NODE_ENV=production
ENV SERVER_PORT=5000
ENV DB_HOST=db
ENV DB_USER=root
ENV DB_PASSWORD=password
ENV DB_NAME=expense_tracker
ENV DB_PORT=3306

# Expose port
EXPOSE 5000
EXPOSE 3000

# Start script (depends on environment)
CMD ["npm", "run", "dev"]