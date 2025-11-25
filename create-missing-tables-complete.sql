-- ============================================================================
-- CREATE MISSING TABLES - Construgame Monolith Database
-- Generated from Drizzle schema files
-- ============================================================================

-- Table 1: financial_prizes
-- Schema: src/infrastructure/database/schemas/financial-prize.schema.ts
CREATE TABLE IF NOT EXISTS financial_prizes (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    period TEXT NOT NULL,
    calculated_at TIMESTAMP NOT NULL,
    details JSONB,
    sequence INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS financial_prizes_organization_id_idx ON financial_prizes (organization_id);

CREATE INDEX IF NOT EXISTS financial_prizes_project_id_idx ON financial_prizes (project_id);

CREATE INDEX IF NOT EXISTS financial_prizes_game_id_idx ON financial_prizes (game_id);

CREATE INDEX IF NOT EXISTS financial_prizes_user_id_idx ON financial_prizes (user_id);

CREATE INDEX IF NOT EXISTS financial_prizes_period_idx ON financial_prizes (period);

-- ============================================================================
-- Table 2: game_points (from points.schema.ts)
-- Note: This is actually split into multiple tables in the schema
-- ============================================================================

-- user_game_points
CREATE TABLE IF NOT EXISTS user_game_points (
    user_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    task_points INTEGER NOT NULL DEFAULT 0,
    kaizen_points INTEGER NOT NULL DEFAULT 0,
    total_points INTEGER NOT NULL DEFAULT 0,
    sequence INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS user_game_points_pk ON user_game_points (user_id, game_id);

CREATE INDEX IF NOT EXISTS user_game_points_user_idx ON user_game_points (user_id);

CREATE INDEX IF NOT EXISTS user_game_points_game_idx ON user_game_points (game_id);

-- team_game_points
CREATE TABLE IF NOT EXISTS team_game_points (
    team_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    task_points INTEGER NOT NULL DEFAULT 0,
    kaizen_points INTEGER NOT NULL DEFAULT 0,
    total_points INTEGER NOT NULL DEFAULT 0,
    sequence INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS team_game_points_pk ON team_game_points (team_id, game_id);

CREATE INDEX IF NOT EXISTS team_game_points_team_idx ON team_game_points (team_id);

CREATE INDEX IF NOT EXISTS team_game_points_game_idx ON team_game_points (game_id);

-- ============================================================================
-- Table 3: kaizen_points (from points.schema.ts)
-- ============================================================================

-- user_kaizen_points
CREATE TABLE IF NOT EXISTS user_kaizen_points (
    user_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    sequence INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS user_kaizen_points_pk ON user_kaizen_points (user_id, game_id);

CREATE INDEX IF NOT EXISTS user_kaizen_points_user_idx ON user_kaizen_points (user_id);

CREATE INDEX IF NOT EXISTS user_kaizen_points_game_idx ON user_kaizen_points (game_id);

-- team_kaizen_points
CREATE TABLE IF NOT EXISTS team_kaizen_points (
    team_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    sequence INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS team_kaizen_points_pk ON team_kaizen_points (team_id, game_id);

CREATE INDEX IF NOT EXISTS team_kaizen_points_team_idx ON team_kaizen_points (team_id);

CREATE INDEX IF NOT EXISTS team_kaizen_points_game_idx ON team_kaizen_points (game_id);

-- game_kaizen_points
CREATE TABLE IF NOT EXISTS game_kaizen_points (
    game_id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    sequence INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS game_kaizen_points_game_idx ON game_kaizen_points (game_id);

-- ============================================================================
-- Table 4: organization_configs (org_configs from org-config.schema.ts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_configs (
    organization_id TEXT PRIMARY KEY,
    missions_enabled BOOLEAN NOT NULL,
    financial_enabled BOOLEAN NOT NULL,
    kaizens_enabled BOOLEAN NOT NULL,
    project_diary_enabled BOOLEAN,
    mission_config JSONB,
    theme JSONB NOT NULL,
    auth JSONB NOT NULL,
    sequence INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS organization_configs_organization_id_idx ON organization_configs (organization_id);

-- ============================================================================
-- Table 5: prizes (from org-config.schema.ts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS prizes (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    photo TEXT
);

CREATE INDEX IF NOT EXISTS prizes_organization_id_idx ON prizes (organization_id);

-- ============================================================================
-- Table 6: project_diary_entries (project_diaries from project-diary.schema.ts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_diary_entries (
    organization_id UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    notes TEXT,
    weather JSONB,
    equipment JSONB,
    manpower JSONB,
    indirect_manpower JSONB,
    sequence REAL NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (
        organization_id,
        project_id,
        date
    )
);

-- ============================================================================
-- Table 7 & 8: project_planning_macrosteps and project_planning_activities
-- Schema: src/infrastructure/database/schemas/project-planning.schema.ts
-- ============================================================================

-- macrosteps
CREATE TABLE IF NOT EXISTS project_planning_macrosteps (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    start_date TEXT,
    end_date TEXT,
    progress_percent REAL NOT NULL DEFAULT 0,
    sequence REAL NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- activities
CREATE TABLE IF NOT EXISTS project_planning_activities (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    macrostep_id UUID NOT NULL REFERENCES project_planning_macrosteps (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    total_measurement_expected TEXT,
    measurement_unit TEXT,
    start_date TEXT,
    end_date TEXT,
    duration REAL,
    location TEXT,
    expected_cost REAL,
    progress_percent REAL NOT NULL DEFAULT 0,
    tracking_value REAL,
    tracking_unit TEXT,
    labor_composition_list JSONB,
    prizes_per_range JSONB,
    prizes_per_productivity JSONB,
    sequence REAL NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- macrostep_orders (additional table from project-planning schema)
CREATE TABLE IF NOT EXISTS macrostep_orders (
    project_id UUID PRIMARY KEY REFERENCES projects (id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    macrostep_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    sequence REAL NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Table 9: sectors (from org-config.schema.ts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sectors (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS sectors_organization_id_idx ON sectors (organization_id);

-- ============================================================================
-- Table 10: task_managers (from task-manager.schema.ts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_managers (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games (id) ON DELETE CASCADE,
    kpi_id UUID NOT NULL REFERENCES kpis (id) ON DELETE CASCADE,
    macrostep JSONB,
    name TEXT NOT NULL,
    reward_points REAL NOT NULL,
    location TEXT,
    description TEXT,
    measurement_unit TEXT,
    total_measurement_expected TEXT,
    video_url TEXT,
    embed_video_url TEXT,
    responsible JSONB NOT NULL,
    schedule JSONB NOT NULL,
    checklist JSONB,
    progress_absolute REAL NOT NULL DEFAULT 0,
    tasks JSONB DEFAULT '[]'::jsonb,
    sequence REAL NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Table 11: task_points (from points.schema.ts)
-- ============================================================================

-- user_task_points
CREATE TABLE IF NOT EXISTS user_task_points (
    user_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    sequence INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS user_task_points_pk ON user_task_points (user_id, game_id);

CREATE INDEX IF NOT EXISTS user_task_points_user_idx ON user_task_points (user_id);

CREATE INDEX IF NOT EXISTS user_task_points_game_idx ON user_task_points (game_id);

-- team_task_points
CREATE TABLE IF NOT EXISTS team_task_points (
    team_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    sequence INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS team_task_points_pk ON team_task_points (team_id, game_id);

CREATE INDEX IF NOT EXISTS team_task_points_team_idx ON team_task_points (team_id);

CREATE INDEX IF NOT EXISTS team_task_points_game_idx ON team_task_points (game_id);

-- game_task_points
CREATE TABLE IF NOT EXISTS game_task_points (
    game_id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    sequence INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS game_task_points_game_idx ON game_task_points (game_id);

-- ============================================================================
-- Table 12: task_templates (from task-template.schema.ts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_templates (
    id VARCHAR(255) PRIMARY KEY,
    organization_id VARCHAR(255) NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    kpi_id VARCHAR(255) NOT NULL REFERENCES kpis (id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    reward_points INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    measurement_unit VARCHAR(100),
    total_measurement_expected VARCHAR(100)
);

-- checklist_templates (additional table from task-template schema)
CREATE TABLE IF NOT EXISTS checklist_templates (
    id VARCHAR(255) PRIMARY KEY,
    task_template_id VARCHAR(255) NOT NULL REFERENCES task_templates (id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- ============================================================================
-- Table 13: task_updates (from task-update.schema.ts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_updates (
    id VARCHAR(255) PRIMARY KEY,
    game_id VARCHAR(255) NOT NULL REFERENCES games (id) ON DELETE CASCADE,
    task_id VARCHAR(255) NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW',
    submitted_by VARCHAR(255) NOT NULL,
    reviewed_by VARCHAR(255),
    review_note TEXT,
    start_date DATE,
    end_date DATE,
    participants JSONB,
    photos JSONB,
    progress JSONB NOT NULL,
    checklist JSONB,
    files JSONB,
    sequence INTEGER NOT NULL DEFAULT 0
);

-- ============================================================================
-- Table 14: web_notifications (from web-notification.schema.ts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS web_notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UNREAD',
    type VARCHAR(50) NOT NULL,
    created_date VARCHAR(30) NOT NULL,
    kaizen_completed_data JSON
);

CREATE INDEX IF NOT EXISTS web_notifications_user_id_idx ON web_notifications (user_id);

CREATE INDEX IF NOT EXISTS web_notifications_organization_id_idx ON web_notifications (organization_id);

CREATE INDEX IF NOT EXISTS web_notifications_status_idx ON web_notifications (status);

CREATE INDEX IF NOT EXISTS web_notifications_created_date_idx ON web_notifications (created_date);

-- Add CHECK constraint for status enum
ALTER TABLE web_notifications
DROP CONSTRAINT IF EXISTS web_notifications_status_check;

ALTER TABLE web_notifications
ADD CONSTRAINT web_notifications_status_check CHECK (status IN ('UNREAD', 'READ'));

-- Add CHECK constraint for type enum
ALTER TABLE web_notifications
DROP CONSTRAINT IF EXISTS web_notifications_type_check;

ALTER TABLE web_notifications
ADD CONSTRAINT web_notifications_type_check CHECK (type IN ('KAIZEN_COMPLETED'));

-- ============================================================================
-- Additional table: org_kaizen_configs (from org-config.schema.ts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS org_kaizen_configs (
    organization_id TEXT PRIMARY KEY,
    category_points JSONB NOT NULL,
    sequence INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS org_kaizen_configs_organization_id_idx ON org_kaizen_configs (organization_id);

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================