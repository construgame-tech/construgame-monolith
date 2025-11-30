CREATE TABLE IF NOT EXISTS "games" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"status" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"photo" text,
	"objective" text,
	"update_frequency" integer,
	"manager_id" uuid,
	"responsibles" jsonb,
	"start_date" varchar(10),
	"end_date" varchar(10),
	"prizes" jsonb,
	"kpis" jsonb,
	"archived" integer DEFAULT 0,
	"game_manager_id" uuid,
	"sequence" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"photo" text,
	"sequence" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"game_id" uuid NOT NULL,
	"status" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"reward_points" integer NOT NULL,
	"is_locked" integer DEFAULT 0,
	"location" text,
	"team_id" uuid,
	"user_id" uuid,
	"kpi_id" uuid,
	"task_manager_id" uuid,
	"manager_id" uuid,
	"description" text,
	"measurement_unit" varchar(100),
	"total_measurement_expected" varchar(100),
	"video_url" text,
	"embed_video_url" text,
	"checklist" jsonb,
	"start_date" varchar(10),
	"end_date" varchar(10),
	"progress" jsonb,
	"updates" jsonb,
	"pending_review_updates" jsonb,
	"sequence" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20),
	"password" text,
	"auth_code" varchar(10),
	"auth_code_expires_at" varchar(30),
	"signed_terms_of_use" integer DEFAULT 0,
	"nickname" varchar(100),
	"photo" text,
	"status" varchar(30) NOT NULL,
	"password_recovery_code" varchar(100),
	"password_recovery_code_expires" varchar(30),
	"type" varchar(20),
	"custom_id" varchar(100),
	"sequence" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "games_organization_id_idx" ON "games" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "games_project_id_idx" ON "games" ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "games_status_idx" ON "games" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organizations_owner_id_idx" ON "organizations" ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_game_id_idx" ON "tasks" ("game_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_status_idx" ON "tasks" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_team_id_idx" ON "tasks" ("team_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_user_id_idx" ON "tasks" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_kpi_id_idx" ON "tasks" ("kpi_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_task_manager_id_idx" ON "tasks" ("task_manager_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_manager_id_idx" ON "tasks" ("manager_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_phone_idx" ON "users" ("phone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_status_idx" ON "users" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_custom_id_idx" ON "users" ("custom_id");