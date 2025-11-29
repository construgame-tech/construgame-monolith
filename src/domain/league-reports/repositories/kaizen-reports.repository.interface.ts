// Interface do repositório de relatórios de Kaizen para Liga
// Define o contrato para busca de dados agregados

import type {
  KaizensAdherenceCount,
  KaizensParticipantsPerProject,
  KaizensPerBenefit,
  KaizensPerPosition,
  KaizensPerProject,
  KaizensPerProjectPerParticipant,
  KaizensPerSector,
  KaizensPerType,
  KaizensPerTypePerProject,
  KaizensPerWeek,
  MostReplicatedKaizen,
} from "../entities/report-types";

export interface KaizenReportFilters {
  organizationId: string;
  projectIds: string[];
  sectorId?: string;
}

export interface KaizenCountersData {
  kaizenCount: number;
  projectCount: number;
  participantCount: number;
}

export interface IKaizenReportsRepository {
  // Busca contadores básicos de kaizen
  getCounters(filters: KaizenReportFilters): Promise<KaizenCountersData>;

  // Busca kaizens agrupados por projeto
  getKaizensPerProject(
    filters: KaizenReportFilters,
  ): Promise<KaizensPerProject[]>;

  // Busca kaizens agrupados por tipo e projeto
  getKaizensPerTypePerProject(
    filters: KaizenReportFilters,
  ): Promise<KaizensPerTypePerProject[]>;

  // Busca kaizens mais replicados
  getMostReplicatedKaizens(
    filters: KaizenReportFilters,
  ): Promise<MostReplicatedKaizen[]>;

  // Busca contagem de participantes por projeto
  getParticipantsPerProject(
    filters: KaizenReportFilters,
  ): Promise<KaizensParticipantsPerProject[]>;

  // Busca dados de aderência por projeto (para cálculo de porcentagem)
  getAdherenceData(
    filters: KaizenReportFilters,
  ): Promise<KaizensAdherenceCount[]>;

  // Busca kaizens por posição/cargo
  getKaizensPerPosition(
    filters: KaizenReportFilters,
  ): Promise<KaizensPerPosition[]>;

  // Busca kaizens por setor
  getKaizensPerSector(
    filters: KaizenReportFilters,
  ): Promise<KaizensPerSector[]>;

  // Busca kaizens por tipo
  getKaizensPerType(filters: KaizenReportFilters): Promise<KaizensPerType[]>;

  // Busca kaizens por benefício (KPI)
  getKaizensPerBenefit(
    filters: KaizenReportFilters,
  ): Promise<KaizensPerBenefit[]>;

  // Busca kaizens por semana
  getKaizensPerWeek(filters: KaizenReportFilters): Promise<KaizensPerWeek[]>;

  // Busca kaizens por projeto por participante
  getKaizensPerProjectPerParticipant(
    filters: KaizenReportFilters,
    userId: string,
  ): Promise<KaizensPerProjectPerParticipant[]>;
}
