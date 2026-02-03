-- Add due_time column to tasks table for time-based reminders
ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS due_time TIME;
