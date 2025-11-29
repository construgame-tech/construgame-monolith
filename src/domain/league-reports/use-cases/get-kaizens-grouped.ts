// Use Case: Obter kaizens agrupados por diferentes dimensões
// Agrupa kaizens por projeto, tipo, setor, posição, benefício, semana

import type {
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
import type { IKaizenReportsRepository } from "../repositories/kaizen-reports.repository.interface";
import type { ILeagueDataRepository } from "../repositories/league-data.repository.interface";

export interface GetKaizensGroupedInput {
  organizationId: string;
  leagueId: string;
  sectorId?: string;
  projectId?: string;
}

// === Kaizens por Projeto ===
export interface GetKaizensPerProjectOutput {
  items: KaizensPerProject[];
}

export const getKaizensPerProject = async (
  input: GetKaizensGroupedInput,
  leagueDataRepository: ILeagueDataRepository,
  kaizenReportsRepository: IKaizenReportsRepository,
): Promise<GetKaizensPerProjectOutput> => {
  const projectIds = input.projectId
    ? [input.projectId]
    : await leagueDataRepository.getProjectIds(
        input.organizationId,
        input.leagueId,
      );

  if (projectIds.length === 0) {
    return { items: [] };
  }

  const items = await kaizenReportsRepository.getKaizensPerProject({
    organizationId: input.organizationId,
    projectIds,
    sectorId: input.sectorId,
  });

  return { items };
};

// === Kaizens por Tipo por Projeto ===
export interface GetKaizensPerTypePerProjectOutput {
  items: KaizensPerTypePerProject[];
}

export const getKaizensPerTypePerProject = async (
  input: GetKaizensGroupedInput,
  leagueDataRepository: ILeagueDataRepository,
  kaizenReportsRepository: IKaizenReportsRepository,
): Promise<GetKaizensPerTypePerProjectOutput> => {
  const projectIds = input.projectId
    ? [input.projectId]
    : await leagueDataRepository.getProjectIds(
        input.organizationId,
        input.leagueId,
      );

  if (projectIds.length === 0) {
    return { items: [] };
  }

  const items = await kaizenReportsRepository.getKaizensPerTypePerProject({
    organizationId: input.organizationId,
    projectIds,
    sectorId: input.sectorId,
  });

  return { items };
};

// === Kaizens Mais Replicados ===
export interface GetMostReplicatedKaizensOutput {
  items: MostReplicatedKaizen[];
}

export const getMostReplicatedKaizens = async (
  input: GetKaizensGroupedInput,
  leagueDataRepository: ILeagueDataRepository,
  kaizenReportsRepository: IKaizenReportsRepository,
): Promise<GetMostReplicatedKaizensOutput> => {
  const projectIds = input.projectId
    ? [input.projectId]
    : await leagueDataRepository.getProjectIds(
        input.organizationId,
        input.leagueId,
      );

  if (projectIds.length === 0) {
    return { items: [] };
  }

  const items = await kaizenReportsRepository.getMostReplicatedKaizens({
    organizationId: input.organizationId,
    projectIds,
    sectorId: input.sectorId,
  });

  return { items };
};

// === Participantes por Projeto ===
export interface GetKaizensParticipantsPerProjectOutput {
  items: KaizensParticipantsPerProject[];
}

export const getKaizensParticipantsPerProject = async (
  input: GetKaizensGroupedInput,
  leagueDataRepository: ILeagueDataRepository,
  kaizenReportsRepository: IKaizenReportsRepository,
): Promise<GetKaizensParticipantsPerProjectOutput> => {
  const projectIds = input.projectId
    ? [input.projectId]
    : await leagueDataRepository.getProjectIds(
        input.organizationId,
        input.leagueId,
      );

  if (projectIds.length === 0) {
    return { items: [] };
  }

  const items = await kaizenReportsRepository.getParticipantsPerProject({
    organizationId: input.organizationId,
    projectIds,
    sectorId: input.sectorId,
  });

  return { items };
};

// === Kaizens por Posição ===
export interface GetKaizensPerPositionOutput {
  items: KaizensPerPosition[];
}

export const getKaizensPerPosition = async (
  input: GetKaizensGroupedInput,
  leagueDataRepository: ILeagueDataRepository,
  kaizenReportsRepository: IKaizenReportsRepository,
): Promise<GetKaizensPerPositionOutput> => {
  const projectIds = input.projectId
    ? [input.projectId]
    : await leagueDataRepository.getProjectIds(
        input.organizationId,
        input.leagueId,
      );

  if (projectIds.length === 0) {
    return { items: [] };
  }

  const items = await kaizenReportsRepository.getKaizensPerPosition({
    organizationId: input.organizationId,
    projectIds,
    sectorId: input.sectorId,
  });

  return { items };
};

// === Kaizens por Setor ===
export interface GetKaizensPerSectorOutput {
  items: KaizensPerSector[];
}

export const getKaizensPerSector = async (
  input: GetKaizensGroupedInput,
  leagueDataRepository: ILeagueDataRepository,
  kaizenReportsRepository: IKaizenReportsRepository,
): Promise<GetKaizensPerSectorOutput> => {
  const projectIds = input.projectId
    ? [input.projectId]
    : await leagueDataRepository.getProjectIds(
        input.organizationId,
        input.leagueId,
      );

  if (projectIds.length === 0) {
    return { items: [] };
  }

  const items = await kaizenReportsRepository.getKaizensPerSector({
    organizationId: input.organizationId,
    projectIds,
    sectorId: input.sectorId,
  });

  return { items };
};

// === Kaizens por Tipo ===
export interface GetKaizensPerTypeOutput {
  items: KaizensPerType[];
}

export const getKaizensPerType = async (
  input: GetKaizensGroupedInput,
  leagueDataRepository: ILeagueDataRepository,
  kaizenReportsRepository: IKaizenReportsRepository,
): Promise<GetKaizensPerTypeOutput> => {
  const projectIds = input.projectId
    ? [input.projectId]
    : await leagueDataRepository.getProjectIds(
        input.organizationId,
        input.leagueId,
      );

  if (projectIds.length === 0) {
    return { items: [] };
  }

  const items = await kaizenReportsRepository.getKaizensPerType({
    organizationId: input.organizationId,
    projectIds,
    sectorId: input.sectorId,
  });

  return { items };
};

// === Kaizens por Benefício ===
export interface GetKaizensPerBenefitOutput {
  items: KaizensPerBenefit[];
}

export const getKaizensPerBenefit = async (
  input: GetKaizensGroupedInput,
  leagueDataRepository: ILeagueDataRepository,
  kaizenReportsRepository: IKaizenReportsRepository,
): Promise<GetKaizensPerBenefitOutput> => {
  const projectIds = input.projectId
    ? [input.projectId]
    : await leagueDataRepository.getProjectIds(
        input.organizationId,
        input.leagueId,
      );

  if (projectIds.length === 0) {
    return { items: [] };
  }

  const items = await kaizenReportsRepository.getKaizensPerBenefit({
    organizationId: input.organizationId,
    projectIds,
    sectorId: input.sectorId,
  });

  return { items };
};

// === Kaizens por Semana ===
export interface GetKaizensPerWeekOutput {
  items: KaizensPerWeek[];
}

export const getKaizensPerWeek = async (
  input: GetKaizensGroupedInput,
  leagueDataRepository: ILeagueDataRepository,
  kaizenReportsRepository: IKaizenReportsRepository,
): Promise<GetKaizensPerWeekOutput> => {
  const projectIds = input.projectId
    ? [input.projectId]
    : await leagueDataRepository.getProjectIds(
        input.organizationId,
        input.leagueId,
      );

  if (projectIds.length === 0) {
    return { items: [] };
  }

  const items = await kaizenReportsRepository.getKaizensPerWeek({
    organizationId: input.organizationId,
    projectIds,
    sectorId: input.sectorId,
  });

  return { items };
};

// === Kaizens por Projeto por Participante ===
export interface GetKaizensPerProjectPerParticipantInput
  extends GetKaizensGroupedInput {
  userId: string;
}

export interface GetKaizensPerProjectPerParticipantOutput {
  items: KaizensPerProjectPerParticipant[];
}

export const getKaizensPerProjectPerParticipant = async (
  input: GetKaizensPerProjectPerParticipantInput,
  leagueDataRepository: ILeagueDataRepository,
  kaizenReportsRepository: IKaizenReportsRepository,
): Promise<GetKaizensPerProjectPerParticipantOutput> => {
  const projectIds = input.projectId
    ? [input.projectId]
    : await leagueDataRepository.getProjectIds(
        input.organizationId,
        input.leagueId,
      );

  if (projectIds.length === 0) {
    return { items: [] };
  }

  const items =
    await kaizenReportsRepository.getKaizensPerProjectPerParticipant(
      {
        organizationId: input.organizationId,
        projectIds,
        sectorId: input.sectorId,
      },
      input.userId,
    );

  return { items };
};
