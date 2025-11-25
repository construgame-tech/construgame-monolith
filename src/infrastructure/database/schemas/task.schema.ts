// Schema Drizzle para Task
// Mapeia TaskEntity para tabela PostgreSQL

import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey(),
    gameId: uuid("game_id").notNull(),
    status: varchar("status", { length: 20 })
      .notNull()
      .$type<"active" | "completed">(),
    name: varchar("name", { length: 255 }).notNull(),
    rewardPoints: integer("reward_points").notNull(),
    isLocked: integer("is_locked").$type<0 | 1>().default(0), // boolean como integer (0/1)
    location: text("location"),
    teamId: uuid("team_id"),
    userId: uuid("user_id"),
    kpiId: uuid("kpi_id"),
    taskManagerId: uuid("task_manager_id"),
    managerId: uuid("manager_id"),
    description: text("description"),
    measurementUnit: varchar("measurement_unit", { length: 100 }),
    totalMeasurementExpected: varchar("total_measurement_expected", {
      length: 100,
    }),
    videoUrl: text("video_url"),
    embedVideoUrl: text("embed_video_url"),
    checklist:
      jsonb("checklist").$type<
        Array<{
          id: string;
          label: string;
          checked: boolean;
        }>
      >(),
    startDate: varchar("start_date", { length: 10 }),
    endDate: varchar("end_date", { length: 10 }),
    progress: jsonb("progress").$type<{
      absolute?: number;
      percent?: number;
      updatedAt: string;
    }>(),
    updates:
      jsonb("updates").$type<
        Array<{
          id: string;
          status: string;
          submittedBy: string;
          submittedAt: string;
          participants?: string[];
          photos?: string[];
          hoursTakenToComplete?: number;
          progress?: number;
          progressPercent?: number;
          progressNote?: string;
          review?: {
            reviwedBy?: string;
            reviwedAt: string;
            reviewNote?: string;
          };
          checklist?: {
            id: string;
            checked: boolean;
          }[];
        }>
      >(),
    pendingReviewUpdates: jsonb("pending_review_updates").$type<{
      count: number;
      progress: number;
    }>(),
    sequence: integer("sequence").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    gameIdIdx: index("tasks_game_id_idx").on(table.gameId),
    statusIdx: index("tasks_status_idx").on(table.status),
    teamIdIdx: index("tasks_team_id_idx").on(table.teamId),
    userIdIdx: index("tasks_user_id_idx").on(table.userId),
    kpiIdIdx: index("tasks_kpi_id_idx").on(table.kpiId),
    taskManagerIdIdx: index("tasks_task_manager_id_idx").on(
      table.taskManagerId,
    ),
    managerIdIdx: index("tasks_manager_id_idx").on(table.managerId),
  }),
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
