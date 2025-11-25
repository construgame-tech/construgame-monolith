-- Task Manager Module Migration
-- Creates table for Task Managers (gerenciadores de criação de tasks recorrentes)

CREATE TABLE "task_managers" (
    "id" uuid PRIMARY KEY,
    "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE,
    "project_id" uuid NOT NULL REFERENCES "projects" ("id") ON DELETE CASCADE,
    "game_id" uuid NOT NULL REFERENCES "games" ("id") ON DELETE CASCADE,
    "kpi_id" uuid NOT NULL REFERENCES "kpis" ("id") ON DELETE CASCADE,
    "macrostep" jsonb,
    "name" text NOT NULL,
    "reward_points" real NOT NULL,
    "location" text,
    "description" text,
    "measurement_unit" text,
    "total_measurement_expected" text,
    "video_url" text,
    "embed_video_url" text,
    "responsible" jsonb NOT NULL,
    "schedule" jsonb NOT NULL,
    "checklist" jsonb,
    "progress_absolute" real NOT NULL DEFAULT 0,
    "tasks" jsonb DEFAULT '[]'::jsonb,
    "sequence" real NOT NULL DEFAULT 0,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX "idx_task_managers_game" ON "task_managers" ("game_id");

CREATE INDEX "idx_task_managers_project" ON "task_managers" ("project_id");

CREATE INDEX "idx_task_managers_organization" ON "task_managers" ("organization_id");

CREATE INDEX "idx_task_managers_kpi" ON "task_managers" ("kpi_id");