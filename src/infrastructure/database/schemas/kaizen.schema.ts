import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const kaizenStatusEnum = [
  "ACTIVE",
  "DONE",
  "APPROVED",
  "ARCHIVED",
] as const;

export interface KaizenTask {
  name: string;
  isComplete: boolean;
  responsibleId: string;
  endDate?: string;
  budget?: number;
}

export interface KaizenBenefit {
  kpiId: string;
  description?: string;
}

export interface KaizenAttachment {
  name: string;
  size: number;
  filetype: string;
  createdAt: string;
  url: string;
}

export interface KaizenResponsibles {
  players?: string[];
  teams?: string[];
}

export const kaizens = pgTable(
  "kaizens",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    projectId: text("project_id").notNull(),
    gameId: text("game_id").notNull(),
    status: text("status").notNull().$type<(typeof kaizenStatusEnum)[number]>(),
    name: text("name").notNull(),
    createdDate: timestamp("created_date", { mode: "string" }).notNull(),
    updatedDate: timestamp("updated_date", { mode: "string" }),
    sequence: integer("sequence").notNull().default(0),

    // Campos opcionais
    originalKaizenId: text("original_kaizen_id"),
    leaderId: text("leader_id"),
    teamId: text("team_id"),
    category: integer("category"),

    // Campos atuais
    kaizenTypeId: text("kaizen_type_id"),
    kaizenIdeaId: text("kaizen_idea_id"),
    responsibles: jsonb("responsibles").$type<KaizenResponsibles>(),

    // Descrição do problema e solução
    currentSituation: text("current_situation"),
    currentSituationImages: jsonb("current_situation_images").$type<string[]>(),
    solution: text("solution"),
    solutionImages: jsonb("solution_images").$type<string[]>(),

    // Tarefas e benefícios
    tasks: jsonb("tasks").$type<KaizenTask[]>(),
    benefits: jsonb("benefits").$type<KaizenBenefit[]>(),

    // Recursos e arquivos
    resources: text("resources"),
    files: jsonb("files").$type<string[]>(),
    attachments: jsonb("attachments").$type<KaizenAttachment[]>(),

    // Replicação
    replicas: jsonb("replicas").$type<string[]>(),
  },
  (table) => ({
    organizationIdIdx: index("kaizens_organization_id_idx").on(
      table.organizationId,
    ),
    projectIdIdx: index("kaizens_project_id_idx").on(table.projectId),
    gameIdIdx: index("kaizens_game_id_idx").on(table.gameId),
    leaderIdIdx: index("kaizens_leader_id_idx").on(table.leaderId),
    teamIdIdx: index("kaizens_team_id_idx").on(table.teamId),
    statusIdx: index("kaizens_status_idx").on(table.status),
  }),
);
