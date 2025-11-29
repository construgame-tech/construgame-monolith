// Use Case: Creditar pontos de kaizen a um game
// Regra: Quando um kaizen é aprovado, o game recebe kaizenType.points

import type { IGameKaizenPointsRepository } from "@domain/kaizen-points/repositories/kaizen-points.repository.interface";
import {
  addPointsToGameKaizenPoints,
  createGameKaizenPointsEntity,
  GameKaizenPointsEntity,
} from "@domain/kaizen-points/entities/game-kaizen-points.entity";

export interface CreditGameKaizenPointsInput {
  gameId: string;
  organizationId: string;
  projectId: string;
  pointsToCredit: number;
}

export interface CreditGameKaizenPointsOutput {
  gamePoints: GameKaizenPointsEntity;
}

/**
 * Credita pontos de kaizen a um game.
 *
 * Regra de negócio:
 * - Pontos são creditados quando um kaizen é aprovado
 * - O game recebe kaizenType.points
 * - Precisão de 4 casas decimais
 */
export const creditGameKaizenPoints = async (
  input: CreditGameKaizenPointsInput,
  repository: IGameKaizenPointsRepository,
): Promise<CreditGameKaizenPointsOutput> => {
  const { gameId, organizationId, projectId, pointsToCredit } = input;

  // Busca pontos existentes ou cria novo registro
  const current = await repository.findByGameId(gameId);

  const gamePoints =
    current ??
    createGameKaizenPointsEntity({
      gameId,
      organizationId,
      projectId,
    });

  // Adiciona os pontos de kaizen
  const updated = addPointsToGameKaizenPoints(gamePoints, pointsToCredit);

  await repository.save(updated);

  return { gamePoints: updated };
};
