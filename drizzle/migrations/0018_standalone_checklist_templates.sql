-- Migration: Create standalone_checklist_templates table
-- Templates de checklist independentes (reutilizáveis por organização)

CREATE TABLE IF NOT EXISTS "standalone_checklist_templates" (
    "id" uuid PRIMARY KEY,
    "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "checklist" jsonb NOT NULL DEFAULT '[]'
);

-- Índice para busca por organização
CREATE INDEX IF NOT EXISTS "idx_standalone_checklist_templates_org" ON "standalone_checklist_templates" ("organization_id");