-- 053_trust_notifications.sql
-- Active alerting for reports and low ratings

-- 1. Add admin_flagged to events for easier oversight
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS admin_flagged BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_flagged_reason TEXT;

-- 2. Function to notify admins of a new report
CREATE OR REPLACE FUNCTION notify_admin_of_report()
RETURNS TRIGGER AS $$
BEGIN
    -- We assume there's a way to identify admin users, or we just broadcast to a site-wide notification channel.
    -- For now, we'll look for any profile with a (future) 'admin' role or just insert a generic 'admin_alert'
    -- that the Admin Panel can specifically query.
    
    INSERT INTO notifications (user_id, type, title, content)
    VALUES (
        NULL, -- NULL user_id marks it as a system-wide admin alert
        'admin_alert',
        'New Report Received',
        'A report has been submitted for a ' || NEW.target_type || '. Reason: ' || NEW.reason
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger for new reports
DROP TRIGGER IF EXISTS on_report_created ON reports;
CREATE TRIGGER on_report_created
AFTER INSERT ON reports
FOR EACH ROW
EXECUTE FUNCTION notify_admin_of_report();

-- 4. Update the low rating notification to also flag the event
CREATE OR REPLACE FUNCTION notify_low_rating_and_flag()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.rating < 3 THEN
        -- Notify the host (existing)
        INSERT INTO notifications (user_id, type, title, content)
        SELECT 
            e.creator_user_id, 
            'admin_warning', 
            'Low Rating Received', 
            'An attendee rated your event "' || e.title || '" with ' || NEW.rating || ' stars.'
        FROM events e
        WHERE e.id = NEW.event_id;
        
        -- Flag for admin review
        UPDATE events 
        SET 
            admin_flagged = TRUE,
            admin_flagged_reason = 'Rating: ' || NEW.rating || ' stars'
        WHERE id = NEW.event_id;

        -- Active Admin alert
        INSERT INTO notifications (user_id, type, title, content)
        SELECT 
            NULL,
            'admin_alert',
            'Event Flagged for Low Rating',
            'Event "' || e.title || '" was flagged due to a ' || NEW.rating || '-star rating.'
        FROM events e
        WHERE e.id = NEW.event_id;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace old trigger function
DROP TRIGGER IF EXISTS on_low_rating ON event_reviews;
CREATE TRIGGER on_low_rating
AFTER INSERT ON event_reviews
FOR EACH ROW
EXECUTE FUNCTION notify_low_rating_and_flag();
