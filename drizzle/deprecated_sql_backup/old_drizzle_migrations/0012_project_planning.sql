-- Project Planning Module Migration
-- Creates tables for Macrosteps, Activities, and Macrostep Orders

CREATE TABLE "macrosteps" (
    "id" uuid PRIMARY KEY,
    "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE,
    "project_id" uuid NOT NULL REFERENCES "projects" ("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "description" text,
    "start_date" text,
    "end_date" text,
    "progress_percent" real NOT NULL DEFAULT 0,
    "sequence" real NOT NULL DEFAULT 0,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "activities" (
    "id" uuid PRIMARY KEY,
    "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE,
    "project_id" uuid NOT NULL REFERENCES "projects" ("id") ON DELETE CASCADE,
    "macrostep_id" uuid NOT NULL REFERENCES "macrosteps" ("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "description" text,
    "total_measurement_expected" text,
    "measurement_unit" text,
    "start_date" text,
    "end_date" text,
    "duration" real,
    "location" text,
    "expected_cost" real,
    "progress_percent" real NOT NULL DEFAULT 0,
    "tracking_value" real,
    "tracking_unit" text,
    "labor_composition_list" jsonb,
    "prizes_per_range" jsonb,
    "prizes_per_productivity" jsonb,
    "sequence" real NOT NULL DEFAULT 0,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "macrostep_orders" (
    "project_id" uuid PRIMARY KEY REFERENCES "projects" ("id") ON DELETE CASCADE,
    "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE,
    "macrostep_ids" jsonb NOT NULL DEFAULT '[]'::jsonb,
    "sequence" real NOT NULL DEFAULT 0,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX "idx_macrosteps_project" ON "macrosteps" ("project_id");

CREATE INDEX "idx_macrosteps_organization" ON "macrosteps" ("organization_id");

CREATE INDEX "idx_activities_macrostep" ON "activities" ("macrostep_id");

CREATE INDEX "idx_activities_project" ON "activities" ("project_id");

CREATE INDEX "idx_activities_organization" ON "activities" ("organization_id");

CREATE INDEX "idx_macrostep_orders_organization" ON "macrostep_orders" ("organization_id");