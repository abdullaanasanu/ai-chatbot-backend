# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
EXPOSE 3001

# Run the built app
CMD ["node", "dist/app.js"]
