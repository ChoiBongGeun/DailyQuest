ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS sort_order INTEGER;

CREATE INDEX IF NOT EXISTS idx_tasks_project_sort_order
    ON tasks (project_id, sort_order);
