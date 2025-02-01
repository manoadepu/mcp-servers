# Use a lightweight base image
FROM alpine:3.18

# Install SQLite
RUN apk add --no-cache sqlite

# Set working directory
WORKDIR /app

# Copy initialization files
COPY init-db.sql .
COPY setup-db.sh .

# Make setup script executable
RUN chmod +x setup-db.sh

# Create data directory
RUN mkdir -p /app/data

# Start command - initialize database and keep container running
CMD ["/bin/sh", "-c", "rm -f /app/data/project-assistant.db && chmod 777 /app/data && ./setup-db.sh && chmod 666 /app/data/project-assistant.db && tail -f /dev/null"]
