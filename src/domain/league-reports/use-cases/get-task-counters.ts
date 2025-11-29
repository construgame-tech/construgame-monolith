// Use Case: Obter contadores de Tasks para uma liga
// Lógica de negócio pura para calcular métricas de tasks

import type { TaskCounters } from "../entities/report-types";
import type { ILeagueDataRepository } from "../repositories/league-data.repository.interface";
import type { ITaskReportsRepository } from "../repositories/task-reports.repository.interface";

export interface GetTaskCountersInput {
  organizationId: string;
  leagueId: string;
  sectorId?: string;
  projectId?: string;
}

export interface GetTaskCountersOutput {
  counters: TaskCounters;
}

/**
 * Calcula os contadores de tasks para uma liga
 *
 * Regras de negócio:
 * - taskPlayers = número de tasks atribuídas a jogadores individuais
 * - taskTeams = número de tasks atribuídas apenas a times (sem jogador)
 * - participantPlayers = número de jogadores distintos com tasks
 * - participantTeams = número de times distintos com tasks
 */
export const getTaskCounters = async (
  input: GetTaskCountersInput,
  leagueDataRepository: ILeagueDataRepository,
  taskReportsRepository: ITaskReportsRepository,
): Promise<GetTaskCountersOutput> => {
  // Obtém os projetos da liga
  const projectIds = input.projectId
    ? [input.projectId]
    : await leagueDataRepository.getProjectIds(
        input.organizationId,
        input.leagueId,
      );

  // Se não há projetos, retorna contadores zerados
  if (projectIds.length === 0) {
    return {
      counters: {
        projectCount: 0,
        taskPlayers: 0,
        taskTeams: 0,
        participantPlayers: 0,
        participantTeams: 0,
      },
    };
  }

  // Busca os games dos projetos
  const gameIds = await leagueDataRepository.getGameIds(
    input.organizationId,
    projectIds,
  );

  // Se não há games, retorna apenas a contagem de projetos
  if (gameIds.length === 0) {
    return {
      counters: {
        projectCount: projectIds.length,
        taskPlayers: 0,
        taskTeams: 0,
        participantPlayers: 0,
        participantTeams: 0,
      },
    };
  }

  // Busca os dados do repositório
  const data = await taskReportsRepository.getCounters({
    organizationId: input.organizationId,
    gameIds,
    sectorId: input.sectorId,
  });

  return {
    counters: {
      projectCount: projectIds.length,
      taskPlayers: data.playerTaskCount,
      taskTeams: data.teamTaskCount,
      participantPlayers: data.distinctPlayerCount,
      participantTeams: data.distinctTeamCount,
    },
  };
};
