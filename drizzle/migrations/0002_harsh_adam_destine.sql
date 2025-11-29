CREATE TABLE "game_manager_tasks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"game_manager_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"kpi_id" uuid,
	"description" text,
	"reward_points" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_managers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"photo" text,
	"objective" text,
	"update_frequency" integer,
	"manager_id" uuid,
	"responsibles" jsonb,
	"start_date" text,
	"end_date" text,
	"game_length" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reusable_checklist_templates" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"checklist" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kpis" ADD COLUMN "type" text;--> statement-breakpoint
ALTER TABLE "kpis" ADD COLUMN "kpi_type" text;--> statement-breakpoint
ALTER TABLE "kpis" ADD COLUMN "photo" text;--> statement-breakpoint
ALTER TABLE "game_manager_tasks" ADD CONSTRAINT "game_manager_tasks_game_manager_id_game_managers_id_fk" FOREIGN KEY ("game_manager_id") REFERENCES "public"."game_managers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_manager_tasks" ADD CONSTRAINT "game_manager_tasks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_manager_tasks" ADD CONSTRAINT "game_manager_tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_managers" ADD CONSTRAINT "game_managers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_managers" ADD CONSTRAINT "game_managers_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reusable_checklist_templates" ADD CONSTRAINT "reusable_checklist_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;