import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const leagueStatusEnum = [
  "ACTIVE",
  "ARCHIVED",
  "DONE",
  "PAUSED",
] as const;

export interface LeaguePrize {
  prizeId: string;
}

export const leagues = pgTable(
  "leagues",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id"), // Nullable para compatibilidade com dados existentes
    gameId: uuid("game_id"), // Mantido para compatibilidade, mas agora usamos games[]
    responsibleId: uuid("responsible_id"),
    status: varchar("status", { length: 20 })
      .$type<"ACTIVE" | "ARCHIVED" | "DONE" | "PAUSED">()
      .default("ACTIVE"),
    name: varchar("name", { length: 255 }).notNull(),
    photo: text("photo"),
    description: text("description"),
    startDate: varchar("start_date", { length: 30 }),
    endDate: varchar("end_date", { length: 30 }),
    prizes: jsonb("prizes").$type<LeaguePrize[]>(),
    projects: jsonb("projects").$type<string[]>(),
    games: jsonb("games").$type<string[]>(),
    hidden: boolean("hidden").default(false),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    organizationIdIdx: index("leagues_organization_id_idx").on(
      table.organizationId,
    ),
    gameIdIdx: index("leagues_game_id_idx").on(table.gameId),
  }),
);
