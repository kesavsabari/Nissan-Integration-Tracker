FROM node:18-slim

# Create app directory
WORKDIR /app

# The project is in the 'Nissan Tracker' subdirectory in the repo
# Copy the application files
COPY "Nissan Tracker/" .

# Create a data directory for persistent storage
# and move the initial JSON data files there
RUN mkdir -p /app/data && \
    mv *.json /app/data/ || true

# Set Environment Variables
ENV PORT=5001
ENV DATA_DIR=/app/data

# Expose the port
EXPOSE 5001

# Command to run the app
CMD [ "node", "server.js" ]
