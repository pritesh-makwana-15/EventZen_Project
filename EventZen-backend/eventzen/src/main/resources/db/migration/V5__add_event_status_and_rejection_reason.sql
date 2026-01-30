-- ================================================================
-- FILE: V5__add_event_status_and_rejection_reason.sql
-- Location: src/main/resources/db/migration/
-- Purpose: Add status and rejection_reason columns to events table
-- ================================================================

-- Add status column with default PENDING
ALTER TABLE events 
ADD COLUMN status VARCHAR(20) DEFAULT 'PENDING' NOT NULL;

-- Add rejection_reason column (nullable, only used when rejected)
ALTER TABLE events 
ADD COLUMN rejection_reason TEXT;

-- Set all existing events to APPROVED (backward compatibility)
-- This ensures current events remain visible to visitors
UPDATE events 
SET status = 'APPROVED' 
WHERE status = 'PENDING';

-- Add index for faster status-based queries
CREATE INDEX idx_events_status ON events(status);

-- Add composite index for organizer + status queries
CREATE INDEX idx_events_organizer_status ON events(organizer_id, status);

-- Add comment for documentation
COMMENT ON COLUMN events.status IS 'Event approval status: PENDING, APPROVED, or REJECTED';
COMMENT ON COLUMN events.rejection_reason IS 'Admin reason for rejection (only used when status = REJECTED)';