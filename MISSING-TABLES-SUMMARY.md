# Missing Tables - SQL Generation Summary

## Overview

Created `create-missing-tables-complete.sql` with PostgreSQL CREATE TABLE statements for **14 missing tables** (plus additional supporting tables).

## Tables Created

### 1. **financial_prizes**
- Source: `financial-prize.schema.ts`
- Primary Key: `id` (TEXT)
- Indexes: organization_id, project_id, game_id, user_id, period
- Notable: Uses NUMERIC(10,2) for amount field

### 2-3. **Game Points Tables** (from `points.schema.ts`)
- `user_game_points` - User points per game
- `team_game_points` - Team points per game
- Composite indexes on (user_id, game_id) and (team_id, game_id)

### 4-6. **Kaizen Points Tables** (from `points.schema.ts`)
- `user_kaizen_points` - User kaizen points
- `team_kaizen_points` - Team kaizen points  
- `game_kaizen_points` - Game-level kaizen points

### 7. **organization_configs** (org_configs in schema)
- Source: `org-config.schema.ts`
- Maps to table name: `organization_configs`
- Uses BOOLEAN for enable flags
- JSONB for mission_config, theme, auth

### 8. **prizes**
- Source: `org-config.schema.ts`
- Simple prize catalog table

### 9. **project_diary_entries** (project_diaries in schema)
- Source: `project-diary.schema.ts`
- Composite Primary Key: (organization_id, project_id, date)
- Foreign Keys: organizations, projects
- Uses REAL for sequence

### 10-11. **Project Planning Tables** (from `project-planning.schema.ts`)
- `project_planning_macrosteps` (macrosteps in schema)
- `project_planning_activities` (activities in schema)
- Additional: `macrostep_orders` table
- Foreign Key cascade: macrosteps → activities

### 12. **sectors**
- Source: `org-config.schema.ts`
- Simple organizational sectors table

### 13. **task_managers**
- Source: `task-manager.schema.ts`
- Foreign Keys: organizations, projects, games, kpis
- JSONB for: macrostep, responsible, schedule, checklist, tasks

### 14-16. **Task Points Tables** (from `points.schema.ts`)
- `user_task_points` - User task points
- `team_task_points` - Team task points
- `game_task_points` - Game-level task points

### 17. **task_templates**
- Source: `task-template.schema.ts`
- Additional: `checklist_templates` (subtable)
- Uses VARCHAR with lengths: id(255), name(500)

### 18. **task_updates**
- Source: `task-update.schema.ts`
- Foreign Keys: games, tasks
- Uses DATE for start_date/end_date
- Default status: 'PENDING_REVIEW'

### 19. **web_notifications**
- Source: `web-notification.schema.ts`
- CHECK constraints for enums:
  - status: 'UNREAD', 'READ'
  - type: 'KAIZEN_COMPLETED'
- Uses JSON (not JSONB) for kaizen_completed_data

### 20. **org_kaizen_configs**
- Source: `org-config.schema.ts`
- Additional table for kaizen category points

## Important Notes

### ❌ **images** table NOT created
- No schema file found for `images` table
- Not defined in any Drizzle schema
- May not be needed or uses different storage (S3?)

### Type Mappings Used

| Drizzle Type | PostgreSQL Type | Notes |
|--------------|-----------------|-------|
| `text()` | TEXT | |
| `integer()` | INTEGER | |
| `timestamp()` | TIMESTAMP | |
| `jsonb()` | JSONB | |
| `varchar(n)` | VARCHAR(n) | |
| `boolean()` | BOOLEAN | |
| `uuid()` | UUID | |
| `real()` | REAL | Used for sequence fields |
| `numeric(p,s)` | NUMERIC(p,s) | For precise decimals |
| `date()` | DATE | |
| `json()` | JSON | Only in web_notifications |

### Key Differences from Expected Table Names

1. `org_configs` → `organization_configs` (renamed for clarity)
2. `project_diaries` → `project_diary_entries` (renamed)
3. `macrosteps` → `project_planning_macrosteps` (prefixed)
4. `activities` → `project_planning_activities` (prefixed)

### Foreign Key Relationships

All foreign key constraints include `ON DELETE CASCADE` as defined in schemas:
- Organizations → Projects → Games
- Projects → Macrosteps → Activities
- Games → Tasks → Task Updates
- Organizations → Task Templates

## Usage

```bash
# Apply all tables
psql -h localhost -U construgame -d construgame -f create-missing-tables-complete.sql

# Or with password
PGPASSWORD=construgame_dev_password psql -h localhost -U construgame -d construgame -f create-missing-tables-complete.sql
```

## Verification

After running, verify tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'financial_prizes',
    'user_game_points',
    'team_game_points',
    'user_kaizen_points',
    'team_kaizen_points',
    'game_kaizen_points',
    'organization_configs',
    'prizes',
    'project_diary_entries',
    'project_planning_macrosteps',
    'project_planning_activities',
    'sectors',
    'task_managers',
    'user_task_points',
    'team_task_points',
    'game_task_points',
    'task_templates',
    'checklist_templates',
    'task_updates',
    'web_notifications',
    'org_kaizen_configs',
    'macrostep_orders'
  )
ORDER BY table_name;
```

Expected: 22 tables created (including supporting tables like checklist_templates and macrostep_orders)
