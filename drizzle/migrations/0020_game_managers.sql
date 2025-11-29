-- Migration: Criar tabelas de Game Manager
-- Persistência de Game Managers e suas Tasks

CREATE TABLE IF NOT EXISTS game_managers (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    photo TEXT,
    objective TEXT,
    update_frequency INTEGER,
    manager_id UUID,
    responsibles JSONB,
    start_date TEXT,
    end_date TEXT,
    game_length INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_managers_org ON game_managers (organization_id);

CREATE INDEX IF NOT EXISTS idx_game_managers_project ON game_managers (project_id);

CREATE TABLE IF NOT EXISTS game_manager_tasks (
    id UUID PRIMARY KEY,
    game_manager_id UUID NOT NULL REFERENCES game_managers (id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    kpi_id UUID,
    description TEXT,
    reward_points REAL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_manager_tasks_gm ON game_manager_tasks (game_manager_id);

CREATE INDEX IF NOT EXISTS idx_game_manager_tasks_org ON game_manager_tasks (organization_id);