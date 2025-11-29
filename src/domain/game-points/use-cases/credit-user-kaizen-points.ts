// Use Case: Creditar pontos de kaizen a um usuário
// Regra: Quando um kaizen é aprovado, cada responsável recebe kaizenType.points

import {
  createUserGamePointsEntity,
  UserGamePointsEntity,
} from "../entities/game-points.entity";
import { IUserGamePointsRepository } from "../repositories/game-points.repository.interface";

export interface CreditUserKaizenPointsInput {
  userId: string;
  gameId: string;
  organizationId: string;
  projectId: string;
  pointsToCredit: number;
}

export interface CreditUserKaizenPointsOutput {
  userPoints: UserGamePointsEntity;
}

/**
 * Credita pontos de kaizen a um usuário.
 *
 * Regra de negócio:
 * - Pontos são creditados quando um kaizen é aprovado
 * - Cada responsável (player) recebe kaizenType.points
 * - Precisão de 4 casas decimais
 */
export const creditUserKaizenPoints = async (
  input: CreditUserKaizenPointsInput,
  repository: IUserGamePointsRepository,
): Promise<CreditUserKaizenPointsOutput> => {
  const { userId, gameId, organizationId, projectId, pointsToCredit } = input;

  // Busca pontos existentes ou cria novo registro
  const current = await repository.findByUserAndGame(userId, gameId);

  const userPoints =
    current ??
    createUserGamePointsEntity({
      userId,
      gameId,
      organizationId,
      projectId,
    });

  // Adiciona os pontos de kaizen com precisão de 4 decimais
  const newKaizenPoints =
    Math.round((userPoints.kaizenPoints + pointsToCredit) * 10000) / 10000;

  const updated: UserGamePointsEntity = {
    ...userPoints,
    kaizenPoints: newKaizenPoints,
    totalPoints:
      Math.round((userPoints.taskPoints + newKaizenPoints) * 10000) / 10000,
  };

  await repository.save(updated);

  return { userPoints: updated };
};
