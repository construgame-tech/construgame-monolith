import {
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { organizations } from "./organization.schema";
import { projects } from "./project.schema";

// Labor Composition Item
export type LaborCompositionItem = {
  jobRoleId: string;
  jobRoleName: string;
  jobRoleSeniority?: string;
  quantity?: number;
  unitCost?: number;
  hourlyCost?: number | null;
  dailyProductivity?: number;
  laborHours?: number;
  personQuantity?: number;
};

// Prize Range
export type PrizeRange = {
  jobRoleId?: string;
  jobRoleName?: string;
  jobRoleSeniority?: string;
  min?: number;
  max?: number;
  range?: number;
  points?: number;
  prizeAmount?: number;
};

// Prize Productivity
export type PrizeProductivity = {
  jobRoleId?: string;
  jobRoleName?: string;
  jobRoleSeniority?: string;
  productivity?: number;
  unityQuantity?: number;
  points?: number;
  prizeAmount?: number;
};

// Tabela de Macrosteps
export const macrosteps = pgTable("macrosteps", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  progressPercent: real("progress_percent").notNull().default(0),
  sequence: real("sequence").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela de Activities
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  macrostepId: uuid("macrostep_id")
    .notNull()
    .references(() => macrosteps.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  totalMeasurementExpected: text("total_measurement_expected"),
  measurementUnit: text("measurement_unit"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  duration: real("duration"),
  location: text("location"),
  expectedCost: real("expected_cost"),
  progressPercent: real("progress_percent").notNull().default(0),
  trackingValue: real("tracking_value"),
  trackingUnit: text("tracking_unit"),
  laborCompositionList: jsonb("labor_composition_list").$type<
    LaborCompositionItem[]
  >(),
  prizesPerRange: jsonb("prizes_per_range").$type<PrizeRange[]>(),
  prizesPerProductivity: jsonb("prizes_per_productivity").$type<
    PrizeProductivity[]
  >(),
  sequence: real("sequence").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela de Ordenação de Macrosteps
export const macrostepOrders = pgTable("macrostep_orders", {
  projectId: uuid("project_id")
    .primaryKey()
    .references(() => projects.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  macrostepIds: jsonb("macrostep_ids").$type<string[]>().notNull().default([]),
  sequence: real("sequence").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
