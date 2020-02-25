# Import the official NodeJS image; which sets up node for us in the container
FROM node:10

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

EXPOSE 8000

# Run a command with arguments
CMD node server.js
