// Domain: League Reports
// Exportações públicas do domínio de relatórios de liga

// Entities / Types
export * from "./entities/report-types";

// Repository Interfaces
export type {
  IKaizenReportsRepository,
  KaizenCountersData,
  KaizenReportFilters,
} from "./repositories/kaizen-reports.repository.interface";
export type {
  ILeagueDataRepository,
  LeagueData,
} from "./repositories/league-data.repository.interface";
export type {
  ITaskReportsRepository,
  TaskCountersData,
  TaskReportFilters,
} from "./repositories/task-reports.repository.interface";
export type {
  GetKaizenAdherenceCountOutput,
  GetKaizenAdherenceInput,
  GetKaizenAdherencePercentageOutput,
} from "./use-cases/get-kaizen-adherence";
export {
  getKaizenAdherenceCount,
  getKaizenAdherencePercentage,
} from "./use-cases/get-kaizen-adherence";
export type {
  GetKaizenCountersInput,
  GetKaizenCountersOutput,
} from "./use-cases/get-kaizen-counters";
// Use Cases - Kaizen
export { getKaizenCounters } from "./use-cases/get-kaizen-counters";
export type {
  GetKaizensGroupedInput,
  GetKaizensParticipantsPerProjectOutput,
  GetKaizensPerBenefitOutput,
  GetKaizensPerPositionOutput,
  GetKaizensPerProjectOutput,
  GetKaizensPerProjectPerParticipantInput,
  GetKaizensPerProjectPerParticipantOutput,
  GetKaizensPerSectorOutput,
  GetKaizensPerTypeOutput,
  GetKaizensPerTypePerProjectOutput,
  GetKaizensPerWeekOutput,
  GetMostReplicatedKaizensOutput,
} from "./use-cases/get-kaizens-grouped";
export {
  getKaizensParticipantsPerProject,
  getKaizensPerBenefit,
  getKaizensPerPosition,
  getKaizensPerProject,
  getKaizensPerProjectPerParticipant,
  getKaizensPerSector,
  getKaizensPerType,
  getKaizensPerTypePerProject,
  getKaizensPerWeek,
  getMostReplicatedKaizens,
} from "./use-cases/get-kaizens-grouped";
export type {
  GetTaskCountersInput,
  GetTaskCountersOutput,
} from "./use-cases/get-task-counters";
// Use Cases - Task
export { getTaskCounters } from "./use-cases/get-task-counters";
export type {
  GetTaskBestPlayersOutput,
  GetTaskPerformanceInput,
  GetTaskPerformancePerGameOutput,
  GetTaskPerformancePerProjectOutput,
} from "./use-cases/get-task-performance";
export {
  getTaskBestPlayers,
  getTaskPerformancePerGame,
  getTaskPerformancePerProject,
} from "./use-cases/get-task-performance";
