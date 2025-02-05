-- Initialize MCP Servers Database
-- This file combines schemas for all MCP servers

-- Code Assistant Schema
.read code-assistant.sql

-- Project Management Schema
.read project-management.sql

-- Shared Indexes and Settings
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
