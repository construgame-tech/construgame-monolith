// Tipos de dados para relatórios de liga
// Representa os resultados calculados dos relatórios

// === Kaizen Reports ===

export interface KaizenCounters {
  kaizenCount: number;
  projectCount: number;
  kaizensPerProject: number;
  kaizensPerParticipant: number;
  kaizensPlayers: number;
}

export interface KaizensPerProject {
  projectId: string;
  projectName: string;
  kaizenCount: number;
}

export interface KaizensPerTypePerProject {
  kaizenTypeId: string;
  name: string;
  projects: {
    id: string;
    name: string;
    kaizenCount: number;
  }[];
}

export interface MostReplicatedKaizen {
  id: string;
  name: string;
  photo?: string;
  replicationCount: number;
  kaizenTypeId?: string;
  benefits: { kpiId: string; description?: string }[];
}

export interface KaizensParticipantsPerProject {
  projectId: string;
  projectName: string;
  participantCount: number;
}

export interface KaizensAdherencePercentage {
  projectId: string;
  name: string;
  adherence: number;
}

export interface KaizensAdherenceCount {
  projectId: string;
  name: string;
  possibleCount: number;
  executedCount: number;
}

export interface KaizensPerPosition {
  position: string | null;
  kaizenCount: number;
}

export interface KaizensPerSector {
  sector: string | null;
  kaizenCount: number;
}

export interface KaizensPerType {
  kaizenTypeId: string;
  name: string;
  kaizenCount: number;
}

export interface KaizensPerBenefit {
  kpiId: string;
  kaizenCount: number;
}

export interface KaizensPerWeek {
  weekStart: string;
  weekEnd: string;
  kaizenCount: number;
}

export interface KaizensPerProjectPerParticipant {
  projectId: string;
  projectName: string;
  kaizenCount: number;
}

// === Task Reports ===

export interface TaskCounters {
  projectCount: number;
  taskPlayers: number;
  taskTeams: number;
  participantPlayers: number;
  participantTeams: number;
}

export interface TaskPerformancePerProject {
  projectName: string;
  [kpiId: string]: string | number; // Dynamic KPI keys with percentage values
}

export interface TaskPerformancePerGame {
  gameId: string;
  gameName: string;
  projectName: string;
  kpis: Record<string, number>;
}

export interface TaskBestPlayer {
  progressPercent: number;
  kpiId: string;
  playerName: string;
  playerPhoto?: string;
  userId: string;
  teamName: string;
  teamPhoto?: string;
  teamId: string;
}
