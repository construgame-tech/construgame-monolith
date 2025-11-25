import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export interface JobRoleVariant {
  id: string;
  salary?: number;
  seniority?: string;
  state?: string;
  hoursPerDay?: number;
}

export const jobRoles = pgTable(
  "job_roles",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    name: text("name").notNull(),
    variants: jsonb("variants").notNull().$type<JobRoleVariant[]>(),
    updatedBy: text("updated_by"),
    updatedAt: timestamp("updated_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }),
    createdBy: text("created_by"),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    organizationIdIdx: index("job_roles_organization_id_idx").on(
      table.organizationId,
    ),
  }),
);
