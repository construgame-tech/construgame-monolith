import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const kaizenIdeaStatusEnum = ["DRAFT", "APPROVED", "ARCHIVED"] as const;

export interface KaizenIdeaTask {
  name: string;
}

export interface KaizenIdeaBenefit {
  kpiId: string;
  description?: string;
}

export interface KaizenIdeaAttachment {
  name: string;
  size: number;
  filetype: string;
  createdAt: string;
  url: string;
}

export interface KaizenIdeaAuthors {
  players?: string[];
  teams?: string[];
}

export interface KaizenIdeaProblem {
  description?: string;
  images?: string[];
}

export interface KaizenIdeaSolution {
  description?: string;
  images?: string[];
}

export interface KaizenIdeaNonExecutableProject {
  projectId: string;
  userId?: string;
  justification?: string;
}

export const kaizenIdeas = pgTable(
  "kaizen_ideas",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    projectId: text("project_id"),
    gameId: text("game_id"),
    kaizenTypeId: text("kaizen_type_id"),
    status: text("status")
      .notNull()
      .$type<(typeof kaizenIdeaStatusEnum)[number]>(),
    name: text("name").notNull(),
    isRecommended: boolean("is_recommended"),
    authors: jsonb("authors").$type<KaizenIdeaAuthors>(),
    problem: jsonb("problem").$type<KaizenIdeaProblem>(),
    solution: jsonb("solution").$type<KaizenIdeaSolution>(),
    tasks: jsonb("tasks").$type<KaizenIdeaTask[]>(),
    benefits: jsonb("benefits").$type<KaizenIdeaBenefit[]>(),
    attachments: jsonb("attachments").$type<KaizenIdeaAttachment[]>(),
    createdDate: timestamp("created_date", { mode: "string" }).notNull(),
    updatedDate: timestamp("updated_date", { mode: "string" }),
    sequence: integer("sequence").notNull().default(0),
    executableKaizenProjectIds: jsonb("executable_kaizen_project_ids").$type<
      string[]
    >(),
    nonExecutableProjects: jsonb("non_executable_projects").$type<
      KaizenIdeaNonExecutableProject[]
    >(),
  },
  (table) => ({
    organizationIdIdx: index("kaizen_ideas_organization_id_idx").on(
      table.organizationId,
    ),
    projectIdIdx: index("kaizen_ideas_project_id_idx").on(table.projectId),
    gameIdIdx: index("kaizen_ideas_game_id_idx").on(table.gameId),
    statusIdx: index("kaizen_ideas_status_idx").on(table.status),
  }),
);
