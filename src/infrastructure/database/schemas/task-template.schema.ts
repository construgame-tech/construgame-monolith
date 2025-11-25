import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { kpis } from "./kpi.schema";
import { organizations } from "./organization.schema";

export const taskTemplates = pgTable("task_templates", {
  id: varchar("id", { length: 255 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 255 })
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  kpiId: varchar("kpi_id", { length: 255 })
    .notNull()
    .references(() => kpis.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 500 }).notNull(),
  rewardPoints: integer("reward_points").notNull().default(0),
  description: text("description"),
  measurementUnit: varchar("measurement_unit", { length: 100 }),
  totalMeasurementExpected: varchar("total_measurement_expected", {
    length: 100,
  }),
});

export const checklistTemplates = pgTable("checklist_templates", {
  id: varchar("id", { length: 255 }).primaryKey(),
  taskTemplateId: varchar("task_template_id", { length: 255 })
    .notNull()
    .references(() => taskTemplates.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  order: integer("order").notNull().default(0),
});
