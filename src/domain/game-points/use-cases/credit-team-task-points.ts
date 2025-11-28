// Use Case: Creditar pontos de task a um time

import {
  TeamGamePointsEntity,
  createTeamGamePointsEntity,
} from "../entities/game-points.entity";
import { ITeamGamePointsRepository } from "../repositories/game-points.repository.interface";

export interface CreditTeamTaskPointsInput {
  teamId: string;
  gameId: string;
  organizationId: string;
  projectId: string;
  pointsToCredit: number;
}

export interface CreditTeamTaskPointsOutput {
  teamPoints: TeamGamePointsEntity;
}

export const creditTeamTaskPoints = async (
  input: CreditTeamTaskPointsInput,
  repository: ITeamGamePointsRepository,
): Promise<CreditTeamTaskPointsOutput> => {
  const { teamId, gameId, organizationId, projectId, pointsToCredit } = input;

  // Busca pontos existentes ou cria novo registro
  const current = await repository.findByTeamAndGame(teamId, gameId);

  const teamPoints = current ?? createTeamGamePointsEntity({
    teamId,
    gameId,
    organizationId,
    projectId,
  });

  // Adiciona os pontos de task
  const updated: TeamGamePointsEntity = {
    ...teamPoints,
    taskPoints: teamPoints.taskPoints + pointsToCredit,
    totalPoints: teamPoints.taskPoints + pointsToCredit + teamPoints.kaizenPoints,
  };

  await repository.save(updated);

  return { teamPoints: updated };
};
