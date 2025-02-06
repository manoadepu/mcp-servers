-- Initialize MCP Servers Database
-- This file combines schemas for all MCP servers

-- Code Assistant Schema
.read /app/schema/code-assistant.sql

-- Project Management Schema
.read /app/schema/project-management.sql

-- Shared Indexes and Settings
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
