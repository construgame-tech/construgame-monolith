-- Migration: Create task_templates and checklist_templates tables
-- Date: 2025-11-27

-- Create task_templates table
CREATE TABLE IF NOT EXISTS "task_templates" (
    "id" UUID PRIMARY KEY,
    "organization_id" UUID NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE,
    "kpi_id" UUID NOT NULL REFERENCES "kpis" ("id") ON DELETE CASCADE,
    "name" VARCHAR(500) NOT NULL,
    "reward_points" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "measurement_unit" VARCHAR(100),
    "total_measurement_expected" VARCHAR(100)
);

-- Create checklist_templates table
CREATE TABLE IF NOT EXISTS "checklist_templates" (
    "id" UUID PRIMARY KEY,
    "task_template_id" UUID NOT NULL REFERENCES "task_templates" ("id") ON DELETE CASCADE,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_task_templates_organization" ON "task_templates" ("organization_id");

CREATE INDEX IF NOT EXISTS "idx_task_templates_kpi" ON "task_templates" ("kpi_id");

CREATE INDEX IF NOT EXISTS "idx_checklist_templates_task" ON "checklist_templates" ("task_template_id");