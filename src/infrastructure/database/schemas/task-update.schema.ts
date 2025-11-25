import {
  date,
  integer,
  jsonb,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { games } from "./game.schema";
import { tasks } from "./task.schema";

export const taskUpdates = pgTable("task_updates", {
  id: varchar("id", { length: 255 }).primaryKey(),
  gameId: varchar("game_id", { length: 255 })
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  taskId: varchar("task_id", { length: 255 })
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull().default("PENDING_REVIEW"),
  submittedBy: varchar("submitted_by", { length: 255 }).notNull(),
  reviewedBy: varchar("reviewed_by", { length: 255 }),
  reviewNote: text("review_note"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  participants: jsonb("participants").$type<string[]>(),
  photos: jsonb("photos").$type<string[]>(),
  progress: jsonb("progress").notNull(),
  checklist: jsonb("checklist"),
  files: jsonb("files"),
  sequence: integer("sequence").notNull().default(0),
});
