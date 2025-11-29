// Use Case: Creditar pontos de kaizen a um time
// Regra: Quando um kaizen é aprovado, times responsáveis recebem kaizenType.points

import {
  createTeamGamePointsEntity,
  TeamGamePointsEntity,
} from "../entities/game-points.entity";
import { ITeamGamePointsRepository } from "../repositories/game-points.repository.interface";

export interface CreditTeamKaizenPointsInput {
  teamId: string;
  gameId: string;
  organizationId: string;
  projectId: string;
  pointsToCredit: number;
}

export interface CreditTeamKaizenPointsOutput {
  teamPoints: TeamGamePointsEntity;
}

/**
 * Credita pontos de kaizen a um time.
 *
 * Regra de negócio:
 * - Pontos são creditados quando um kaizen é aprovado
 * - Cada time responsável recebe kaizenType.points
 * - Precisão de 4 casas decimais
 */
export const creditTeamKaizenPoints = async (
  input: CreditTeamKaizenPointsInput,
  repository: ITeamGamePointsRepository,
): Promise<CreditTeamKaizenPointsOutput> => {
  const { teamId, gameId, organizationId, projectId, pointsToCredit } = input;

  // Busca pontos existentes ou cria novo registro
  const current = await repository.findByTeamAndGame(teamId, gameId);

  const teamPoints =
    current ??
    createTeamGamePointsEntity({
      teamId,
      gameId,
      organizationId,
      projectId,
    });

  // Adiciona os pontos de kaizen com precisão de 4 decimais
  const newKaizenPoints =
    Math.round((teamPoints.kaizenPoints + pointsToCredit) * 10000) / 10000;

  const updated: TeamGamePointsEntity = {
    ...teamPoints,
    kaizenPoints: newKaizenPoints,
    totalPoints:
      Math.round((teamPoints.taskPoints + newKaizenPoints) * 10000) / 10000,
  };

  await repository.save(updated);

  return { teamPoints: updated };
};
