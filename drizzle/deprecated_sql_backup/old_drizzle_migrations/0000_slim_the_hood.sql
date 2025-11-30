CREATE TABLE "financial_prizes" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"game_id" text NOT NULL,
	"user_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"period" text NOT NULL,
	"calculated_at" timestamp NOT NULL,
	"details" jsonb,
	"sequence" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
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
CREATE TABLE "job_roles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"variants" jsonb,
	"updated_by" text,
	"updated_at" timestamp,
	"created_at" timestamp,
	"created_by" text,
	"sequence" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kaizen_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"kaizen_id" text NOT NULL,
	"user_id" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kaizen_ideas" (
	"id" text PRIMARY KEY NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "kaizen_types" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"reward_points" integer NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kaizens" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"game_id" text NOT NULL,
	"status" text NOT NULL,
	"name" text NOT NULL,
	"created_date" timestamp NOT NULL,
	"updated_date" timestamp,
	"sequence" integer DEFAULT 0 NOT NULL,
	"author_id" text,
	"description" text,
	"original_kaizen_id" text,
	"leader_id" text,
	"team_id" text,
	"category" integer,
	"kaizen_type_id" text,
	"kaizen_idea_id" text,
	"responsibles" jsonb,
	"current_situation" text,
	"current_situation_images" jsonb,
	"solution" text,
	"solution_images" jsonb,
	"tasks" jsonb,
	"benefits" jsonb,
	"resources" text,
	"files" jsonb,
	"attachments" jsonb,
	"replicas" jsonb
);
--> statement-breakpoint
CREATE TABLE "kpis" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"unit" text,
	"sequence" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leagues" (
	"id" uuid PRIMARY KEY NOT NULL,
	"game_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"start_date" varchar(30),
	"end_date" varchar(30),
	"prizes" jsonb,
	"sequence" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
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
	CONSTRAINT "members_user_id_organization_id_pk" PRIMARY KEY("user_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "organization_configs" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"missions_enabled" boolean NOT NULL,
	"financial_enabled" boolean NOT NULL,
	"kaizens_enabled" boolean NOT NULL,
	"project_diary_enabled" boolean,
	"mission_config" jsonb,
	"theme" jsonb NOT NULL,
	"auth" jsonb NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_kaizen_configs" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"category_points" jsonb NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prizes" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"photo" text
);
--> statement-breakpoint
CREATE TABLE "sectors" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"photo" text,
	"sequence" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_kaizen_points" (
	"game_id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_task_points" (
	"game_id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_game_points" (
	"team_id" text NOT NULL,
	"game_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"task_points" integer DEFAULT 0 NOT NULL,
	"kaizen_points" integer DEFAULT 0 NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "team_game_points_team_id_game_id_pk" PRIMARY KEY("team_id","game_id")
);
--> statement-breakpoint
CREATE TABLE "team_kaizen_points" (
	"team_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"game_id" text NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_task_points" (
	"team_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"game_id" text NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_game_points" (
	"user_id" text NOT NULL,
	"game_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"task_points" integer DEFAULT 0 NOT NULL,
	"kaizen_points" integer DEFAULT 0 NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_game_points_user_id_game_id_pk" PRIMARY KEY("user_id","game_id")
);
--> statement-breakpoint
CREATE TABLE "user_kaizen_points" (
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"game_id" text NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_task_points" (
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"game_id" text NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_diaries" (
	"organization_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"date" text NOT NULL,
	"notes" text,
	"weather" jsonb,
	"equipment" jsonb,
	"manpower" jsonb,
	"indirect_manpower" jsonb,
	"sequence" real DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"macrostep_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"total_measurement_expected" text,
	"measurement_unit" text,
	"start_date" text,
	"end_date" text,
	"duration" real,
	"location" text,
	"expected_cost" real,
	"progress_percent" real DEFAULT 0 NOT NULL,
	"tracking_value" real,
	"tracking_unit" text,
	"labor_composition_list" jsonb,
	"prizes_per_range" jsonb,
	"prizes_per_productivity" jsonb,
	"sequence" real DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "macrostep_orders" (
	"project_id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"macrostep_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sequence" real DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "macrosteps" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"start_date" text,
	"end_date" text,
	"progress_percent" real DEFAULT 0 NOT NULL,
	"sequence" real DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"responsibles" json,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "task_managers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"kpi_id" uuid NOT NULL,
	"macrostep" jsonb,
	"name" text NOT NULL,
	"reward_points" real NOT NULL,
	"location" text,
	"description" text,
	"measurement_unit" text,
	"total_measurement_expected" text,
	"video_url" text,
	"embed_video_url" text,
	"responsible" jsonb NOT NULL,
	"schedule" jsonb NOT NULL,
	"checklist" jsonb,
	"progress_absolute" real DEFAULT 0 NOT NULL,
	"tasks" jsonb DEFAULT '[]'::jsonb,
	"sequence" real DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_templates" (
	"id" uuid PRIMARY KEY NOT NULL,
	"task_template_id" uuid NOT NULL,
	"text" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_templates" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"kpi_id" uuid NOT NULL,
	"name" text NOT NULL,
	"reward_points" integer DEFAULT 0 NOT NULL,
	"description" text,
	"measurement_unit" text,
	"total_measurement_expected" text
);
--> statement-breakpoint
CREATE TABLE "task_updates" (
	"id" uuid PRIMARY KEY NOT NULL,
	"game_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'PENDING_REVIEW' NOT NULL,
	"submitted_by" uuid NOT NULL,
	"reviewed_by" uuid,
	"review_note" text,
	"start_date" date,
	"end_date" date,
	"participants" jsonb,
	"photos" jsonb,
	"progress" jsonb NOT NULL,
	"checklist" jsonb,
	"files" jsonb,
	"sequence" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
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
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"manager_id" uuid,
	"field_of_action" varchar(255),
	"members" json,
	"sequence" integer DEFAULT 0 NOT NULL,
	"photo" text,
	"color" varchar(50),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "users" (
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
CREATE TABLE "web_notifications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'UNREAD' NOT NULL,
	"type" varchar(50) NOT NULL,
	"created_date" varchar(30) NOT NULL,
	"kaizen_completed_data" json
);
--> statement-breakpoint
ALTER TABLE "project_diaries" ADD CONSTRAINT "project_diaries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_diaries" ADD CONSTRAINT "project_diaries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_macrostep_id_macrosteps_id_fk" FOREIGN KEY ("macrostep_id") REFERENCES "public"."macrosteps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "macrostep_orders" ADD CONSTRAINT "macrostep_orders_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "macrostep_orders" ADD CONSTRAINT "macrostep_orders_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "macrosteps" ADD CONSTRAINT "macrosteps_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "macrosteps" ADD CONSTRAINT "macrosteps_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_managers" ADD CONSTRAINT "task_managers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_managers" ADD CONSTRAINT "task_managers_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_managers" ADD CONSTRAINT "task_managers_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_managers" ADD CONSTRAINT "task_managers_kpi_id_kpis_id_fk" FOREIGN KEY ("kpi_id") REFERENCES "public"."kpis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_task_template_id_task_templates_id_fk" FOREIGN KEY ("task_template_id") REFERENCES "public"."task_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_templates" ADD CONSTRAINT "task_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_templates" ADD CONSTRAINT "task_templates_kpi_id_kpis_id_fk" FOREIGN KEY ("kpi_id") REFERENCES "public"."kpis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_updates" ADD CONSTRAINT "task_updates_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_updates" ADD CONSTRAINT "task_updates_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "financial_prizes_organization_id_idx" ON "financial_prizes" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "financial_prizes_project_id_idx" ON "financial_prizes" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "financial_prizes_game_id_idx" ON "financial_prizes" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "financial_prizes_user_id_idx" ON "financial_prizes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "financial_prizes_period_idx" ON "financial_prizes" USING btree ("period");--> statement-breakpoint
CREATE INDEX "games_organization_id_idx" ON "games" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "games_project_id_idx" ON "games" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "games_status_idx" ON "games" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_roles_organization_id_idx" ON "job_roles" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "kaizen_comments_kaizen_id_idx" ON "kaizen_comments" USING btree ("kaizen_id");--> statement-breakpoint
CREATE INDEX "kaizen_comments_user_id_idx" ON "kaizen_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "kaizen_ideas_organization_id_idx" ON "kaizen_ideas" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "kaizen_ideas_project_id_idx" ON "kaizen_ideas" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "kaizen_ideas_game_id_idx" ON "kaizen_ideas" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "kaizen_ideas_status_idx" ON "kaizen_ideas" USING btree ("status");--> statement-breakpoint
CREATE INDEX "kaizen_types_organization_id_idx" ON "kaizen_types" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "kaizens_organization_id_idx" ON "kaizens" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "kaizens_project_id_idx" ON "kaizens" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "kaizens_game_id_idx" ON "kaizens" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "kaizens_leader_id_idx" ON "kaizens" USING btree ("leader_id");--> statement-breakpoint
CREATE INDEX "kaizens_team_id_idx" ON "kaizens" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "kaizens_status_idx" ON "kaizens" USING btree ("status");--> statement-breakpoint
CREATE INDEX "kpis_organization_id_idx" ON "kpis" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "leagues_game_id_idx" ON "leagues" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "members_user_id_idx" ON "members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "members_organization_id_idx" ON "members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "members_role_idx" ON "members" USING btree ("role");--> statement-breakpoint
CREATE INDEX "organization_configs_organization_id_idx" ON "organization_configs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_kaizen_configs_organization_id_idx" ON "org_kaizen_configs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "prizes_organization_id_idx" ON "prizes" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sectors_organization_id_idx" ON "sectors" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organizations_owner_id_idx" ON "organizations" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "game_kaizen_points_game_idx" ON "game_kaizen_points" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "game_task_points_game_idx" ON "game_task_points" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "team_game_points_team_idx" ON "team_game_points" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_game_points_game_idx" ON "team_game_points" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "team_kaizen_points_pk" ON "team_kaizen_points" USING btree ("team_id","game_id");--> statement-breakpoint
CREATE INDEX "team_kaizen_points_team_idx" ON "team_kaizen_points" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_kaizen_points_game_idx" ON "team_kaizen_points" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "team_task_points_pk" ON "team_task_points" USING btree ("team_id","game_id");--> statement-breakpoint
CREATE INDEX "team_task_points_team_idx" ON "team_task_points" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_task_points_game_idx" ON "team_task_points" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "user_game_points_user_idx" ON "user_game_points" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_game_points_game_idx" ON "user_game_points" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "user_kaizen_points_pk" ON "user_kaizen_points" USING btree ("user_id","game_id");--> statement-breakpoint
CREATE INDEX "user_kaizen_points_user_idx" ON "user_kaizen_points" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_kaizen_points_game_idx" ON "user_kaizen_points" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "user_task_points_pk" ON "user_task_points" USING btree ("user_id","game_id");--> statement-breakpoint
CREATE INDEX "user_task_points_user_idx" ON "user_task_points" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_task_points_game_idx" ON "user_task_points" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "projects_organization_id_idx" ON "projects" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_active_game_id_idx" ON "projects" USING btree ("active_game_id");--> statement-breakpoint
CREATE INDEX "tasks_game_id_idx" ON "tasks" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_team_id_idx" ON "tasks" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "tasks_user_id_idx" ON "tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tasks_kpi_id_idx" ON "tasks" USING btree ("kpi_id");--> statement-breakpoint
CREATE INDEX "tasks_task_manager_id_idx" ON "tasks" USING btree ("task_manager_id");--> statement-breakpoint
CREATE INDEX "tasks_manager_id_idx" ON "tasks" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "teams_organization_id_idx" ON "teams" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "teams_manager_id_idx" ON "teams" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_custom_id_idx" ON "users" USING btree ("custom_id");--> statement-breakpoint
CREATE INDEX "web_notifications_user_id_idx" ON "web_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "web_notifications_organization_id_idx" ON "web_notifications" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "web_notifications_status_idx" ON "web_notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "web_notifications_created_date_idx" ON "web_notifications" USING btree ("created_date");