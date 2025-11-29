// Use Case: Obter contadores de Kaizen para uma liga
// Lógica de negócio pura para calcular métricas de kaizen

import type { KaizenCounters } from "../entities/report-types";
import type { IKaizenReportsRepository } from "../repositories/kaizen-reports.repository.interface";
import type { ILeagueDataRepository } from "../repositories/league-data.repository.interface";

export interface GetKaizenCountersInput {
  organizationId: string;
  leagueId: string;
  sectorId?: string;
  projectId?: string;
}

export interface GetKaizenCountersOutput {
  counters: KaizenCounters;
}

/**
 * Calcula os contadores de kaizen para uma liga
 *
 * Regras de negócio:
 * - Se projectId for informado, filtra apenas esse projeto
 * - kaizensPerProject = kaizenCount / projectCount (ou 0 se não houver projetos)
 * - kaizensPerParticipant = kaizenCount / participantCount (ou 0 se não houver participantes)
 */
export const getKaizenCounters = async (
  input: GetKaizenCountersInput,
  leagueDataRepository: ILeagueDataRepository,
  kaizenReportsRepository: IKaizenReportsRepository,
): Promise<GetKaizenCountersOutput> => {
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
        kaizenCount: 0,
        projectCount: 0,
        kaizensPerProject: 0,
        kaizensPerParticipant: 0,
        kaizensPlayers: 0,
      },
    };
  }

  // Busca os dados do repositório
  const data = await kaizenReportsRepository.getCounters({
    organizationId: input.organizationId,
    projectIds,
    sectorId: input.sectorId,
  });

  // Calcula as métricas de negócio
  const kaizensPerProject =
    data.projectCount > 0
      ? Math.round((data.kaizenCount / data.projectCount) * 100) / 100
      : 0;

  const kaizensPerParticipant =
    data.participantCount > 0
      ? Math.round((data.kaizenCount / data.participantCount) * 100) / 100
      : 0;

  return {
    counters: {
      kaizenCount: data.kaizenCount,
      projectCount: data.projectCount,
      kaizensPerProject,
      kaizensPerParticipant,
      kaizensPlayers: data.participantCount,
    },
  };
};
