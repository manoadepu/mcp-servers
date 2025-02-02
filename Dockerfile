FROM alpine:latest

# Install SQLite and dependencies
RUN apk add --no-cache sqlite sqlite-dev

# Create app directory
WORKDIR /app

# Copy initialization files
COPY init-db.sql /app/
COPY setup-db.sh /app/

# Make setup script executable
RUN chmod +x /app/setup-db.sh

# Run setup script
CMD ["/app/setup-db.sh"]
