import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const kaizenComments = pgTable(
  "kaizen_comments",
  {
    id: text("id").primaryKey(),
    kaizenId: text("kaizen_id").notNull(),
    userId: text("user_id").notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => ({
    kaizenIdIdx: index("kaizen_comments_kaizen_id_idx").on(table.kaizenId),
    userIdIdx: index("kaizen_comments_user_id_idx").on(table.userId),
  }),
);
