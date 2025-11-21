-- Migration: Add unique constraint to ensure only one baggage record per booking
-- This ensures that each booking_id can only have ONE baggage record
-- The baggage_count field in that single record can represent multiple bags

-- First, clean up any duplicate records (keep the most recent one per booking)
DO $$
DECLARE
    booking_record RECORD;
    duplicate_count INTEGER;
BEGIN
    -- For each booking with multiple records, delete all except the most recent
    FOR booking_record IN 
        SELECT booking_id, COUNT(*) as cnt
        FROM baggage_records
        GROUP BY booking_id
        HAVING COUNT(*) > 1
    LOOP
        -- Delete all records except the one with the latest check_in_time
        DELETE FROM baggage_records
        WHERE booking_id = booking_record.booking_id
        AND baggage_id NOT IN (
            SELECT baggage_id
            FROM baggage_records
            WHERE booking_id = booking_record.booking_id
            ORDER BY check_in_time DESC
            LIMIT 1
        );
        
        RAISE NOTICE 'Cleaned up duplicate records for booking_id: %', booking_record.booking_id;
    END LOOP;
END $$;

-- Add unique constraint on booking_id to prevent future duplicates (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'baggage_records' 
        AND constraint_name = 'baggage_records_booking_id_unique'
    ) THEN
        ALTER TABLE baggage_records 
        ADD CONSTRAINT baggage_records_booking_id_unique UNIQUE (booking_id);
        
        -- Add comment to clarify the constraint
        COMMENT ON CONSTRAINT baggage_records_booking_id_unique ON baggage_records IS 
        'Ensures only one baggage record per booking. The baggage_count field in that record can represent multiple bags.';
    END IF;
END $$;

