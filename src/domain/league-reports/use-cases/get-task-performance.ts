// Use Case: Obter relatórios de performance de Tasks
// Agrupa performance por projeto e por game

import type {
  TaskBestPlayer,
  TaskPerformancePerGame,
  TaskPerformancePerProject,
} from "../entities/report-types";
import type { ILeagueDataRepository } from "../repositories/league-data.repository.interface";
import type { ITaskReportsRepository } from "../repositories/task-reports.repository.interface";

export interface GetTaskPerformanceInput {
  organizationId: string;
  leagueId: string;
  sectorId?: string;
  projectId?: string;
}

// === Performance por Projeto ===
export interface GetTaskPerformancePerProjectOutput {
  items: TaskPerformancePerProject[];
}

export const getTaskPerformancePerProject = async (
  input: GetTaskPerformanceInput,
  leagueDataRepository: ILeagueDataRepository,
  taskReportsRepository: ITaskReportsRepository,
): Promise<GetTaskPerformancePerProjectOutput> => {
  const projectIds = input.projectId
    ? [input.projectId]
    : await leagueDataRepository.getProjectIds(
        input.organizationId,
        input.leagueId,
      );

  if (projectIds.length === 0) {
    return { items: [] };
  }

  const gameIds = await leagueDataRepository.getGameIds(
    input.organizationId,
    projectIds,
  );

  if (gameIds.length === 0) {
    return { items: [] };
  }

  const items = await taskReportsRepository.getPerformancePerProject(
    {
      organizationId: input.organizationId,
      gameIds,
      sectorId: input.sectorId,
    },
    projectIds,
  );

  return { items };
};

// === Performance por Game ===
export interface GetTaskPerformancePerGameOutput {
  items: TaskPerformancePerGame[];
}

export const getTaskPerformancePerGame = async (
  input: GetTaskPerformanceInput,
  leagueDataRepository: ILeagueDataRepository,
  taskReportsRepository: ITaskReportsRepository,
): Promise<GetTaskPerformancePerGameOutput> => {
  const projectIds = input.projectId
    ? [input.projectId]
    : await leagueDataRepository.getProjectIds(
        input.organizationId,
        input.leagueId,
      );

  if (projectIds.length === 0) {
    return { items: [] };
  }

  const gameIds = await leagueDataRepository.getGameIds(
    input.organizationId,
    projectIds,
  );

  if (gameIds.length === 0) {
    return { items: [] };
  }

  const items = await taskReportsRepository.getPerformancePerGame({
    organizationId: input.organizationId,
    gameIds,
    sectorId: input.sectorId,
  });

  return { items };
};

// === Melhores Jogadores ===
export interface GetTaskBestPlayersOutput {
  items: TaskBestPlayer[];
}

export const getTaskBestPlayers = async (
  input: GetTaskPerformanceInput,
  leagueDataRepository: ILeagueDataRepository,
  taskReportsRepository: ITaskReportsRepository,
): Promise<GetTaskBestPlayersOutput> => {
  const projectIds = input.projectId
    ? [input.projectId]
    : await leagueDataRepository.getProjectIds(
        input.organizationId,
        input.leagueId,
      );

  if (projectIds.length === 0) {
    return { items: [] };
  }

  const gameIds = await leagueDataRepository.getGameIds(
    input.organizationId,
    projectIds,
  );

  if (gameIds.length === 0) {
    return { items: [] };
  }

  const items = await taskReportsRepository.getBestPlayers({
    organizationId: input.organizationId,
    gameIds,
    sectorId: input.sectorId,
  });

  return { items };
};
