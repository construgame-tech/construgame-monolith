// Schema Drizzle para Game
// Mapeia GameEntity para tabela PostgreSQL

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

export const games = pgTable(
  "games",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    projectId: uuid("project_id").notNull(),
    status: varchar("status", { length: 20 })
      .notNull()
      .$type<"ACTIVE" | "PAUSED" | "DONE">(),
    name: varchar("name", { length: 255 }).notNull(),
    photo: text("photo"),
    objective: text("objective"),
    updateFrequency: integer("update_frequency"),
    managerId: uuid("manager_id"),
    responsibles: jsonb("responsibles").$type<string[]>(),
    startDate: varchar("start_date", { length: 10 }),
    endDate: varchar("end_date", { length: 10 }),
    prizes:
      jsonb("prizes").$type<
        Array<{
          prizeId: string;
          rankingType?: "player" | "team";
          type?: "points" | "placement";
          value?: number;
        }>
      >(),
    kpis: jsonb("kpis").$type<
      Array<{
        id: string;
        points: number;
      }>
    >(),
    archived: integer("archived").$type<0 | 1>().default(0), // boolean como integer (0/1)
    gameManagerId: uuid("game_manager_id"),
    sequence: integer("sequence").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    organizationIdIdx: index("games_organization_id_idx").on(
      table.organizationId,
    ),
    projectIdIdx: index("games_project_id_idx").on(table.projectId),
    statusIdx: index("games_status_idx").on(table.status),
  }),
);

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
