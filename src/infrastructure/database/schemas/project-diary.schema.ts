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

// Weather types
export type Weather = "SUNNY" | "CLOUDY" | "RAINY";

export type ProjectDiaryWeather = {
  morning?: Weather;
  afternoon?: Weather;
  night?: Weather;
};

// Equipment item
export type ProjectDiaryEquipment = {
  name: string;
  quantity: number;
};

// Manpower item
export type ProjectDiaryManpower = {
  name: string;
  quantity: number;
};

// Tabela de Project Diary (Diário de Obra)
export const projectDiaries = pgTable("project_diaries", {
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD format
  notes: text("notes"),
  weather: jsonb("weather").$type<ProjectDiaryWeather>(),
  equipment: jsonb("equipment").$type<ProjectDiaryEquipment[]>(),
  manpower: jsonb("manpower").$type<ProjectDiaryManpower[]>(),
  indirectManpower: jsonb("indirect_manpower").$type<ProjectDiaryManpower[]>(),
  sequence: real("sequence").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Composite primary key: projectId + date (uma entrada por dia por projeto)
// Nota: Drizzle não suporta composite primary key com pgTable diretamente,
// então usaremos um constraint único no SQL
