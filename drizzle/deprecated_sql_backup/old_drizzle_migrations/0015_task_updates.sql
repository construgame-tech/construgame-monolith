-- Migration: Create task_updates table
-- This table stores task progress updates submitted by users

CREATE TABLE IF NOT EXISTS "task_updates" (
    "id" uuid PRIMARY KEY NOT NULL,
    "game_id" uuid NOT NULL,
    "task_id" uuid NOT NULL,
    "status" varchar(50) NOT NULL DEFAULT 'PENDING_REVIEW',
    "submitted_by" uuid NOT NULL,
    "reviewed_by" uuid,
    "review_note" text,
    "start_date" date,
    "end_date" date,
    "participants" jsonb,
    "photos" jsonb,
    "progress" jsonb NOT NULL,
    "checklist" jsonb,
    "files" jsonb,
    "sequence" integer NOT NULL DEFAULT 0,
    CONSTRAINT "task_updates_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games" ("id") ON DELETE CASCADE,
    CONSTRAINT "task_updates_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS "task_updates_game_id_idx" ON "task_updates" ("game_id");

CREATE INDEX IF NOT EXISTS "task_updates_task_id_idx" ON "task_updates" ("task_id");

CREATE INDEX IF NOT EXISTS "task_updates_status_idx" ON "task_updates" ("status");

CREATE INDEX IF NOT EXISTS "task_updates_submitted_by_idx" ON "task_updates" ("submitted_by");