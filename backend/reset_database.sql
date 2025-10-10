-- Script to reset the database for Django custom user model
-- Run this in PostgreSQL to reset the database

-- Connect to default database (usually postgres)
-- Then drop and recreate the freelance_marketplace_db

DROP DATABASE IF EXISTS freelance_marketplace_db;
CREATE DATABASE freelance_marketplace_db;

-- Grant permissions to postgres user
GRANT ALL PRIVILEGES ON DATABASE freelance_marketplace_db TO postgres;