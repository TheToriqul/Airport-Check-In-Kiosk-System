-- Migration: Add airline_name column to flights table
-- This adds support for storing airline names, using Malaysia Airlines as the default

-- Add airline_name column to flights table
ALTER TABLE flights 
ADD COLUMN IF NOT EXISTS airline_name VARCHAR(100) DEFAULT 'Malaysia Airlines';

-- Update existing flights with Malaysia Airlines
UPDATE flights 
SET airline_name = 'Malaysia Airlines' 
WHERE airline_name IS NULL OR airline_name = '';

-- Add comment to the column
COMMENT ON COLUMN flights.airline_name IS 'Name of the airline operating the flight';

