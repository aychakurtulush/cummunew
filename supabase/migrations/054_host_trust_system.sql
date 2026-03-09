-- 054_host_trust_system.sql
-- Tracking trust metrics and badge status for hosts

-- 1. Ensure profiles has flagging fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS admin_flagged BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_flagged_reason TEXT;

-- 2. Create a view for host trust metrics to simplify queries
CREATE OR REPLACE VIEW host_trust_metrics AS
WITH host_ratings AS (
    SELECT 
        e.creator_user_id,
        AVG(er.rating) as avg_rating,
        COUNT(er.id) as rating_count
    FROM events e
    JOIN event_reviews er ON e.id = er.event_id
    GROUP BY e.creator_user_id
),
host_attendance AS (
    SELECT 
        e.creator_user_id,
        COUNT(b.id) FILTER (WHERE b.status = 'confirmed') as confirmed_bookings,
        COUNT(b.id) FILTER (WHERE b.checked_in = TRUE) as checkins
    FROM events e
    JOIN bookings b ON e.id = b.event_id
    GROUP BY e.creator_user_id
),
host_events AS (
    SELECT 
        creator_user_id,
        COUNT(id) as total_events
    FROM events
    WHERE status = 'approved'
    GROUP BY creator_user_id
),
host_reports AS (
    -- Assuming reports target_id is the profile/user id for 'host' type
    SELECT 
        target_id::uuid as host_id,
        COUNT(id) as report_count
    FROM reports
    WHERE target_type = 'host'
    GROUP BY target_id
)
SELECT 
    p.user_id,
    p.full_name,
    p.is_banned,
    p.is_suspended_until,
    p.admin_flagged,
    p.admin_flagged_reason,
    COALESCE(he.total_events, 0) as total_events,
    COALESCE(hr.avg_rating, 0)::numeric(3,1) as avg_rating,
    COALESCE(hr.rating_count, 0) as rating_count,
    CASE 
        WHEN COALESCE(ha.confirmed_bookings, 0) = 0 THEN 0
        ELSE (COALESCE(ha.checkins, 0)::float / ha.confirmed_bookings::float * 100)::numeric(5,0)
    END as attendance_rate,
    COALESCE(rep.report_count, 0) as report_count
FROM profiles p
LEFT JOIN host_events he ON p.user_id = he.creator_user_id
LEFT JOIN host_ratings hr ON p.user_id = hr.creator_user_id
LEFT JOIN host_attendance ha ON p.user_id = ha.creator_user_id
LEFT JOIN host_reports rep ON p.user_id = rep.host_id;

-- 3. Automated flagging function based on rating and reports
CREATE OR REPLACE FUNCTION monitor_host_trust()
RETURNS TRIGGER AS $$
DECLARE
    v_avg_rating numeric;
    v_report_count bigint;
BEGIN
    -- Only relevant if it's a review or report update
    -- Let's calculate for the specific host
    
    -- This is triggered by NEW rating or report. 
    -- We can just run a quick check.
    
    SELECT avg_rating, report_count INTO v_avg_rating, v_report_count
    FROM host_trust_metrics
    WHERE user_id = NEW.target_id::uuid OR user_id = (SELECT creator_user_id FROM events WHERE id = NEW.event_id);
    
    IF v_avg_rating < 3.0 OR v_report_count >= 5 THEN
        UPDATE profiles 
        SET 
            admin_flagged = TRUE,
            admin_flagged_reason = CASE 
                WHEN v_avg_rating < 3.0 THEN 'Low rating: ' || v_avg_rating
                ELSE 'High report count: ' || v_report_count
            END
        WHERE user_id = (SELECT user_id FROM host_trust_metrics WHERE user_id = NEW.target_id::uuid OR user_id = (SELECT creator_user_id FROM events WHERE id = NEW.event_id));
        
        -- Also notify admins
        INSERT INTO notifications (user_id, type, title, content)
        VALUES (NULL, 'admin_alert', 'Host Flagged for Review', 'Host trust score dropped below threshold.');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reviews
DROP TRIGGER IF EXISTS on_review_trust_check ON event_reviews;
CREATE TRIGGER on_review_trust_check
AFTER INSERT OR UPDATE ON event_reviews
FOR EACH ROW EXECUTE FUNCTION monitor_host_trust();

-- Trigger for reports
DROP TRIGGER IF EXISTS on_report_trust_check ON reports;
CREATE TRIGGER on_report_trust_check
AFTER INSERT OR UPDATE ON reports
FOR EACH ROW EXECUTE FUNCTION monitor_host_trust();
