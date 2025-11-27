import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
} from "drizzle-orm/pg-core";

export interface MissionConfig {
  autoApproveUpdates: boolean;
}

export interface ThemeConfig {
  menu: {
    background: string;
    color: string;
  };
}

export interface AuthConfig {
  login: {
    email: boolean;
    microsoftSSO: boolean;
  };
}

export const orgConfigs = pgTable(
  "organization_configs",
  {
    organizationId: text("organization_id").primaryKey(),
    missionsEnabled: boolean("missions_enabled").notNull(),
    financialEnabled: boolean("financial_enabled").notNull(),
    kaizensEnabled: boolean("kaizens_enabled").notNull(),
    projectDiaryEnabled: boolean("project_diary_enabled"),
    missionConfig: jsonb("mission_config").$type<MissionConfig>(),
    theme: jsonb("theme").notNull().$type<ThemeConfig>(),
    auth: jsonb("auth").notNull().$type<AuthConfig>(),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    organizationIdIdx: index("organization_configs_organization_id_idx").on(
      table.organizationId,
    ),
  }),
);

export const sectors = pgTable(
  "sectors",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    name: text("name").notNull(),
  },
  (table) => ({
    organizationIdIdx: index("sectors_organization_id_idx").on(
      table.organizationId,
    ),
  }),
);

export interface CategoryPoints {
  points: number;
  description?: string;
}

export const orgKaizenConfigs = pgTable(
  "org_kaizen_configs",
  {
    organizationId: text("organization_id").primaryKey(),
    categoryPoints: jsonb("category_points").notNull().$type<{
      "1": CategoryPoints;
      "2"?: CategoryPoints;
      "3"?: CategoryPoints;
      "4"?: CategoryPoints;
      "5"?: CategoryPoints;
    }>(),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    organizationIdIdx: index("org_kaizen_configs_organization_id_idx").on(
      table.organizationId,
    ),
  }),
);

export const prizes = pgTable(
  "prizes",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon"),
    photo: text("photo"),
  },
  (table) => ({
    organizationIdIdx: index("prizes_organization_id_idx").on(
      table.organizationId,
    ),
  }),
);
