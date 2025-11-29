// Interface do repositório de relatórios de Tasks para Liga
// Define o contrato para busca de dados agregados de tasks

import type {
  TaskBestPlayer,
  TaskPerformancePerGame,
  TaskPerformancePerProject,
} from "../entities/report-types";

export interface TaskReportFilters {
  organizationId: string;
  gameIds: string[];
  sectorId?: string;
}

export interface TaskCountersData {
  playerTaskCount: number;
  teamTaskCount: number;
  distinctPlayerCount: number;
  distinctTeamCount: number;
}

export interface ITaskReportsRepository {
  // Busca contadores de tasks
  getCounters(filters: TaskReportFilters): Promise<TaskCountersData>;

  // Busca performance por projeto agrupado por KPI
  getPerformancePerProject(
    filters: TaskReportFilters,
    projectIds: string[],
  ): Promise<TaskPerformancePerProject[]>;

  // Busca performance por game
  getPerformancePerGame(
    filters: TaskReportFilters,
  ): Promise<TaskPerformancePerGame[]>;

  // Busca melhores jogadores
  getBestPlayers(filters: TaskReportFilters): Promise<TaskBestPlayer[]>;
}
