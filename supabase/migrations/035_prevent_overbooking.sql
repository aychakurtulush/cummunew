-- 035_prevent_overbooking.sql

-- Create a function to check capacity before confirming a booking
CREATE OR REPLACE FUNCTION check_event_capacity()
RETURNS TRIGGER AS $$
DECLARE
    v_capacity INTEGER;
    v_confirmed_count INTEGER;
BEGIN
    -- Only check if the status is changing to 'confirmed'
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        
        -- Get the event capacity and current confirmed bookings
        -- FOR UPDATE locks the event row to prevent concurrent race conditions
        SELECT capacity INTO v_capacity 
        FROM events 
        WHERE id = NEW.event_id 
        FOR UPDATE;
        
        SELECT COUNT(*) INTO v_confirmed_count
        FROM bookings
        WHERE event_id = NEW.event_id AND status = 'confirmed' AND id != NEW.id;
        
        -- If confirming this would exceed capacity, raise an exception
        IF (v_confirmed_count >= v_capacity) THEN
            RAISE EXCEPTION 'Event capacity reached. Cannot confirm this booking.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS enforce_event_capacity ON bookings;
CREATE TRIGGER enforce_event_capacity
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION check_event_capacity();
