-- Family Portfolio Database Initialization
-- Create database and user if they don't exist

-- This script runs automatically when the PostgreSQL container starts
-- The main database and user are created by environment variables

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';

-- Log successful initialization
SELECT 'Family Portfolio database initialized successfully!' as message;
