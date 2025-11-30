-- Create kaizens table
CREATE TABLE IF NOT EXISTS kaizens (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'DONE', 'APPROVED', 'ARCHIVED')),
  name TEXT NOT NULL,
  created_date TIMESTAMP NOT NULL,
  updated_date TIMESTAMP,
  sequence INTEGER NOT NULL DEFAULT 0,

-- Optional fields
original_kaizen_id TEXT,
leader_id TEXT,
team_id TEXT,
category INTEGER,

-- Current fields
kaizen_type_id TEXT, kaizen_idea_id TEXT, responsibles JSONB,

-- Problem and solution description
current_situation TEXT,
current_situation_images JSONB,
solution TEXT,
solution_images JSONB,

-- Tasks and benefits
tasks JSONB, benefits JSONB,

-- Resources and files
resources TEXT, files JSONB, attachments JSONB,

-- Replication
replicas JSONB );

-- Create indexes
CREATE INDEX IF NOT EXISTS kaizens_organization_id_idx ON kaizens (organization_id);

CREATE INDEX IF NOT EXISTS kaizens_project_id_idx ON kaizens (project_id);

CREATE INDEX IF NOT EXISTS kaizens_game_id_idx ON kaizens (game_id);

CREATE INDEX IF NOT EXISTS kaizens_leader_id_idx ON kaizens (leader_id);

CREATE INDEX IF NOT EXISTS kaizens_team_id_idx ON kaizens (team_id);

CREATE INDEX IF NOT EXISTS kaizens_status_idx ON kaizens (status);