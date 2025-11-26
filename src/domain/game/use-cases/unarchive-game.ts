// Use Case: Desarquivar um game

import { GameEntity, unarchiveGameEntity } from "../entities/game.entity";
import { IGameRepository } from "../repositories/game.repository.interface";

export interface UnarchiveGameInput {
  organizationId: string;
  gameId: string;
}

export interface UnarchiveGameOutput {
  game: GameEntity;
}

export const unarchiveGame = async (
  input: UnarchiveGameInput,
  gameRepository: IGameRepository,
): Promise<UnarchiveGameOutput> => {
  // Busca o game atual
  const game = await gameRepository.findById(
    input.organizationId,
    input.gameId,
  );

  if (!game) {
    throw new Error(`Game not found: ${input.gameId}`);
  }

  // Desarquiva o game
  const unarchivedGame = unarchiveGameEntity(game);

  // Persiste no repositório
  await gameRepository.save(unarchivedGame);

  return { game: unarchivedGame };
};
