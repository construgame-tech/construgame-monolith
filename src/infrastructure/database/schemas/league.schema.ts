import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
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
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    responsibleId: text("responsible_id").notNull(),
    status: text("status").notNull().$type<(typeof leagueStatusEnum)[number]>(),
    name: text("name").notNull(),
    photo: text("photo"),
    objective: text("objective"),
    startDate: timestamp("start_date", { mode: "string" }),
    endDate: timestamp("end_date", { mode: "string" }),
    prizes: jsonb("prizes").$type<LeaguePrize[]>(),
    projects: jsonb("projects").$type<string[]>(),
    games: jsonb("games").$type<string[]>(),
    hidden: boolean("hidden"),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    organizationIdIdx: index("leagues_organization_id_idx").on(
      table.organizationId,
    ),
    responsibleIdIdx: index("leagues_responsible_id_idx").on(
      table.responsibleId,
    ),
    statusIdx: index("leagues_status_idx").on(table.status),
  }),
);
