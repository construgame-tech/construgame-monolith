import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export interface FinancialPrizeDetails {
  laborCost?: number;
  kpiMultiplier?: number;
  taskPoints?: number;
  kaizenPoints?: number;
}

export const financialPrizes = pgTable(
  "financial_prizes",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    projectId: text("project_id").notNull(),
    gameId: text("game_id").notNull(),
    userId: text("user_id").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    period: text("period").notNull(),
    calculatedAt: timestamp("calculated_at", { mode: "string" }).notNull(),
    details: jsonb("details").$type<FinancialPrizeDetails>(),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    organizationIdIdx: index("financial_prizes_organization_id_idx").on(
      table.organizationId,
    ),
    projectIdIdx: index("financial_prizes_project_id_idx").on(table.projectId),
    gameIdIdx: index("financial_prizes_game_id_idx").on(table.gameId),
    userIdIdx: index("financial_prizes_user_id_idx").on(table.userId),
    periodIdx: index("financial_prizes_period_idx").on(table.period),
  }),
);
