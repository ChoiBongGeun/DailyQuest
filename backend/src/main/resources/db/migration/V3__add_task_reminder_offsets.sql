-- Add reminder_offsets column to tasks table for per-task reminder settings
-- Stores comma-separated minutes (e.g., "60,30,10" means reminders at 60, 30, 10 minutes before due)
-- NULL means use user's default reminder settings
ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS reminder_offsets VARCHAR(100);
