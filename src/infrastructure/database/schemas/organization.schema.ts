// Schema Drizzle para Organization
// Mapeia OrganizationEntity para tabela PostgreSQL

import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey(),
    ownerId: uuid("owner_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    photo: text("photo"),
    sequence: integer("sequence").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    ownerIdIdx: index("organizations_owner_id_idx").on(table.ownerId),
  }),
);

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
