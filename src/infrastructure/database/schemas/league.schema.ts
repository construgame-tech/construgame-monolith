import {
  index,
  integer,
  jsonb,
  pgTable,
  uuid,
  varchar,
  text,
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
    gameId: uuid("game_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    startDate: varchar("start_date", { length: 30 }),
    endDate: varchar("end_date", { length: 30 }),
    prizes: jsonb("prizes").$type<LeaguePrize[]>(),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    gameIdIdx: index("leagues_game_id_idx").on(table.gameId),
  }),
);
