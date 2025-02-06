FROM alpine:3.18

# Install SQLite and dependencies
RUN apk add --no-cache \
    sqlite \
    sqlite-dev \
    sqlite-libs

# Create app directory
WORKDIR /app

# Copy schema files
COPY shared/database/schema /app/schema

# Copy migrations
COPY shared/database/migrations /app/migrations

# Copy setup script
COPY docker/setup-db.sh /app/setup-db.sh

# Make setup script executable
RUN chmod +x /app/setup-db.sh

# Create data directory
RUN mkdir -p /app/data

# Set environment variables
ENV DB_PATH=/app/data/mcp-servers.db

# Run setup script
CMD ["/app/setup-db.sh"]
