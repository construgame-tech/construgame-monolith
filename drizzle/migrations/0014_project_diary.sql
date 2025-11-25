-- Project Diary Module Migration
-- Creates table for daily project diaries (diário de obra)

CREATE TABLE "project_diaries" (
    "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE,
    "project_id" uuid NOT NULL REFERENCES "projects" ("id") ON DELETE CASCADE,
    "date" text NOT NULL,
    "notes" text,
    "weather" jsonb,
    "equipment" jsonb,
    "manpower" jsonb,
    "indirect_manpower" jsonb,
    "sequence" real NOT NULL DEFAULT 0,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY ("project_id", "date")
);

-- Indexes for better query performance
CREATE INDEX "idx_project_diaries_project" ON "project_diaries" ("project_id");

CREATE INDEX "idx_project_diaries_organization" ON "project_diaries" ("organization_id");

CREATE INDEX "idx_project_diaries_date" ON "project_diaries" ("date");