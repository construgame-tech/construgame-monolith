import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const kpis = pgTable(
  "kpis",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    unit: text("unit"),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    organizationIdIdx: index("kpis_organization_id_idx").on(table.organizationId),
  }),
);
