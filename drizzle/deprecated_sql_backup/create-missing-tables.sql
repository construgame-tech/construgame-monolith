-- Create missing tables based on schemas

-- Members table
CREATE TABLE IF NOT EXISTS "members" (
    "user_id" uuid NOT NULL,
    "organization_id" uuid NOT NULL,
    "role" varchar(20) NOT NULL,
    "sector_id" uuid,
    "sector" varchar(255),
    "position" varchar(255),
    "sequence" integer DEFAULT 0 NOT NULL,
    "job_role_id" uuid,
    "job_role_variant_id" uuid,
    "salary" real,
    "seniority" varchar(50),
    "state" varchar(100),
    "hours_per_day" real,
    PRIMARY KEY ("user_id", "organization_id")
);

CREATE INDEX IF NOT EXISTS "members_user_id_idx" ON "members" ("user_id");

CREATE INDEX IF NOT EXISTS "members_organization_id_idx" ON "members" ("organization_id");

CREATE INDEX IF NOT EXISTS "members_role_idx" ON "members" ("role");

-- Teams table
CREATE TABLE IF NOT EXISTS "teams" (
    "id" uuid PRIMARY KEY,
    "organization_id" uuid NOT NULL,
    "name" varchar(255) NOT NULL,
    "manager_id" uuid,
    "field_of_action" varchar(255),
    "members" json,
    "sequence" integer DEFAULT 0 NOT NULL,
    "photo" text
);

CREATE INDEX IF NOT EXISTS "teams_organization_id_idx" ON "teams" ("organization_id");

CREATE INDEX IF NOT EXISTS "teams_manager_id_idx" ON "teams" ("manager_id");

-- Projects table
CREATE TABLE IF NOT EXISTS "projects" (
    "id" uuid PRIMARY KEY,
    "organization_id" uuid NOT NULL,
    "name" varchar(255) NOT NULL,
    "responsibles" json,
    "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
    "active_game_id" uuid,
    "photo" text,
    "type" varchar(100),
    "state" varchar(100),
    "city" varchar(255),
    "start_date" varchar(30),
    "end_date" varchar(30),
    "prizes" json,
    "teams" json,
    "sequence" integer DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS "projects_organization_id_idx" ON "projects" ("organization_id");

CREATE INDEX IF NOT EXISTS "projects_status_idx" ON "projects" ("status");

CREATE INDEX IF NOT EXISTS "projects_active_game_id_idx" ON "projects" ("active_game_id");

-- Kaizen Ideas table
CREATE TABLE IF NOT EXISTS "kaizen_ideas" (
    "id" text PRIMARY KEY,
    "organization_id" text NOT NULL,
    "project_id" text,
    "game_id" text,
    "kaizen_type_id" text,
    "status" text NOT NULL,
    "name" text NOT NULL,
    "is_recommended" boolean,
    "authors" jsonb,
    "problem" jsonb,
    "solution" jsonb,
    "tasks" jsonb,
    "benefits" jsonb,
    "attachments" jsonb,
    "created_date" timestamp NOT NULL,
    "updated_date" timestamp,
    "sequence" integer DEFAULT 0 NOT NULL,
    "executable_kaizen_project_ids" jsonb,
    "non_executable_projects" jsonb
);

CREATE INDEX IF NOT EXISTS "kaizen_ideas_organization_id_idx" ON "kaizen_ideas" ("organization_id");

CREATE INDEX IF NOT EXISTS "kaizen_ideas_project_id_idx" ON "kaizen_ideas" ("project_id");

CREATE INDEX IF NOT EXISTS "kaizen_ideas_game_id_idx" ON "kaizen_ideas" ("game_id");

CREATE INDEX IF NOT EXISTS "kaizen_ideas_status_idx" ON "kaizen_ideas" ("status");

-- Kaizen Types table
CREATE TABLE IF NOT EXISTS "kaizen_types" (
    "id" text PRIMARY KEY,
    "organization_id" text NOT NULL,
    "name" text NOT NULL,
    "reward_points" integer NOT NULL,
    "sequence" integer DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS "kaizen_types_organization_id_idx" ON "kaizen_types" ("organization_id");

-- KPIs table
CREATE TABLE IF NOT EXISTS "kpis" (
    "id" uuid PRIMARY KEY,
    "organization_id" uuid NOT NULL,
    "name" varchar(255) NOT NULL,
    "description" text,
    "unit" varchar(100),
    "sequence" integer DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS "kpis_organization_id_idx" ON "kpis" ("organization_id");

-- Leagues table
CREATE TABLE IF NOT EXISTS "leagues" (
    "id" uuid PRIMARY KEY,
    "game_id" uuid NOT NULL,
    "name" varchar(255) NOT NULL,
    "description" text,
    "start_date" varchar(30),
    "end_date" varchar(30),
    "prizes" jsonb,
    "sequence" integer DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS "leagues_game_id_idx" ON "leagues" ("game_id");

-- Job Roles table
CREATE TABLE IF NOT EXISTS "job_roles" (
    "id" uuid PRIMARY KEY,
    "organization_id" uuid NOT NULL,
    "name" varchar(255) NOT NULL,
    "variants" jsonb,
    "sequence" integer DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS "job_roles_organization_id_idx" ON "job_roles" ("organization_id");