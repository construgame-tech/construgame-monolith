import { pgTable, text } from "drizzle-orm/pg-core";

export const kpis = pgTable("kpis", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  photo: text("photo"),
});
