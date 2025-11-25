// Schema Drizzle para User
// Mapeia UserEntity para tabela PostgreSQL

import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    password: text("password"),
    authCode: varchar("auth_code", { length: 10 }),
    authCodeExpiresAt: varchar("auth_code_expires_at", { length: 30 }),
    signedTermsOfUse: integer("signed_terms_of_use").$type<0 | 1>().default(0), // boolean como integer (0/1)
    nickname: varchar("nickname", { length: 100 }),
    photo: text("photo"),
    status: varchar("status", { length: 30 })
      .notNull()
      .$type<"WAITING_CONFIRMATION" | "ACTIVE">(),
    passwordRecoveryCode: varchar("password_recovery_code", { length: 100 }),
    passwordRecoveryCodeExpires: varchar("password_recovery_code_expires", {
      length: 30,
    }),
    type: varchar("type", { length: 20 }).$type<"user" | "superuser">(),
    customId: varchar("custom_id", { length: 100 }),
    sequence: integer("sequence").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    phoneIdx: index("users_phone_idx").on(table.phone),
    statusIdx: index("users_status_idx").on(table.status),
    customIdIdx: index("users_custom_id_idx").on(table.customId),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
