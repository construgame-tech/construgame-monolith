// Schema Drizzle para Project
// Mapeia ProjectEntity para tabela PostgreSQL

import {
  index,
  integer,
  json,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export interface ProjectPrize {
  prizeId: string;
}

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    responsibles: json("responsibles").$type<string[]>(),
    status: varchar("status", { length: 20 })
      .notNull()
      .$type<"ACTIVE" | "PAUSED" | "DONE">()
      .default("ACTIVE"),
    activeGameId: uuid("active_game_id"),
    photo: text("photo"),
    type: varchar("type", { length: 100 }),
    state: varchar("state", { length: 100 }),
    city: varchar("city", { length: 255 }),
    startDate: varchar("start_date", { length: 30 }),
    endDate: varchar("end_date", { length: 30 }),
    prizes: json("prizes").$type<ProjectPrize[]>(),
    teams: json("teams").$type<string[]>(),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    organizationIdx: index("projects_organization_id_idx").on(
      table.organizationId,
    ),
    statusIdx: index("projects_status_idx").on(table.status),
    activeGameIdx: index("projects_active_game_id_idx").on(table.activeGameId),
  }),
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
