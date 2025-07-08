
-- Add columns to track editing and delivery status for calendar events
ALTER TABLE calendar_events 
ADD COLUMN is_edited BOOLEAN DEFAULT FALSE,
ADD COLUMN is_delivered BOOLEAN DEFAULT FALSE;
