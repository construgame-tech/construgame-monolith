import {
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { organizations } from "./organization.schema";
import { projects } from "./project.schema";

// Tabela de Game Managers - planejamento de jogos
export const gameManagers = pgTable("game_managers", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  photo: text("photo"),
  objective: text("objective"),
  updateFrequency: integer("update_frequency"),
  managerId: uuid("manager_id"),
  responsibles: jsonb("responsibles").$type<string[]>(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  gameLength: integer("game_length"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela de Tasks dentro de Game Managers
export const gameManagerTasks = pgTable("game_manager_tasks", {
  id: uuid("id").primaryKey(),
  gameManagerId: uuid("game_manager_id")
    .notNull()
    .references(() => gameManagers.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  kpiId: uuid("kpi_id"),
  description: text("description"),
  rewardPoints: real("reward_points"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
