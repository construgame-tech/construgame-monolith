// Use Case: Creditar pontos de task a um usuário

import {
  UserGamePointsEntity,
  createUserGamePointsEntity,
} from "../entities/game-points.entity";
import { IUserGamePointsRepository } from "../repositories/game-points.repository.interface";

export interface CreditUserTaskPointsInput {
  userId: string;
  gameId: string;
  organizationId: string;
  projectId: string;
  pointsToCredit: number;
}

export interface CreditUserTaskPointsOutput {
  userPoints: UserGamePointsEntity;
}

export const creditUserTaskPoints = async (
  input: CreditUserTaskPointsInput,
  repository: IUserGamePointsRepository,
): Promise<CreditUserTaskPointsOutput> => {
  const { userId, gameId, organizationId, projectId, pointsToCredit } = input;

  // Busca pontos existentes ou cria novo registro
  const current = await repository.findByUserAndGame(userId, gameId);

  const userPoints = current ?? createUserGamePointsEntity({
    userId,
    gameId,
    organizationId,
    projectId,
  });

  // Adiciona os pontos de task
  const updated: UserGamePointsEntity = {
    ...userPoints,
    taskPoints: userPoints.taskPoints + pointsToCredit,
    totalPoints: userPoints.taskPoints + pointsToCredit + userPoints.kaizenPoints,
  };

  await repository.save(updated);

  return { userPoints: updated };
};
