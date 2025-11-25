import { index, integer, pgTable, text } from "drizzle-orm/pg-core";

export const userGamePoints = pgTable(
  "user_game_points",
  {
    userId: text("user_id").notNull(),
    gameId: text("game_id").notNull(),
    organizationId: text("organization_id").notNull(),
    projectId: text("project_id").notNull(),
    taskPoints: integer("task_points").notNull().default(0),
    kaizenPoints: integer("kaizen_points").notNull().default(0),
    totalPoints: integer("total_points").notNull().default(0),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    pk: index("user_game_points_pk").on(table.userId, table.gameId),
    userIdx: index("user_game_points_user_idx").on(table.userId),
    gameIdx: index("user_game_points_game_idx").on(table.gameId),
  }),
);

export const teamGamePoints = pgTable(
  "team_game_points",
  {
    teamId: text("team_id").notNull(),
    gameId: text("game_id").notNull(),
    organizationId: text("organization_id").notNull(),
    projectId: text("project_id").notNull(),
    taskPoints: integer("task_points").notNull().default(0),
    kaizenPoints: integer("kaizen_points").notNull().default(0),
    totalPoints: integer("total_points").notNull().default(0),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    pk: index("team_game_points_pk").on(table.teamId, table.gameId),
    teamIdx: index("team_game_points_team_idx").on(table.teamId),
    gameIdx: index("team_game_points_game_idx").on(table.gameId),
  }),
);

export const userKaizenPoints = pgTable(
  "user_kaizen_points",
  {
    userId: text("user_id").notNull(),
    organizationId: text("organization_id").notNull(),
    projectId: text("project_id").notNull(),
    gameId: text("game_id").notNull(),
    points: integer("points").notNull().default(0),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    pk: index("user_kaizen_points_pk").on(table.userId, table.gameId),
    userIdx: index("user_kaizen_points_user_idx").on(table.userId),
    gameIdx: index("user_kaizen_points_game_idx").on(table.gameId),
  }),
);

export const teamKaizenPoints = pgTable(
  "team_kaizen_points",
  {
    teamId: text("team_id").notNull(),
    organizationId: text("organization_id").notNull(),
    projectId: text("project_id").notNull(),
    gameId: text("game_id").notNull(),
    points: integer("points").notNull().default(0),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    pk: index("team_kaizen_points_pk").on(table.teamId, table.gameId),
    teamIdx: index("team_kaizen_points_team_idx").on(table.teamId),
    gameIdx: index("team_kaizen_points_game_idx").on(table.gameId),
  }),
);

export const gameKaizenPoints = pgTable(
  "game_kaizen_points",
  {
    gameId: text("game_id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    projectId: text("project_id").notNull(),
    points: integer("points").notNull().default(0),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    gameIdx: index("game_kaizen_points_game_idx").on(table.gameId),
  }),
);

export const userTaskPoints = pgTable(
  "user_task_points",
  {
    userId: text("user_id").notNull(),
    organizationId: text("organization_id").notNull(),
    projectId: text("project_id").notNull(),
    gameId: text("game_id").notNull(),
    points: integer("points").notNull().default(0),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    pk: index("user_task_points_pk").on(table.userId, table.gameId),
    userIdx: index("user_task_points_user_idx").on(table.userId),
    gameIdx: index("user_task_points_game_idx").on(table.gameId),
  }),
);

export const teamTaskPoints = pgTable(
  "team_task_points",
  {
    teamId: text("team_id").notNull(),
    organizationId: text("organization_id").notNull(),
    projectId: text("project_id").notNull(),
    gameId: text("game_id").notNull(),
    points: integer("points").notNull().default(0),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    pk: index("team_task_points_pk").on(table.teamId, table.gameId),
    teamIdx: index("team_task_points_team_idx").on(table.teamId),
    gameIdx: index("team_task_points_game_idx").on(table.gameId),
  }),
);

export const gameTaskPoints = pgTable(
  "game_task_points",
  {
    gameId: text("game_id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    projectId: text("project_id").notNull(),
    points: integer("points").notNull().default(0),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    gameIdx: index("game_task_points_game_idx").on(table.gameId),
  }),
);
