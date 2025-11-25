// Schema Drizzle para WebNotification
// Mapeia WebNotificationEntity para tabela PostgreSQL

import {
  index,
  json,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export interface KaizenCompletedData {
  kaizenId: string;
  kaizenName: string;
  kaizenLeaderId: string;
  gameId: string;
  gameName: string;
  projectId: string;
  projectName: string;
  leagueId?: string;
  leagueName?: string;
}

export const webNotifications = pgTable(
  "web_notifications",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    organizationId: uuid("organization_id").notNull(),
    status: varchar("status", { length: 20 })
      .notNull()
      .$type<"UNREAD" | "READ">()
      .default("UNREAD"),
    type: varchar("type", { length: 50 }).notNull().$type<"KAIZEN_COMPLETED">(),
    createdDate: varchar("created_date", { length: 30 }).notNull(),
    kaizenCompletedData: json(
      "kaizen_completed_data",
    ).$type<KaizenCompletedData>(),
  },
  (table) => ({
    userIdx: index("web_notifications_user_id_idx").on(table.userId),
    organizationIdx: index("web_notifications_organization_id_idx").on(
      table.organizationId,
    ),
    statusIdx: index("web_notifications_status_idx").on(table.status),
    createdDateIdx: index("web_notifications_created_date_idx").on(
      table.createdDate,
    ),
  }),
);

export type WebNotification = typeof webNotifications.$inferSelect;
export type NewWebNotification = typeof webNotifications.$inferInsert;
