// Schema Drizzle para Member
// Mapeia MemberEntity para tabela PostgreSQL

import {
  index,
  integer,
  pgTable,
  primaryKey,
  real,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const members = pgTable(
  "members",
  {
    userId: uuid("user_id").notNull(),
    organizationId: uuid("organization_id").notNull(),
    role: varchar("role", { length: 20 })
      .notNull()
      .$type<"owner" | "admin" | "manager" | "player" | "financial">(),
    sectorId: uuid("sector_id"),
    sector: varchar("sector", { length: 255 }),
    position: varchar("position", { length: 255 }),
    sequence: integer("sequence").notNull().default(0),

    // Job role data
    jobRoleId: uuid("job_role_id"),
    jobRoleVariantId: uuid("job_role_variant_id"),
    salary: real("salary"),
    seniority: varchar("seniority", { length: 50 }),
    state: varchar("state", { length: 100 }),
    hoursPerDay: real("hours_per_day"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.organizationId] }),
    userIdx: index("members_user_id_idx").on(table.userId),
    organizationIdx: index("members_organization_id_idx").on(
      table.organizationId,
    ),
    roleIdx: index("members_role_idx").on(table.role),
  }),
);

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
