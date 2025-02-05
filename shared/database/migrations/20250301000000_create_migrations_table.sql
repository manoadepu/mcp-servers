-- Migration: Create migrations table
-- Description: Sets up the migrations tracking table
-- Timestamp: 2025-03-01 00:00:00

-- Up Migration
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    batch INTEGER NOT NULL,
    checksum TEXT NOT NULL -- SHA256 hash of migration content
);

CREATE INDEX IF NOT EXISTS idx_migrations_name ON migrations(name);
CREATE INDEX IF NOT EXISTS idx_migrations_batch ON migrations(batch);

-- Insert this migration
INSERT INTO migrations (name, batch, checksum) 
VALUES (
    '20250301000000_create_migrations_table',
    1,
    '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069' -- Example checksum
);

-- Down Migration
DROP INDEX IF EXISTS idx_migrations_batch;
DROP INDEX IF EXISTS idx_migrations_name;
DROP TABLE IF EXISTS migrations;
