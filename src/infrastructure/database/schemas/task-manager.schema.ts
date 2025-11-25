import {
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { games } from "./game.schema";
import { kpis } from "./kpi.schema";
import { organizations } from "./organization.schema";
import { projects } from "./project.schema";

// Task Manager Responsible Type
export type TaskManagerResponsibleType = "team" | "player";

export type TaskManagerResponsible = {
  type: TaskManagerResponsibleType;
  ids: string[];
};

// Task Manager Recurrence (dias da semana)
export type TaskManagerRecurrence = {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
};

// Task Manager Schedule
export type TaskManagerSchedule = {
  startDate: string;
  endDate: string;
  recurrence?: TaskManagerRecurrence;
};

// Task Manager Macrostep Reference
export type TaskManagerMacrostep = {
  macrostepId: string;
  activityId: string;
};

// Task Manager Checklist Item
export type TaskManagerChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

// Task Manager Task Reference
export type TaskManagerTask = {
  id: string;
  progressAbsolute: number;
};

// Tabela de Task Managers
export const taskManagers = pgTable("task_managers", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  kpiId: uuid("kpi_id")
    .notNull()
    .references(() => kpis.id, { onDelete: "cascade" }),
  macrostep: jsonb("macrostep").$type<TaskManagerMacrostep>(),
  name: text("name").notNull(),
  rewardPoints: real("reward_points").notNull(),
  location: text("location"),
  description: text("description"),
  measurementUnit: text("measurement_unit"),
  totalMeasurementExpected: text("total_measurement_expected"),
  videoUrl: text("video_url"),
  embedVideoUrl: text("embed_video_url"),
  responsible: jsonb("responsible").$type<TaskManagerResponsible>().notNull(),
  schedule: jsonb("schedule").$type<TaskManagerSchedule>().notNull(),
  checklist: jsonb("checklist").$type<TaskManagerChecklistItem[]>(),
  progressAbsolute: real("progress_absolute").notNull().default(0),
  tasks: jsonb("tasks").$type<TaskManagerTask[]>().default([]),
  sequence: real("sequence").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
