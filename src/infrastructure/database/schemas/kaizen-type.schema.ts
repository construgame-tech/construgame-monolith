import { index, integer, pgTable, text } from "drizzle-orm/pg-core";

export const kaizenTypes = pgTable(
  "kaizen_types",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    points: integer("points").notNull(),
    ideaPoints: integer("idea_points"),
    ideaExecutionPoints: integer("idea_execution_points"),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    organizationIdIdx: index("kaizen_types_organization_id_idx").on(
      table.organizationId,
    ),
  }),
);
