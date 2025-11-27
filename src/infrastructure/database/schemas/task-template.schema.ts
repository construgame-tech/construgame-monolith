import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { kpis } from "./kpi.schema";
import { organizations } from "./organization.schema";

export const taskTemplates = pgTable("task_templates", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  kpiId: uuid("kpi_id")
    .notNull()
    .references(() => kpis.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  rewardPoints: integer("reward_points").notNull().default(0),
  description: text("description"),
  measurementUnit: text("measurement_unit"),
  totalMeasurementExpected: text("total_measurement_expected"),
});

export const checklistTemplates = pgTable("checklist_templates", {
  id: uuid("id").primaryKey(),
  taskTemplateId: uuid("task_template_id")
    .notNull()
    .references(() => taskTemplates.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  order: integer("order").notNull().default(0),
});
