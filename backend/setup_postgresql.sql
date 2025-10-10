-- PostgreSQL Database Setup for FreelanceMarketplace
-- Run these commands in PostgreSQL (psql) or pgAdmin

-- Create the database
CREATE DATABASE freelance_marketplace_db;

-- Create user if doesn't exist (or use existing postgres user)
-- CREATE USER postgres WITH PASSWORD 'qwerty';

-- Grant all privileges to the user
GRANT ALL PRIVILEGES ON DATABASE freelance_marketplace_db TO postgres;

-- Connect to the database and grant schema privileges
\c freelance_marketplace_db;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Check if database was created successfully
\l