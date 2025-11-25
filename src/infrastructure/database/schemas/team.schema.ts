// Schema Drizzle para Team
// Mapeia TeamEntity para tabela PostgreSQL

import {
  index,
  integer,
  json,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const teams = pgTable(
  "teams",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    managerId: uuid("manager_id"),
    fieldOfAction: varchar("field_of_action", { length: 255 }),
    members: json("members").$type<string[]>(),
    sequence: integer("sequence").notNull().default(0),
    photo: text("photo"),
    color: varchar("color", { length: 50 }),
    description: text("description"),
  },
  (table) => ({
    organizationIdx: index("teams_organization_id_idx").on(
      table.organizationId,
    ),
    managerIdx: index("teams_manager_id_idx").on(table.managerId),
  }),
);

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
