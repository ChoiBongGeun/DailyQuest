CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    project_id BIGINT REFERENCES projects(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20),
    due_date DATE,
    due_time TIME,
    reminder_offsets VARCHAR(100),
    is_completed BOOLEAN,
    completed_at TIMESTAMP,
    is_recurring BOOLEAN,
    recurrence_type VARCHAR(20),
    recurrence_interval INTEGER,
    recurrence_end_date DATE,
    parent_task_id BIGINT REFERENCES tasks(id),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id
    ON tasks (user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_due_date
    ON tasks (due_date);

CREATE INDEX IF NOT EXISTS idx_tasks_is_completed
    ON tasks (is_completed);

CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date
    ON tasks (user_id, due_date);
