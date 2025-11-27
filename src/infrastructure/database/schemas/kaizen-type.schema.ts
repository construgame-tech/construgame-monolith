import { index, integer, pgTable, text } from "drizzle-orm/pg-core";

export const kaizenTypes = pgTable(
  "kaizen_types",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    name: text("name").notNull(),
    rewardPoints: integer("reward_points").notNull(),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    organizationIdIdx: index("kaizen_types_organization_id_idx").on(
      table.organizationId,
    ),
  }),
);
