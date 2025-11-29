// Use Case: Obter aderência de kaizens por projeto
// Calcula a porcentagem de aderência baseado em kaizens possíveis vs executados

import type {
  KaizensAdherenceCount,
  KaizensAdherencePercentage,
} from "../entities/report-types";
import type { IKaizenReportsRepository } from "../repositories/kaizen-reports.repository.interface";
import type { ILeagueDataRepository } from "../repositories/league-data.repository.interface";

export interface GetKaizenAdherenceInput {
  organizationId: string;
  leagueId: string;
  sectorId?: string;
  projectId?: string;
}

export interface GetKaizenAdherencePercentageOutput {
  items: KaizensAdherencePercentage[];
}

export interface GetKaizenAdherenceCountOutput {
  items: KaizensAdherenceCount[];
}

/**
 * Calcula a porcentagem de aderência de kaizens por projeto
 *
 * Regra de negócio:
 * - adherence = (executedCount / possibleCount) * 100
 * - Se possibleCount = 0, adherence = 0
 */
export const getKaizenAdherencePercentage = async (
  input: GetKaizenAdherenceInput,
  leagueDataRepository: ILeagueDataRepository,
  kaizenReportsRepository: IKaizenReportsRepository,
): Promise<GetKaizenAdherencePercentageOutput> => {
  const projectIds = input.projectId
    ? [input.projectId]
    : await leagueDataRepository.getProjectIds(
        input.organizationId,
        input.leagueId,
      );

  if (projectIds.length === 0) {
    return { items: [] };
  }

  const adherenceData = await kaizenReportsRepository.getAdherenceData({
    organizationId: input.organizationId,
    projectIds,
    sectorId: input.sectorId,
  });

  // Aplica a regra de cálculo de porcentagem
  const items = adherenceData.map((item) => ({
    projectId: item.projectId,
    name: item.name,
    adherence:
      item.possibleCount > 0
        ? Math.round((item.executedCount / item.possibleCount) * 100 * 100) /
          100
        : 0,
  }));

  return { items };
};

/**
 * Retorna os dados brutos de aderência (contagens) por projeto
 */
export const getKaizenAdherenceCount = async (
  input: GetKaizenAdherenceInput,
  leagueDataRepository: ILeagueDataRepository,
  kaizenReportsRepository: IKaizenReportsRepository,
): Promise<GetKaizenAdherenceCountOutput> => {
  const projectIds = input.projectId
    ? [input.projectId]
    : await leagueDataRepository.getProjectIds(
        input.organizationId,
        input.leagueId,
      );

  if (projectIds.length === 0) {
    return { items: [] };
  }

  const items = await kaizenReportsRepository.getAdherenceData({
    organizationId: input.organizationId,
    projectIds,
    sectorId: input.sectorId,
  });

  return { items };
};
