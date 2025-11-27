import {
  date,
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { games } from "./game.schema";
import { tasks } from "./task.schema";

export const taskUpdates = pgTable("task_updates", {
  id: uuid("id").primaryKey(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull().default("PENDING_REVIEW"),
  submittedBy: uuid("submitted_by").notNull(),
  reviewedBy: uuid("reviewed_by"),
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
