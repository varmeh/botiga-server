# Use the specific Node.js version
FROM node:14.16

# Set the working directory
WORKDIR /usr/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install project dependencies
RUN npm install --production

# Copy the rest of the project files
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD npm start
