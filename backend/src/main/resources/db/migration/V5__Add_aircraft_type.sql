-- Migration: Add aircraft_type column to flights table
-- This adds support for storing aircraft model information (e.g., Boeing 787, Airbus A380)

-- Add aircraft_type column to flights table
ALTER TABLE flights 
ADD COLUMN IF NOT EXISTS aircraft_type VARCHAR(50);

-- Update existing flights with appropriate aircraft types based on route and capacity
-- FL001: Short haul (KUL-SIN) - Boeing 737-800 (150 seats)
-- FL002: Medium haul (KUL-BKK) - Airbus A320 (200 seats)
-- FL003: Medium-long haul (KUL-DXB) - Boeing 787-9 Dreamliner (180 seats)
-- FL004: Long haul (KUL-LHR) - Airbus A350-900 (300 seats)
UPDATE flights 
SET aircraft_type = CASE 
    WHEN flight_id = 'FL001' THEN 'Boeing 737-800'
    WHEN flight_id = 'FL002' THEN 'Airbus A320'
    WHEN flight_id = 'FL003' THEN 'Boeing 787-9 Dreamliner'
    WHEN flight_id = 'FL004' THEN 'Airbus A350-900'
    ELSE 'Boeing 737-800'
END
WHERE aircraft_type IS NULL;

-- Add comment to the column
COMMENT ON COLUMN flights.aircraft_type IS 'Aircraft model type (e.g., Boeing 787-9, Airbus A380)';

